// Filter-specific types

import type { EntityWithProjectCount } from './common';

// Context/Category hierarchy types
export interface ClassItem extends EntityWithProjectCount {
	type: 'class';
}

export interface CourseItem extends EntityWithProjectCount {
	type: 'course';
	classes?: ClassItem[];
}

export interface InstituteItem extends EntityWithProjectCount {
	type: 'institute';
	courses?: CourseItem[];
}

export interface FacultyItem extends EntityWithProjectCount {
	type: 'faculty';
	institutes?: InstituteItem[];
}

export interface InstitutionItem extends EntityWithProjectCount {
	type: 'institution';
	faculties: FacultyItem[];
}

// Format types
export interface FormatItem {
	key: string;
	name: string;
	en?: string;
	de?: string;
	projectCount?: number;
}

// Location types
export interface LocationItem {
	name: string;
	street?: string;
	postcode?: string;
	city?: string;
	latitude?: string;
	longitude?: string;
	normalizedKebabName?: string;
	projectCount?: number;
}

// Filter response types
export type ContextsResponse = InstitutionItem;
export type FormatsResponse = FormatItem[];
export type LocationsResponse = LocationItem[];

// Filter transformation options
export interface FilterTransformOptions {
	includeProjectCounts?: boolean;
	normalizeNames?: boolean;
	flattenHierarchy?: boolean;
}

// Filter query builders
export const FILTER_QUERIES = {
	CONTEXTS: '/2025/contexts',
	FORMATS: '/2025/formats',
	LOCATIONS: '/2025/locations'
} as const;
