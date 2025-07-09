// Main API entry point - Re-export everything for easy access

// Core API clients
export { apiClient } from './client';
export { universalApiClient } from './universal-client';
export type { ApiResponse, ApiError, RequestOptions } from './client';

// Services
export { projectsService, createProjectsService, filtersService, api } from './services';

// Types
export type {
	// Common types
	PaginationOptions,
	QueryOptions,
	FilterOption,
	FilterGroup,
	FilterData,
	EventDateTimeEntry,
	Author,

	// Project types
	Project,
	ProjectQueryOptions,
	ProjectsRequestBody,
	ProjectFilters,
	ProjectSortOptions,

	// Filter types
	ContextsResponse,
	FormatsResponse,
	LocationsResponse,
	FormatItem,
	LocationItem,

	// Kirby types
	ContentBlock,
	KirbyProjectResponse,
	KirbyApiResponse,
	KqlQuery
} from './types/index';

// Constants
export { API_ENDPOINTS } from './types/index';

export { PROJECT_QUERIES, FILTER_QUERIES, DEFAULT_PROJECT_SELECT } from './queries/index';

// Utilities
export * from './utils/errors';
export * from './utils/retry';

// Transformers (for advanced use cases)
export * from './transformers/projects';
export * from './transformers/filters';

// Default export for convenience
export { api as default } from './services';
