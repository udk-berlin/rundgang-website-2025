import type { Project, BilingualContentBlock } from '../types/projects';
import type { KirbyProjectResponse } from '../types/kirby';
import type { TimelineEvent } from '../types/timeline';
import type { KirbySrcsetImageEntry } from '../types/common';

export interface ScheduleByDay {
	friday: { fromDate: string; toDate: string }[];
	saturday: { fromDate: string; toDate: string }[];
	sunday: { fromDate: string; toDate: string }[];
}

/**
 * Extract timeline events from Kirby's day-specific event fields
 */
function extractTimelineEvents(kirbyProject: KirbyProjectResponse): TimelineEvent[] {
	const events: TimelineEvent[] = [];

	// Process Friday
	if (kirbyProject.fridayDate) {
		const fridayType = kirbyProject.fridayDate as 'allday' | 'datetime' | 'closed';
		events.push({
			day: 'friday',
			type: fridayType,
			times: fridayType === 'datetime' ? kirbyProject.fridayTimes : undefined
		});
	}

	// Process Saturday
	if (kirbyProject.saturdayDate) {
		const saturdayType = kirbyProject.saturdayDate as 'allday' | 'datetime' | 'closed';
		events.push({
			day: 'saturday',
			type: saturdayType,
			times: saturdayType === 'datetime' ? kirbyProject.saturdayTimes : undefined
		});
	}

	// Process Sunday
	if (kirbyProject.sundayDate) {
		const sundayType = kirbyProject.sundayDate as 'allday' | 'datetime' | 'closed';
		events.push({
			day: 'sunday',
			type: sundayType,
			times: sundayType === 'datetime' ? kirbyProject.sundayTimes : undefined
		});
	}

	return events;
}

/**
 * Transform timeline events into a schedule by day format for easy display
 */
function transformEvents(events: TimelineEvent[]): ScheduleByDay {
	const output: ScheduleByDay = {
		friday: [],
		saturday: [],
		sunday: []
	};

	for (const entry of events) {
		const dayName = entry.day.toLowerCase() as keyof ScheduleByDay;

		// Skip if it's not one of our target days
		if (!['friday', 'saturday', 'sunday'].includes(dayName)) {
			continue;
		}

		if (entry.type === 'allday') {
			// Handle all-day events
			if (entry.times?.length) {
				let dateStr: string | undefined;

				if (dayName === 'friday') {
					dateStr = entry.times[0].event_structure_field_friday_date;
				} else if (dayName === 'saturday') {
					dateStr = entry.times[0].event_structure_field_saturday_date;
				} else if (dayName === 'sunday') {
					dateStr = entry.times[0].event_structure_field_sunday_date;
				}

				if (dateStr) {
					const fromDate = new Date(`${dateStr}T00:00:00`);
					const toDate = new Date(`${dateStr}T23:59:59`);

					output[dayName].push({
						fromDate: fromDate.toISOString(),
						toDate: toDate.toISOString()
					});
				}
			}
		} else if (entry.type === 'datetime' && Array.isArray(entry.times)) {
			// Handle timed events
			for (const timeSlot of entry.times) {
				let dateStr: string | undefined;
				let fromTime: string | undefined;
				let toTime: string | undefined;

				if (dayName === 'friday') {
					dateStr = timeSlot.event_structure_field_friday_date;
					fromTime = timeSlot.event_structure_field_friday_time_from;
					toTime = timeSlot.event_structure_field_friday_time_to;
				} else if (dayName === 'saturday') {
					dateStr = timeSlot.event_structure_field_saturday_date;
					fromTime = timeSlot.event_structure_field_saturday_time_from;
					toTime = timeSlot.event_structure_field_saturday_time_to;
				} else if (dayName === 'sunday') {
					dateStr = timeSlot.event_structure_field_sunday_date;
					fromTime = timeSlot.event_structure_field_sunday_time_from;
					toTime = timeSlot.event_structure_field_sunday_time_to;
				}

				if (dateStr) {
					const fromDate = new Date(`${dateStr}T${fromTime || '00:00:00'}`);
					const toDate = new Date(`${dateStr}T${toTime || '23:59:59'}`);

					output[dayName].push({
						fromDate: fromDate.toISOString(),
						toDate: toDate.toISOString()
					});
				}
			}
		}
	}

	return output;
}

/**
 * Normalize field to array format (handle both string and array inputs)
 */
function normalizeToArray<T>(field: T | T[]): T[] {
	if (Array.isArray(field)) {
		return field;
	}
	return field ? [field] : [];
}

/**
 * Transform location identifier to location object
 * Note: Kirby API now provides location objects with id and name fields directly
 */
function transformLocationToObject(locationData: string | { id: string; name: string }): {
	id: string;
	name: string;
} {
	// If locationData is a string (legacy format), use it as both id and name
	if (typeof locationData === 'string') {
		const locationObj = {
			id: locationData,
			name: locationData
		};
		return locationObj;
	}

	// If locationData is an object (new format), use id and name directly
	return {
		id: locationData.id,
		name: locationData.name
	};
}

/**
 * Transform Kirby project to metadata format
 */
export function transformKirbyProjectToMetadata(kirbyProject: KirbyProjectResponse): Project {
	const timelineEvents = extractTimelineEvents(kirbyProject);
	const schedule = transformEvents(timelineEvents);


	const metadata: Project = {
		id: kirbyProject.id,
		uuid: kirbyProject.uuid || kirbyProject.id,
		modified: kirbyProject.modified ? new Date(kirbyProject.modified * 1000).toISOString() : new Date().toISOString(),
		title:
			typeof kirbyProject.title === 'object' && kirbyProject.title !== null
				? { de: kirbyProject.title.de || 'Untitled', en: kirbyProject.title.en || 'Untitled' }
				: { de: kirbyProject.title || 'Untitled', en: kirbyProject.title || 'Untitled' },
		author: kirbyProject.author?.username || 'Unknown Artist',
		coauthors: kirbyProject.coauthor?.username ? [kirbyProject.coauthor.username] : [],
		formats:
			kirbyProject.enrichedFormats ||
			normalizeToArray(kirbyProject.formats).map((format) => ({
				key: format,
				en: format,
				de: format
			})),
		contexts:
			kirbyProject.enrichedContexts ||
			normalizeToArray(kirbyProject.contexts || []).map((contextId) => ({
				id: contextId,
				type: 'context',
				name: contextId
			})),
		url: kirbyProject.url,
		location: (() => {
			// Use enriched location data if available
			if (kirbyProject.enrichedLocations && kirbyProject.enrichedLocations.length > 0) {
				const enrichedLocation = kirbyProject.enrichedLocations[0];
				return {
					id: enrichedLocation.id,
					name: enrichedLocation.name
				};
			}
			// Fallback to raw location data
			const locationData = normalizeToArray(kirbyProject.location)[0];
			return locationData ? transformLocationToObject(locationData) : undefined;
		})(),
		fridayDate: kirbyProject.fridayDate,
		saturdayDate: kirbyProject.saturdayDate,
		sundayDate: kirbyProject.sundayDate,
		timelineEvents,
		schedule
	};

	// Handle title image field (intro_field_title_image.toBlocks format)
	if (
		kirbyProject.titleImage &&
		Array.isArray(kirbyProject.titleImage) &&
		kirbyProject.titleImage.length > 0
	) {
		const titleImageBlock = kirbyProject.titleImage[0];

		// The API can return image as either an array or a single object
		if (titleImageBlock?.image) {
			let imageData: any = undefined;
			if (Array.isArray(titleImageBlock.image) && titleImageBlock.image.length > 0) {
				imageData = titleImageBlock.image[0];
			} else if (typeof titleImageBlock.image === 'object' && titleImageBlock.image !== null) {
				// Handle case where image is a single object instead of array
				imageData = titleImageBlock.image;
			}

			// Check if imageData exists and has the required URL
			if (imageData && (imageData.originalUrl || imageData.url)) {
				// Normalize the image data to match KirbySrcsetImageEntry format
				const normalizedImageData: KirbySrcsetImageEntry = {
					uuid: imageData.uuid || imageData.id || 'unknown',
					alt: imageData.alt || '',
					originalUrl: imageData.originalUrl || imageData.url,
					originalWidth: imageData.originalWidth,
					originalHeight: imageData.originalHeight,
					srcset: imageData.srcset || ''
				};
				metadata.titleImage = [normalizedImageData];
			} else {
				console.log('❌ No valid image data found in titleImageBlock:', imageData);
			}
		} else {
			console.log(
				'❌ No image property found in titleImageBlock:',
				Object.keys(titleImageBlock || {})
			);
		}
	} else {
		console.log('❌ No titleImage found in kirbyProject:', !!kirbyProject.titleImage);
	}

	// Debug logging disabled to reduce console noise
	// console.log(`[DEBUG] Transformed metadata result:`, {
	//	uuid: metadata.id,
	//	title: metadata.title,
	//	formats: metadata.formats
	// });

	return metadata;
}

/**
 * Transform single Kirby project to internal Project interface
 * Optimized for performance with minimal object creation
 */

export function transformKirbyProject(kirbyProject: KirbyProjectResponse): Project {
	const timelineEvents = extractTimelineEvents(kirbyProject);
	const schedule = transformEvents(timelineEvents);

	const project: Project = {
		id: kirbyProject.id,
		uuid: kirbyProject.uuid || kirbyProject.id,
		modified: kirbyProject.modified ? new Date(kirbyProject.modified * 1000).toISOString() : new Date().toISOString(),
		title:
			typeof kirbyProject.title === 'object' && kirbyProject.title !== null
				? { de: kirbyProject.title.de || 'Untitled', en: kirbyProject.title.en || 'Untitled' }
				: { de: kirbyProject.title || 'Untitled', en: kirbyProject.title || 'Untitled' },
		author: kirbyProject.author?.username || 'Unknown Artist',
		coauthors: kirbyProject.coauthor?.username ? [kirbyProject.coauthor.username] : [],
		formats:
			kirbyProject.enrichedFormats ||
			normalizeToArray(kirbyProject.formats).map((format) => ({
				key: format,
				en: format,
				de: format
			})),
		contexts: kirbyProject.enrichedContexts || [],
		url: kirbyProject.url,
		images: kirbyProject.images,
		location: (() => {
			// Use enriched location data if available
			if (kirbyProject.enrichedLocations && kirbyProject.enrichedLocations.length > 0) {
				const enrichedLocation = kirbyProject.enrichedLocations[0];
				return {
					id: enrichedLocation.id,
					name: enrichedLocation.name
				};
			}
			// Fallback to raw location data
			const locationData = normalizeToArray(kirbyProject.location)[0];
			return locationData ? transformLocationToObject(locationData) : undefined;
		})(),
		content: kirbyProject.content as BilingualContentBlock[] | undefined,
		timelineEvents,
		schedule,
		// Legacy individual date fields for backward compatibility
		fridayDate: kirbyProject.fridayDate,
		saturdayDate: kirbyProject.saturdayDate,
		sundayDate: kirbyProject.sundayDate
	};

	// Handle title image for full projects too (intro_field_title_image.toBlocks format)
	if (
		kirbyProject.titleImage &&
		Array.isArray(kirbyProject.titleImage) &&
		kirbyProject.titleImage.length > 0
	) {
		const titleImageBlock = kirbyProject.titleImage[0];
		// The API can return image as either an array or a single object
		if (titleImageBlock?.image) {
			let imageData: any = undefined;
			if (Array.isArray(titleImageBlock.image) && titleImageBlock.image.length > 0) {
				imageData = titleImageBlock.image[0];
			} else if (typeof titleImageBlock.image === 'object' && titleImageBlock.image !== null) {
				// Handle case where image is a single object instead of array
				imageData = titleImageBlock.image;
			}

			// Check if imageData exists and has the required URL
			if (imageData && (imageData.originalUrl || imageData.url)) {
				// Normalize the image data to match KirbySrcsetImageEntry format
				const normalizedImageData: KirbySrcsetImageEntry = {
					uuid: imageData.uuid || imageData.id || 'unknown',
					alt: imageData.alt || '',
					originalUrl: imageData.originalUrl || imageData.url,
					originalWidth: imageData.originalWidth,
					originalHeight: imageData.originalHeight,
					srcset: imageData.srcset || ''
				};
				project.titleImage = [normalizedImageData];
			} else {
				console.log('❌ Image data missing or invalid originalUrl:', imageData);
			}
		} else {
			console.log(
				'❌ No image property found in titleImageBlock:',
				Object.keys(titleImageBlock || {})
			);
		}
	}

	return project;
}

/**
 * Transform array of Kirby projects with batch optimization
 */
export function transformKirbyProjects(kirbyProjects: KirbyProjectResponse[]): Project[] {
	// Pre-allocate array for better performance
	const projects = new Array<Project>(kirbyProjects.length);

	for (let i = 0; i < kirbyProjects.length; i++) {
		projects[i] = transformKirbyProject(kirbyProjects[i]);
	}

	return projects;
}


export function validateProject(project: Project): boolean {
	return !!(
		project.id &&
		project.title &&
		(project.title.de || project.title.en) &&
		project.author &&
		project.url
	);
}

/**
 * Transform and validate metadata in one pass
 */


/**
 * Filter and validate projects in one pass
 */
export function transformAndValidateProjects(kirbyProjects: KirbyProjectResponse[]): Project[] {
	const validProjects: Project[] = [];

	for (const kirbyProject of kirbyProjects) {
		const project = transformKirbyProject(kirbyProject);

		if (validateProject(project)) {
			validProjects.push(project);
		} else {
			console.warn('Invalid project data:', {
				id: project.id,
				title: project.title.de || project.title.en || 'No title'
			});
		}
	}

	return validProjects;
}
