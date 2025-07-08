// Project-specific types

import type { EnrichedFormatData, EnrichedContextData, EnrichedLocationData } from './kirby';
import type { KirbySrcsetImageEntry } from './common';
import type { TimelineEvent } from './timeline';
import type { ScheduleByDay } from '../transformers/projects';

// Full project representation (complete data for detail view)
export interface Project {
	id: string;
	uuid: string;
	modified: string;
	title: { de: string; en: string };
	author: string;
	coauthors?: string[];
	authorship_visibility?: boolean;
	formats: EnrichedFormatData[];
	contexts: EnrichedContextData[];
	location?: EnrichedLocationData;
	timelineEvents: TimelineEvent[];
	schedule: ScheduleByDay;
	url: string;
	titleImage?: KirbySrcsetImageEntry[];
	images?: KirbySrcsetImageEntry[];
	content?: BilingualContentBlock[];
	// Legacy individual date fields for backward compatibility
	fridayDate?: string | string[];
	saturdayDate?: string | string[];
	sundayDate?: string | string[];
}

// Bilingual content block interface
export interface BilingualContentBlock {
	id: string;
	type: string;
	isHidden: boolean;
	content: {
		text?: { de: string; en: string };
		level?: string;
		image?: KirbySrcsetImageEntry[];
		alt?: { de: string; en: string };
		author?: string;
		license?: string;
	};
}

// Project query options
export interface ProjectQueryOptions {
	limit?: number;
	offset?: number;
	query?: string;
	formats?: string[];
	locations?: string[];
	contexts?: string[];
	searchTerm?: string;
	
	metadataOnly?: boolean; // New flag for lightweight loading
}

// Project fetch request body
export interface ProjectsRequestBody extends Record<string, unknown> {
	query?: string;
	select?: Record<string, unknown>;
	limit?: number;
	offset?: number;
	page?: number;
	
	selectConfig?: 'default' | 'initial' | 'images'; // Configuration for different select modes
	metadataOnly?: boolean;
}

// Project filtering options
export interface ProjectFilters {
	formats?: string[];
	locations?: string[];
	contexts?: string[];
	yearRange?: {
		from?: number;
		to?: number;
	};
}

// Project sorting options
export type ProjectSortField = 'title' | 'author' | 'year' | 'created' | 'random';
export type ProjectSortOrder = 'asc' | 'desc';

export interface ProjectSortOptions {
	field: ProjectSortField;
	order: ProjectSortOrder;
}

// Re-export centralized project queries for backward compatibility
export { PROJECT_QUERIES } from '../queries/kirby';
