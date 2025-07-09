// Re-export all types for easy importing

// Common types
export type {
	ApiResponse,
	PaginationOptions,
	QueryOptions,
	BaseEntity,
	EntityWithProjectCount,
	FilterOption,
	FilterGroup,
	FilterData,
	EventDateTimeEntry,
	Author
} from './common';

export { API_ENDPOINTS } from './common';

// Kirby-specific types
export type {
	ContentBlock,
	ContentBlockBase,
	HeadingBlock,
	TextBlock,
	ImageBlock,
	TitleImageBlock,
	HeadingContentData,
	TextContentData,
	ImageContentData,
	KirbyProjectResponse,
	KirbyApiResponse,
	KqlQuery
} from './kirby';

// Project types
export type {
	Project,
	ProjectQueryOptions,
	ProjectsRequestBody,
	ProjectFilters,
	ProjectSortField,
	ProjectSortOrder,
	ProjectSortOptions
} from './projects';

export type { ScheduleByDay } from '../transformers/projects';

export { PROJECT_QUERIES } from './projects';

// Filter types
export type {
	ClassItem,
	CourseItem,
	InstituteItem,
	FacultyItem,
	InstitutionItem,
	FormatItem,
	LocationItem,
	ContextsResponse,
	FormatsResponse,
	LocationsResponse,
	FilterTransformOptions
} from './filters';

export { FILTER_QUERIES } from './filters';
