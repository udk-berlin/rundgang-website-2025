import type { Project } from './api/types/projects';
import type { EnrichedFormatData, EnrichedContextData } from './api/types/kirby';
import type { ContextsResponse } from './api/types/filters';
import { locationMatchData } from './data/locations';

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
 * Create a lookup map from context ID to all its parent faculty IDs
 * @param contextsData The raw contexts data from the API
 * @returns Map from context ID to array of parent faculty IDs
 */
function createContextToFacultyMap(contextsData: ContextsResponse | null): Map<string, string[]> {
	const map = new Map<string, string[]>();

	if (!contextsData?.faculties) return map;

	contextsData.faculties.forEach((faculty) => {
		const facultyIds = [faculty.id];

		// Add faculty itself
		map.set(faculty.id, facultyIds);

		// Add all child contexts
		faculty.institutes?.forEach((institute) => {
			map.set(institute.id, facultyIds);
			institute.courses?.forEach((course) => {
				map.set(course.id, facultyIds);
				course.classes?.forEach((classItem) => {
					map.set(classItem.id, facultyIds);
				});
			});
		});
	});

	return map;
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
 * @param contextsData Optional raw contexts data for hierarchical filtering
 * @returns Filtered array of projects
 */
export function filterProjects(
	projects: Project[],
	selectedFilters: Record<string, string[]>,
	contextsData?: ContextsResponse | null
): Project[] {
	// Create context-to-faculty map for hierarchical filtering
	const contextToFacultyMap = createContextToFacultyMap(contextsData || null);

	return projects.filter((project) => {
		// Check formats filter (maps to project.formats)
		if (selectedFilters.formats && selectedFilters.formats.length > 0) {
			const hasMatchingFormat = selectedFilters.formats.some((selectedFormat) => {
				console.log('selectedFormat', selectedFormat);
				console.log('project.formats', project.formats);
				return project.formats.some((format: EnrichedFormatData) => format.key === selectedFormat);
			});
			if (!hasMatchingFormat) return false;
		}

		// Check locations filter (maps to project.location.id)
		if (selectedFilters.locations && selectedFilters.locations.length > 0) {
			if (!project.location || !project.location.id) return false;

			const hasMatchingLocation = selectedFilters.locations.some((selectedLocation) => {
				// Find the location mapping that contains this normalized name
				const locationMapping = locationMatchData.find((mapping) =>
					mapping.match.includes(selectedLocation)
				);
				// If we found a mapping, check if the project's location ID matches the canonical ID
				return locationMapping ? project.location?.id === locationMapping.id : false;
			});
			if (!hasMatchingLocation) return false;
		}

		// Check contexts filter (maps to project.contexts) - with hierarchical support
		if (selectedFilters.contexts && selectedFilters.contexts.length > 0) {
			const hasMatchingContext = selectedFilters.contexts.some((selectedContext) => {
				// Check if any of the project's contexts match the selected context directly
				const directMatch = project.contexts.some(
					(context: EnrichedContextData) => context.id === selectedContext
				);

				if (directMatch) return true;

				// Check for hierarchical match (if a faculty is selected, include projects from its child contexts)
				if (contextsData && contextToFacultyMap.size > 0) {
					return project.contexts.some((context: EnrichedContextData) => {
						// Get all parent faculties for this context
						const parentFaculties = contextToFacultyMap.get(context.id) || [];
						// Check if any parent faculty matches the selected context
						return parentFaculties.includes(selectedContext);
					});
				}

				return false;
			});
			if (!hasMatchingContext) return false;
		}

		return true;
	});
}
