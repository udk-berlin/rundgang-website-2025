// Common types used across the API layer

export interface ApiResponse<T> {
	code: number;
	status: string;
	result: T;
}

export interface PaginationOptions {
	limit?: number;
	offset?: number;
	page?: number;
}

export interface QueryOptions {
	query?: string;
	select?: Record<string, unknown>;
	pagination?: PaginationOptions;
}

// Base interfaces for entities with common fields
export interface BaseEntity {
	id: string;
	name: string;
	type: string;
}

export interface EntityWithProjectCount extends BaseEntity {
	projectCount?: number;
}

// Generic filter option structure
export interface FilterOption {
	id: string;
	label: string;
	value: string;
	projectCount?: number;
	type?: string;
}

export interface FilterGroup {
	title: string;
	options: FilterOption[];
}

export interface FilterData {
	contexts: FilterGroup[];
	locations: FilterGroup[];
	formats: FilterGroup[];
}

// Image types - Kirby srcset format only
export interface ImageVariant {
	url: string;
	width: number;
	height: number;
}

export interface ResponsiveImageEntry {
	thumb: ImageVariant; // 300px
	small: ImageVariant; // 600px
	medium: ImageVariant; // 1200px
	large: ImageVariant; // 1800px
	xlarge: ImageVariant; // 2400px
	original: ImageVariant & { alt?: string; uuid?: string };
}

// Kirby srcset-based image format (primary format)
export interface KirbySrcsetImageEntry {
	uuid?: string;
	alt?: string;
	originalUrl: string;
	originalWidth?: number;
	originalHeight?: number;
	srcset: string; // Kirby-generated srcset string like "image-300.jpg 300w, image-600.jpg 600w"
}

// Event date types
export interface EventDateTimeEntry {
	event_structure_field_date: string;
	event_structure_field_from: string;
	event_structure_field_to: string;
}

// Author types
export interface Author {
	username?: string;
}

// API endpoint constants
export const API_ENDPOINTS = {
	PROJECTS: '/projects',
	QUERY: '/query',
	FILTERS: {
		CONTEXTS: '/2025/contexts',
		LOCATIONS: '/2025/locations',
		FORMATS: '/2025/formats'
	}
} as const;

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
