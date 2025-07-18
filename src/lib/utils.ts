import type { Project } from './api/types/projects';
import type { EnrichedFormatData, EnrichedContextData } from './api/types/kirby';
import { locationMatchData } from './data/locations';

/**
 * Normalize location ID format for consistent comparison
 * Converts between dash-separated and underscore-separated formats
 * @param locationId The location ID to normalize
 * @param format The target format ('dash' or 'underscore')
 * @returns Normalized location ID
 */
export function normalizeLocationId(locationId: string, format: 'dash' | 'underscore' = 'underscore'): string {
	if (!locationId) return '';
	
	if (format === 'underscore') {
		// Convert dashes to underscores
		return locationId.replace(/-/g, '_');
	} else {
		// Convert underscores to dashes
		return locationId.replace(/_/g, '-');
	}
}

/**
 * Generate a random rotation angle within a specified range
 * @param minDegrees Minimum rotation in degrees (default: -2)
 * @param maxDegrees Maximum rotation in degrees (default: 2)
 * @returns Random rotation angle in degrees
 */
export function getRandomRotation(minDegrees: number = -2, maxDegrees: number = 2): number {
	return (Math.random() - 0.5) * (maxDegrees - minDegrees);
}

/**
 * Generate a random number within a specified range
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Random number within the specified range
 */
export function getRandomNumber(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Append a log entry to app.log in the project root
 * @param input The input to log (any type)
 * @note Only works in Node.js environments. Requires Node.js types for fs/path/process.
 */

/**
 * Filter projects based on selected filter criteria
 * @param projects Array of projects to filter
 * @param selectedFilters Object mapping filter categories to selected values
 * @returns Filtered array of projects
 */
export function filterProjects(
	projects: Project[],
	selectedFilters: Record<string, string[]>
): Project[] {
	return projects.filter((project) => {
		// Check formats filter (maps to project.formats)
		if (selectedFilters.formats && selectedFilters.formats.length > 0) {
			const hasMatchingFormat = selectedFilters.formats.some((selectedFormat) => {
				return project.formats.some((format: EnrichedFormatData) => format.key === selectedFormat);
			});
			if (!hasMatchingFormat) return false;
		}

		// Check locations filter (maps to project.location.id)
		if (selectedFilters.locations && selectedFilters.locations.length > 0) {
			if (!project.location || !project.location.id) return false;

			const hasMatchingLocation = selectedFilters.locations.some((selectedLocation) => {
				// Primary: Find the location mapping that contains this normalized name
				const locationMapping = locationMatchData.find((mapping) =>
					mapping.match.includes(selectedLocation)
				);
				if (locationMapping && project.location?.id === locationMapping.id) {
					return true;
				}

				// Fallback: Direct comparison after normalization (for cases not covered by mapping)
				const normalizedSelectedLocation = normalizeLocationId(selectedLocation, 'underscore');
				return project.location?.id === normalizedSelectedLocation;
			});
			if (!hasMatchingLocation) return false;
		}

		// Check contexts filter (maps to project.contexts)
		if (selectedFilters.contexts && selectedFilters.contexts.length > 0) {
			const hasMatchingContext = selectedFilters.contexts.some((selectedContext) => {
				return project.contexts.some(
					(context: EnrichedContextData) => context.id === selectedContext
				);
			});
			if (!hasMatchingContext) return false;
		}

		return true;
	});
}
