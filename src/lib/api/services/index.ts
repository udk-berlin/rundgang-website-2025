// Main entry point for all API services

import { projectsService, createProjectsService } from './projects';
import { filtersService } from './filters';

export { projectsService, createProjectsService, filtersService };

// Re-export types for convenience
export type {
	Project,
	ProjectQueryOptions,
	FilterData,
	FilterGroup,
	FilterOption
} from '../types/index';

// Legacy compatibility exports (using functions to avoid binding issues)
export const legacyApi = {
	// Projects
	fetchProjects: (options: any) => projectsService.fetch(options),
	fetchProjectsWithQuery: (requestBody: any) => projectsService.fetchWithQuery(requestBody),
	fetchProjectsByFormat: (format: string, options?: any) =>
		projectsService.fetchByFormat(format, options),
	fetchProjectById: (id: string, language?: 'DE' | 'EN') => projectsService.fetchById(id, language),

	// Filters
	fetchFilterData: () => filtersService.fetchAll()
};

// Main API interface
export const api = {
	projects: projectsService,
	filters: filtersService
};

export default api;
