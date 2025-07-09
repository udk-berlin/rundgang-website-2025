import { SERVER_API_CONFIG, SERVER_AUTH_CONFIG } from '$lib/config.server';
import { json, error } from '@sveltejs/kit';
import { filterCache, enhancedCacheUtils } from '$lib/cache-enhanced';
import {
	externalDataCache,
	type EnrichedLocationData,
	type EnrichedFormatData,
	type EnrichedContextData
} from '$lib/external-data-cache';
import type { RequestHandler } from './$types';
import type { KirbyProjectResponse } from '$lib/api/types/kirby';
import { PROJECT_SELECTS, PROJECT_QUERIES } from '$lib/api/queries/kirby';
import { locationMatchData } from '$lib/data/locations';

// Interfaces for parsed content_field blocks
export interface HeadingContentData {
	level: string; // e.g., "h2", "h3", etc.
	text: string;
}

export interface TextContentData {
	text: string;
}

export interface ImageContentData {
	image: string[]; // Array of image identifiers, e.g., ["file://o7e5zwh3uq7dq7ko"]
	alt: string;
	author?: string;
	license?: string;
}

export interface ContentBlockBase {
	id: string;
	isHidden: boolean;
}

export interface HeadingBlock extends ContentBlockBase {
	type: 'heading';
	content: HeadingContentData;
}

export interface TextBlock extends ContentBlockBase {
	type: 'text';
	content: TextContentData;
}

export interface ImageBlock extends ContentBlockBase {
	type: 'image';
	content: ImageContentData;
}

export type ContentBlock = HeadingBlock | TextBlock | ImageBlock;

// Interface for the raw 'content' object from Kirby, which contains various fields
// This interface might still be useful if dealing with raw content before 'toBlocks'
export interface KirbyProjectContentFields {
	intro_field_intro?: string;
	// location_field_select, content_field, event_field_date_time are now handled at a higher level in KirbyProjectResponse
}

export interface EventDateTimeEntry {
	event_structure_field_date: string;
	event_structure_field_from: string;
	event_structure_field_to: string;
}

export interface ImageEntry {
	url: string;
	uuid?: string;
	alt?: string;
	width?: number;
	height?: number;
}

// Legacy constants for backward compatibility (use centralized queries instead)
const DEFAULT_QUERY = PROJECT_QUERIES.ALL;

// Function to get enriched data from the external data cache
function getEnrichedData(): {
	locations: EnrichedLocationData[];
	formats: EnrichedFormatData[];
	contexts: Map<string, EnrichedContextData>;
} {
	return {
		locations: externalDataCache.getLocations(),
		formats: externalDataCache.getFormats(),
		contexts: externalDataCache.getContexts()
	};
}

// Type for location match entries from the JSON file
interface LocationMatch {
	id: string;
	match: string[];
}

// Location match data - will be loaded dynamically
let enhancementLocationMatch: LocationMatch[] = locationMatchData;

function mapRawLocationToCleanId(rawLocationId: string | null | undefined): string | null {
	if (!rawLocationId) {
		return null;
	}

	try {
		if (!Array.isArray(enhancementLocationMatch)) {
			console.error('enhancementLocationMatch is not an array:', enhancementLocationMatch);
			return rawLocationId;
		}

		// Find the matching entry in the location match file
		const matchEntry = enhancementLocationMatch.find((entry: LocationMatch) => {
			if (!entry || !entry.match || !Array.isArray(entry.match)) {
				return false;
			}
			return entry.match.some(
				(match: string) => match && match.toLowerCase() === rawLocationId.toLowerCase()
			);
		});

		// Return the mapped ID if found, otherwise return null for no match
		if (matchEntry && matchEntry.id) {
			// console.log(`Enhancement: Match found for raw location: ${rawLocationId} -> ${matchEntry.id}`);
			return matchEntry.id;
		}

		console.log(`Enhancement: No match found for raw location: ${rawLocationId}`);
		return null;
	} catch (error) {
		// console.error(`Error in mapRawLocationToCleanId for ID ${rawLocationId}:`, error);
		return null;
	}
}

// Interface for bilingual project response with content support
interface BilingualKirbyProjectResponse extends Omit<KirbyProjectResponse, 'title' | 'content'> {
	title: { de: string; en: string };
	content?: BilingualContentBlock[];
	intro?: { de: string; en: string };
}

// Interface for bilingual content blocks
interface BilingualContentBlock {
	id: string;
	type: string;
	isHidden: boolean;
	content: {
		text?: { de: string; en: string };
		level?: string;
		image?: string[];
		alt?: { de: string; en: string };
		author?: string;
		license?: string;
	};
}

// Function to merge content blocks with intelligent image fallbacks
function mergeContentBlocks(
	deContent: ContentBlock[] = [],
	enContent: ContentBlock[] = []
): BilingualContentBlock[] {
	const mergedContent: BilingualContentBlock[] = [];
	const maxLength = Math.max(deContent.length, enContent.length);

	for (let i = 0; i < maxLength; i++) {
		const deBlock = deContent[i];
		const enBlock = enContent[i];

		// Use the block that exists, or prefer German if both exist
		const baseBlock = deBlock || enBlock;
		if (!baseBlock) continue;

		const mergedBlock: BilingualContentBlock = {
			id: baseBlock.id,
			type: baseBlock.type,
			isHidden: baseBlock.isHidden,
			content: {}
		};

		// Handle different content types with proper type guards
		if (baseBlock.type === 'text') {
			const deTextContent = deBlock?.content as TextContentData | undefined;
			const enTextContent = enBlock?.content as TextContentData | undefined;
			mergedBlock.content.text = {
				de: deTextContent?.text || enTextContent?.text || '',
				en: enTextContent?.text || deTextContent?.text || ''
			};
		} else if (baseBlock.type === 'heading') {
			const deHeadingContent = deBlock?.content as HeadingContentData | undefined;
			const enHeadingContent = enBlock?.content as HeadingContentData | undefined;
			const baseHeadingContent = baseBlock.content as HeadingContentData;
			mergedBlock.content.level = baseHeadingContent?.level;
			mergedBlock.content.text = {
				de: deHeadingContent?.text || enHeadingContent?.text || '',
				en: enHeadingContent?.text || deHeadingContent?.text || ''
			};
		} else if (baseBlock.type === 'image') {
			const deImageContent = deBlock?.content as ImageContentData | undefined;
			const enImageContent = enBlock?.content as ImageContentData | undefined;

			// For images, use intelligent fallback - prefer the version that has images
			const deImage = deImageContent?.image;
			const enImage = enImageContent?.image;

			// Use the image array that exists, with fallback to the other language
			mergedBlock.content.image = deImage || enImage || [];

			// Handle alt text with fallback
			const deAlt = deImageContent?.alt || '';
			const enAlt = enImageContent?.alt || '';
			mergedBlock.content.alt = {
				de: deAlt || enAlt,
				en: enAlt || deAlt
			};

			// Copy other image properties if they exist
			const baseImageContent = baseBlock.content as ImageContentData;
			if (baseImageContent?.author) {
				mergedBlock.content.author = baseImageContent.author;
			}
			if (baseImageContent?.license) {
				mergedBlock.content.license = baseImageContent.license;
			}
		}

		mergedContent.push(mergedBlock);
	}

	return mergedContent;
}

// Function to merge DE and EN project responses into bilingual objects
function mergeLanguageResponses(
	deProjects: KirbyProjectResponse[],
	enProjects: KirbyProjectResponse[]
): BilingualKirbyProjectResponse[] {
	console.log(`Merging ${deProjects.length} DE projects with ${enProjects.length} EN projects`);

	// Create a map of EN projects by UUID for efficient lookup
	const enProjectMap = new Map<string, KirbyProjectResponse>();
	enProjects.forEach((project) => {
		enProjectMap.set(project.uuid, project);
	});

	// Merge each DE project with its EN counterpart
	const mergedProjects = deProjects.map((deProject) => {
		const enProject = enProjectMap.get(deProject.uuid);

		if (!enProject) {
			console.error(`No EN version found for project ${deProject.uuid} - this should not happen!`);
			// This case should not occur based on your clarification, but keeping as safety fallback
			const deTitle = typeof deProject.title === 'string' ? deProject.title : deProject.title.de;
			return {
				...deProject,
				title: { de: deTitle, en: deTitle },
				content: mergeContentBlocks(deProject.content, []),
				intro: {
					de: deProject.intro_field_intro || '',
					en: deProject.intro_field_intro || ''
				}
			};
		}

		// Merge the titles and content, keep other data from DE version (since they should be the same)
		// Handle cases where EN fields might be missing/empty
		const merged: BilingualKirbyProjectResponse = {
			...deProject,
			title: {
				de: typeof deProject.title === 'string' ? deProject.title : deProject.title.de,
				en:
					typeof enProject.title === 'string'
						? enProject.title
						: enProject.title?.en ||
							(typeof deProject.title === 'string' ? deProject.title : deProject.title.de)
			},
			content: mergeContentBlocks(deProject.content, enProject.content),
			intro: {
				de: deProject.intro_field_intro || '',
				en: enProject.intro_field_intro || deProject.intro_field_intro || ''
			}
		};

		return merged;
	});

	console.log(`Successfully merged into ${mergedProjects.length} bilingual projects`);
	return mergedProjects;
}

// Function to enhance a single project with enriched data
async function enhanceProject(
	project: BilingualKirbyProjectResponse,
	enrichedData: {
		locations: EnrichedLocationData[];
		formats: EnrichedFormatData[];
		contexts: Map<string, EnrichedContextData>;
	}
): Promise<BilingualKirbyProjectResponse> {
	const enhancedProject = { ...project };

	// Ensure enhancement location match data is loaded
	if (enhancementLocationMatch.length === 0) {
		enhancementLocationMatch = locationMatchData;
	}

	// Enhance locations
	if (project.location) {
		const rawLocationIds = Array.isArray(project.location) ? project.location : [project.location];

		// Add defensive check for enrichedData.locations
		if (Array.isArray(enrichedData.locations)) {
			// Map raw location IDs to clean IDs, then find enriched data
			enhancedProject.enrichedLocations = rawLocationIds
				.map((rawId) => {
					const cleanId = mapRawLocationToCleanId(rawId);
					return cleanId ? enrichedData.locations.find((loc) => loc.id === cleanId) : undefined;
				})
				.filter((loc): loc is EnrichedLocationData => loc !== undefined);
		} else {
			console.error('enrichedData.locations is not an array:', enrichedData.locations);
			enhancedProject.enrichedLocations = [];
		}
	}

	// Enhance formats
	if (project.formats) {
		const formatKeys = Array.isArray(project.formats) ? project.formats : [project.formats];

		enhancedProject.enrichedFormats = formatKeys
			.map((key) => enrichedData.formats.find((format) => format.key === key))
			.filter((format): format is EnrichedFormatData => format !== undefined);
	}

	if (project.contexts) {
		// Handle contexts - could be string, comma-separated string, or array
		let contextIds: string[] = [];

		if (Array.isArray(project.contexts)) {
			contextIds = project.contexts;
		} else if (typeof project.contexts === 'string') {
			// Split by comma in case it's comma-separated
			contextIds = project.contexts
				.split(',')
				.map((id) => id.trim())
				.filter((id) => id.length > 0);
		}

		// Get contexts with built-in hierarchy
		enhancedProject.enrichedContexts = contextIds
			.map((id) => enrichedData.contexts.get(id))
			.filter((context): context is EnrichedContextData => context !== undefined);
	}
	return enhancedProject;
}

// Use centralized type from /lib/api/types/projects.ts
import type { ProjectsRequestBody } from '$lib/api/types/projects';

// // Title image block structure for intro_field_title_image with resolved files
// export interface TitleImageBlock {
// 	content: {
// 		image: ImageEntry[]; // Array of resolved file objects with URLs
// 		alt: string;
// 		author: string;
// 		license: string;
// 	};
// 	id: string;
// 	isHidden: boolean;
// 	type: string; // "image"
// }

export interface KirbyAPIResponse {
	code: number;
	result: {
		data: KirbyProjectResponse[];
		pagination: {
			page: number;
			pages: number;
			offset: number;
			limit: number;
			total: number;
		};
	};
	status: string;
}

export const POST: RequestHandler = async ({ request }) => {
	const startTime = performance.now();
	const timings: Record<string, number> = {};

	console.log('🚀 Projects API request started');

	try {
		const parseStart = performance.now();
		const body: ProjectsRequestBody = await request.json().catch(() => ({}));
		timings.jsonParse = performance.now() - parseStart;

		// Set defaults for query parameters
		const {
			query = DEFAULT_QUERY,
			select,
			limit = 20,
			offset = 0,
			page = 1,
			shuffle = false,
			shuffleSeed,
			metadataOnly = false,
			selectConfig
		} = body;

		// Note: We'll fetch both languages and merge them, ignoring the X-Language header for now
		// const language = request.headers.get('X-Language') || 'en';

		// Choose appropriate select based on request type and config
		let finalSelect = select;
		if (!finalSelect) {
			switch (selectConfig) {
				case 'initial':
					// Initial load without full images - only title images
					finalSelect = PROJECT_SELECTS.METADATA;
					break;
				case 'images':
					// Only images for a specific project with Kirby srcset
					finalSelect = PROJECT_SELECTS.IMAGES_ONLY;
					break;
				case 'default':
				default:
					finalSelect = metadataOnly ? PROJECT_SELECTS.METADATA : PROJECT_SELECTS.FULL;
			}
		}

		// Build the final query
		const finalQuery = query;

		// Handle special cases for pagination
		let pagination;
		if (limit === -1) {
			// Fetch all projects
			pagination = {
				limit: 9999, // Large number for Kirby API
				offset: 0,
				page: 1
			};
		} else if (shuffle) {
			// If shuffling, we need to get all results first, then shuffle and paginate
			pagination = {
				limit: 1000, // Get more results for shuffling
				offset: 0,
				page: 1
			};
		} else {
			pagination = {
				limit,
				offset,
				page
			};
		}
		// Create cache key based on query parameters
		const cacheKey = enhancedCacheUtils.generateKey('/projects', {
			query: finalQuery,
			select: JSON.stringify(finalSelect),
			limit,
			offset,
			page,
			shuffle,
			shuffleSeed,
			metadataOnly,
			selectConfig
		});

		// Check cache first
		// const cached = filterCache.get(cacheKey);
		const cached = null;
		if (cached !== null) {
			console.log(`🎯 Projects cache HIT for ${cacheKey}`);
			console.log(`📊 Cache hit performance: 0ms (vs ~6000ms without cache)`);
			return json(cached as KirbyAPIResponse);
		}

		// Prepare the KQL request body
		const kqlBody = {
			query: finalQuery,
			select: finalSelect,
			pagination
		};

		// console.log('KQL Body:', JSON.stringify(kqlBody, null, 2));
		// console.log('🖼️  KQL titleImage query:', JSON.stringify(kqlBody.select.titleImage, null, 2));

		// Fetch both languages in parallel
		const apiCallStart = performance.now();
		console.log('⏱️  Starting dual API calls to Kirby backend');
		const [deResponse, enResponse] = await Promise.all([
			fetch(`${SERVER_API_CONFIG.BASE_URL}/query`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Language': 'de',
					Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
				},
				body: JSON.stringify(kqlBody)
			}),
			fetch(`${SERVER_API_CONFIG.BASE_URL}/query`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Language': 'en',
					Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
				},
				body: JSON.stringify(kqlBody)
			})
		]);
		timings.apiCalls = performance.now() - apiCallStart;
		console.log(`✅ API calls completed in ${timings.apiCalls.toFixed(2)}ms`);

		if (!deResponse.ok || !enResponse.ok) {
			// console.error(`API request failed: DE=${deResponse.status}, EN=${enResponse.status}`);
			error(
				500,
				`Failed to fetch projects from remote API: DE=${deResponse.status}, EN=${enResponse.status}`
			);
		}

		const jsonParseStart = performance.now();
		const [deData, enData]: [KirbyAPIResponse, KirbyAPIResponse] = await Promise.all([
			deResponse.json(),
			enResponse.json()
		]);
		timings.jsonResponseParse = performance.now() - jsonParseStart;
		console.log(`📄 JSON parsing completed in ${timings.jsonResponseParse.toFixed(2)}ms`);

		// Merge the two language responses into bilingual objects
		const mergeStart = performance.now();
		const mergedProjects = mergeLanguageResponses(deData.result.data, enData.result.data);
		timings.languageMerge = performance.now() - mergeStart;
		console.log(`🔄 Language merge completed in ${timings.languageMerge.toFixed(2)}ms`);

		// Use DE data as base for response structure, but update with merged projects
		const data: KirbyAPIResponse = {
			...deData,
			result: {
				...deData.result,
				data: mergedProjects as unknown as KirbyProjectResponse[] // Type assertion needed for now
			}
		};

		// Get enriched data from cache and enhance projects
		const enhancementStart = performance.now();
		try {
			console.log('🔍 Starting data enhancement phase');
			if (!externalDataCache.isReady()) {
				console.warn('⚠️  External data cache not ready, attempting to initialize...');
				const cacheInitStart = performance.now();
				await externalDataCache.initialize();
				timings.cacheInit = performance.now() - cacheInitStart;
				console.log(`🏗️  Cache initialization completed in ${timings.cacheInit.toFixed(2)}ms`);
			}

			const enrichedData = getEnrichedData();
			data.result.data = (await Promise.all(
				data.result.data.map((project) =>
					enhanceProject(project as BilingualKirbyProjectResponse, enrichedData)
				)
			)) as unknown as KirbyProjectResponse[];
			timings.enhancement = performance.now() - enhancementStart;
			console.log(`✨ Data enhancement completed in ${timings.enhancement.toFixed(2)}ms`);
		} catch (enhancementError) {
			timings.enhancement = performance.now() - enhancementStart;
			// console.warn('❌ Failed to enhance projects with enriched data:', enhancementError);
			// Continue without enrichment rather than failing the entire request
		}

		// Cache the result (10 minutes TTL for content)
		filterCache.set(cacheKey, data, 10 * 60 * 1000);
		console.log(`💾 Cached result for key: ${cacheKey.substring(0, 50)}...`);

		const totalTime = performance.now() - startTime;
		timings.total = totalTime;

		console.log('🏁 Projects API completed');
		console.log('📊 Performance breakdown:', {
			...timings,
			dataSize: `${data.result.data.length} projects`,
			breakdown: Object.entries(timings)
				.map(([key, value]) => `${key}: ${value.toFixed(2)}ms`)
				.join(', ')
		});

		return json(data);
	} catch (err) {
		// console.error('Projects API error:', err);

		// Handle different error types
		if (err instanceof Error && err.message.includes('SyntaxError')) {
			error(400, `Invalid JSON in request body: ${err.message}`);
		}

		error(
			500,
			`Internal server error while fetching projects: ${err instanceof Error ? err.message : 'Unknown error'}`
		);
	}
};
