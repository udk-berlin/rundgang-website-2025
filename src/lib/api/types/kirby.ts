// Kirby CMS specific types

import type { KirbySrcsetImageEntry } from './common';

// Content block types for Kirby's structured content
export interface ContentBlockBase {
	id: string;
	isHidden: boolean;
}

export interface HeadingContentData {
	level: string; // e.g., "h2", "h3", etc.
	text: string;
}

export interface TextContentData {
	text: string;
}

export interface ImageContentData {
	image: string[]; // Array of image identifiers
	alt: string;
}

export interface HeadingBlock extends ContentBlockBase {
	type: 'heading';
	content: HeadingContentData;
}

export interface TextBlock extends ContentBlockBase {
	type: 'text';
	content: TextContentData;
}

export interface ImageBlock extends ContentBlockBase {
	type: 'image';
	content: ImageContentData;
}

export type ContentBlock = HeadingBlock | TextBlock | ImageBlock;

// Title image block structure for intro_field_title_image with resolved files
export interface TitleImageBlock {
	image: KirbySrcsetImageEntry[] | KirbySrcsetImageEntry; // Can be array or single object
	alt: string;
	author: string;
	license: string;
	id: string;
	isHidden: boolean;
	type: string; // "image"
}

// Enhanced data types from filter APIs
export interface EnrichedLocationData {
	id: string;
	name: string;
	street?: string;
	postcode?: string;
	city?: string;
	latitude?: string;
	longitude?: string;
}

export interface EnrichedFormatData {
	key: string;
	en: string;
	de: string;
}

export interface EnrichedContextData {
	id: string;
	name: string;
	type: string;
	de?: string;
	en?: string;
	// Hierarchy support for contexts
	faculties?: EnrichedContextData[];
	institutes?: EnrichedContextData[];
	courses?: EnrichedContextData[];
	classes?: EnrichedContextData[];
}

export interface TimelineEventTime {
	event_structure_field_friday_date?: string;
	event_structure_field_friday_time_from?: string;
	event_structure_field_friday_time_to?: string;
	event_structure_field_saturday_date?: string;
	event_structure_field_saturday_time_from?: string;
	event_structure_field_saturday_time_to?: string;
	event_structure_field_sunday_date?: string;
	event_structure_field_sunday_time_from?: string;
	event_structure_field_sunday_time_to?: string;
}

export interface Author {
	username?: string;
}

export interface DetailedAuthor {
	id: string;
	username: string;
	email: string;
	uuid: string;
	text: string;
}

export interface KirbyProjectResponse {
	id: string; // Page ID/slug from Kirby
	title: string | { de: string; en: string };
	modified: number;
	author?: Author;
	coauthor?: Author;
	authorship_visibility?: boolean;
	url: string;
	formats: string[]; // Array of format strings
	location: string[]; // Array of location strings
	contexts?: string; // Single context string
	// Timeline-specific event fields
	fridayDate?: string; // "allday" or "datetime" or "none"
	fridayTimes?: TimelineEventTime[];
	saturdayDate?: string; // "allday" or "datetime" or "none"
	saturdayTimes?: TimelineEventTime[];
	sundayDate?: string; // "allday" or "datetime" or "none"
	sundayTimes?: TimelineEventTime[];
	uuid: string;
	images: KirbySrcsetImageEntry[]; // Added based on new structure
	content?: ContentBlock[]; // Updated to reflect parsed blocks
	titleImage?: TitleImageBlock[]; // Updated to match actual structure
	// Enhanced data
	enrichedLocations?: EnrichedLocationData[];
	enrichedFormats?: EnrichedFormatData[];
	enrichedContexts?: EnrichedContextData[];
}

// Kirby API wrapper response for projects (with pagination)
export interface KirbyApiResponse<T> {
	code: number;
	result: {
		data: T;
		pagination: {
			page: number;
			pages: number;
			offset: number;
			limit: number;
			total: number;
		};
	};
	status: string;
}

// KQL query structure
export interface KqlQuery {
	query: string;
	select?: Record<string, unknown>;
	pagination?: {
		limit?: number;
		offset?: number;
		page?: number;
	};
}

// KQL selections for initial project loading (with title images only)

// KQL selections for loading additional images when needed with native srcset

// Default KQL selections for different entity types (uses native srcset)

// KQL field mappings for filtering
