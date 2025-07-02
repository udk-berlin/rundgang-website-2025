import { projectsService } from '../../lib/api';
import type { Project } from '$lib/api/types/index';
import type { EnrichedLocationData } from '$lib/api/types/kirby';

export const load = async ({ url }: { url: URL }) => {
	// Get language from URL params or default to EN
	const language = (url.searchParams.get('lang')?.toUpperCase() as 'DE' | 'EN') || 'EN';

	try {
		// Load all projects
		const allProjects = await projectsService.fetchAllProjects(language);

		// Extract available locations from projects
		const locationMap = new Map<string, EnrichedLocationData>();
		const projectsWithLocations: Project[] = [];

		allProjects.forEach((project) => {
			if (project.location) {
				locationMap.set(project.location.id, project.location);
				projectsWithLocations.push(project);
			}
		});

		const availableLocations = Array.from(locationMap.values()).sort((a, b) =>
			a.name.localeCompare(b.name)
		);

		return {
			allProjects: projectsWithLocations,
			availableLocations,
			totalProjects: allProjects.length,
			language,
			prerendered: true
		};
	} catch (error) {
		// console.error('Failed to load timeline projects:', error);

		return {
			allProjects: [],
			availableLocations: [],
			totalProjects: 0,
			language,
			prerendered: false,
			error: 'Failed to load projects'
		};
	}
};
