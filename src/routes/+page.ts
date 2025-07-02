import { createProjectsService } from '../lib/api';

export const load = async ({ url, fetch }: { url: URL; fetch: typeof globalThis.fetch }) => {
	// Get language from URL params or default to EN
	const language = (url.searchParams.get('lang')?.toUpperCase() as 'DE' | 'EN') || 'EN';

	try {
		// Pre-load first 30 projects as metadata for initial render
		const projectsService = createProjectsService(fetch);
		const allProjects = await projectsService.fetchAllProjects(language);

		// Take first 30 for initial server-side render
		// const initialProjects = allProjects.slice(0, 100);
		const initialProjects = allProjects
		const expectedCount = allProjects.length;

		return {
			initialProjects,
			expectedCount,
			language,
			// Indicate this is server-rendered
			prerendered: true
		};
	} catch (error) {
		// console.error('Failed to load initial projects:', error);

		// Return fallback data
		return {
			initialProjects: [],
			expectedCount: 0,
			language,
			prerendered: false,
			error: 'Failed to load projects'
		};
	}
};
