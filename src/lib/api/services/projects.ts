import {
	universalApiClient as apiClient,
	createUniversalApiClient,
	type UniversalClient
} from '../universal-client';
import {
	transformAndValidateProjects,
	transformKirbyProject
} from '../transformers/projects';
import {
	projectContentCache,
	singleProjectCache,
	enhancedCacheUtils
} from '../../cache-enhanced';
import type {
	Project,
	ProjectQueryOptions,
	ProjectsRequestBody,
	KirbyProjectResponse,
	KirbyApiResponse
} from '../types/index';
import { PROJECT_QUERIES } from '../types/index';

/**
 * Generate a daily seed based on current date
 */
function getDailySeed(): string {
	const today = new Date();
	return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
}

/**
 * Generate a session seed for consistent ordering during a user session
 */
function getSessionSeed(): string {
	if (typeof window === 'undefined') {
		return getDailySeed();
	}

	let sessionSeed = sessionStorage.getItem('shuffle-seed');
	if (!sessionSeed) {
		sessionSeed = `session-${Date.now()}-${Math.random()}`;
		sessionStorage.setItem('shuffle-seed', sessionSeed);
	}
	return sessionSeed;
}

/**
 * Build KQL query based on options
 */
function buildProjectQuery(options: ProjectQueryOptions): string {
	const { formats, locations, contexts, searchTerm, query } = options;

	// If custom query provided, use it
	if (query) {
		return query;
	}

	let baseQuery: string = PROJECT_QUERIES.ALL;
	const filters: string[] = [];

	// Add format filters
	if (formats && formats.length > 0) {
		const formatFilter = formats
			.map((format) => `filterBy('format_field_select', '${format.replace(/'/g, "\\'")}')`)
			.join('.');
		filters.push(formatFilter);
	}

	// Add location filters
	if (locations && locations.length > 0) {
		const locationFilter = locations
			.map((location) => `filterBy('location_field_select', '${location.replace(/'/g, "\\'")}')`)
			.join('.');
		filters.push(locationFilter);
	}

	// Add context filters
	if (contexts && contexts.length > 0) {
		const contextFilter = contexts
			.map((context) => `filterBy('categories', '*=', '${context.replace(/'/g, "\\'")}')`)
			.join('.');
		filters.push(contextFilter);
	}

	// Add search filter
	if (searchTerm) {
		filters.push(`search('${searchTerm.replace(/'/g, "\\'")}')`);
	}

	// Combine base query with filters
	if (filters.length > 0) {
		baseQuery = `${baseQuery}.${filters.join('.')}`;
	}

	return baseQuery;
}

class ProjectsService {
	private apiClient: UniversalClient;

	constructor(customApiClient?: UniversalClient) {
		this.apiClient = customApiClient || apiClient;
	}
	/**
	 * Fetch projects using POST request with custom KQL query
	 */
	async fetchWithQuery(
		requestBody: ProjectsRequestBody,
		language?: 'DE' | 'EN'
	): Promise<Project[]> {
		const cacheKey = enhancedCacheUtils.generateKey('/api/projects', requestBody, language);

		return enhancedCacheUtils.getOrSet<Project[]>(projectContentCache, cacheKey, async () => {
			// Include language in headers instead of request body
			const headers: Record<string, string> = {};
			if (language) {
				headers['X-Language'] = language.toLowerCase(); // 'de' or 'en'
				// console.log(
				// 	`fetchWithQuery: Sending language header: ${headers['X-Language']} (from ${language})`
				// );
			}

			const response = await this.apiClient.post<KirbyApiResponse<KirbyProjectResponse[]>>(
				'/api/projects',
				requestBody,
				headers
			);

			if (response.status !== 'ok') {
				throw new Error(`API error (${response.code}): ${response.status}`);
			}

			// Server handles shuffling, so we just transform the data
			return transformAndValidateProjects(response.result.data);
		});
	}

	/**
	 * Fetch projects with options-based query building
	 */
	async fetch(options: ProjectQueryOptions = {}, language?: 'DE' | 'EN'): Promise<Project[]> {
		const { limit = 20, offset = 0, shuffle, shuffleSeed } = options;

		const query = buildProjectQuery(options);

		const requestBody: ProjectsRequestBody = {
			query,
			limit,
			offset,
			shuffle,
			shuffleSeed
		};

		return this.fetchWithQuery(requestBody, language);
	}

	/**
	 * Fetch random projects (shuffled) with deterministic pagination
	 */
	async fetchRandom(count: number = 20, offset: number = 0, seed?: string): Promise<Project[]> {
		const shuffleSeed = seed || getSessionSeed();

		return this.fetch({
			query: PROJECT_QUERIES.ALL, // Use all projects, not shuffled query
			limit: count,
			offset,
			shuffle: true,
			shuffleSeed
		});
	}

	/**
	 * Fetch projects by format
	 */
	async fetchByFormat(
		format: string,
		options: { limit?: number; offset?: number } = {}
	): Promise<Project[]> {
		const { limit = 20, offset = 0 } = options;

		return this.fetchWithQuery({
			query: PROJECT_QUERIES.BY_FORMAT(format),
			limit,
			offset
		});
	}

	/**
	 * Fetch a single project by ID
	 */
	async fetchById(id: string, language?: 'DE' | 'EN'): Promise<Project | null> {
		const cacheKey = enhancedCacheUtils.generateKey('/api/projects/by-id', { id }, language);

		return enhancedCacheUtils.getOrSet<Project | null>(singleProjectCache, cacheKey, async () => {
			try {
				// Include language in headers instead of request body
				const headers: Record<string, string> = {};
				if (language) {
					headers['X-Language'] = language.toLowerCase(); // 'de' or 'en'
				}

				const response = await this.apiClient.post<KirbyApiResponse<KirbyProjectResponse[]>>(
					'/api/projects',
					{
						query: PROJECT_QUERIES.BY_ID(id),
						limit: 1
					},
					headers
				);

				if (response.status !== 'ok') {
					throw new Error(`API error (${response.code}): ${response.status}`);
				}

				if (!response.result.data || response.result.data.length === 0) {
					return null; // Project not found
				}

				// Transform the single project
				return transformKirbyProject(response.result.data[0]);
			} catch (error) {
				// console.error(`Failed to fetch project with id ${id}:`, error);
				return null;
			}
		});
	}

	/**
	 * Fetch all project metadata for initial page load and caching
	 * This method loads all projects as lightweight metadata without images
	 * Now supports pre-loading both languages for instant switching
	 */
	async fetchAllProjects(
		options: { shuffle?: boolean; shuffleSeed?: string } = {},
		language: 'DE' | 'EN' = 'EN'
	): Promise<Project[]> {
		const { shuffle, shuffleSeed } = options;

		const requestBody: ProjectsRequestBody = {
			query: PROJECT_QUERIES.ALL,
			limit: -1, // Load all projects
			shuffle,
			shuffleSeed
			// No selectConfig - use default FULL select for consistency
		};

		// Use the same cache as other methods for consistency
		const cacheKey = enhancedCacheUtils.generateKey('/api/projects', requestBody, language);

		return enhancedCacheUtils.getOrSet<Project[]>(projectContentCache, cacheKey, async () => {
			// Include language in headers instead of request body
			const headers: Record<string, string> = {};
			if (language) {
				headers['X-Language'] = language.toLowerCase(); // 'de' or 'en'
			}

			const response = await this.apiClient.post<KirbyApiResponse<KirbyProjectResponse[]>>(
				'/api/projects',
				requestBody,
				headers
			);

			if (response.status !== 'ok') {
				throw new Error(`API error (${response.code}): ${response.status}`);
			}

			// Transform the data to Project[] using the same transformer as other methods
			return transformAndValidateProjects(response.result.data);
		});
	}

	/**
	 * Initialize cache with all project metadata on app startup
	 * Pre-loads both German and English data for instant language switching
	 * Note: Background refresh is now handled server-side
	 */
	async initializeCache(language: 'DE' | 'EN' = 'EN'): Promise<void> {
		try {
			console.log('Initializing client-side project cache...');

			// Pre-load both languages by calling fetchAllProjects
			await this.fetchAllProjects(
				{
					shuffle: true,
					shuffleSeed: 'main-page-2025' // Use same seed as main page
				},
				language
			);

			console.log('✅ Client-side project cache initialized (server handles background refresh)');
		} catch (error) {
			console.error('Failed to initialize client-side project cache:', error);
		}
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats() {
		return enhancedCacheUtils.getStats();
	}

	/**
	 * Clear all caches
	 */
	clearCache(): void {
		projectContentCache.clear();
		singleProjectCache.clear();
		// console.log('All project caches cleared');
	}
}

// Export singleton instance
export const projectsService = new ProjectsService();

// Factory function for creating ProjectsService with custom fetch
export const createProjectsService = (fetchFn?: typeof fetch) =>
	new ProjectsService(createUniversalApiClient(fetchFn));

export default projectsService;
