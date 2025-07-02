/**
 * Centralized Kirby KQL queries for consistent API structure
 * All Kirby queries should be defined here to ensure consistency
 */

// Standard image srcset sizes used across all queries
const SRCSET_SIZES = [300, 600, 900, 1200, 1800, 2400];

// Common select patterns for reuse
const IMAGE_SELECT = {
	uuid: true,
	alt: 'file.alt',
	originalUrl: 'file.url',
	originalWidth: 'file.width',
	originalHeight: 'file.height',
	srcset: {
		query: `file.srcset([${SRCSET_SIZES.join(', ')}])`
	}
};

const TITLE_IMAGE_SELECT = {
	query: 'page.intro_field_title_image.toBlocks',
	select: {
		id: 'block.id',
		type: 'block.type',
		image: {
			query: 'block.image.toFile',
			select: {
				uuid: true,
				alt: 'file.alt',
				originalUrl: 'file.url',
				originalWidth: 'file.width',
				originalHeight: 'file.height',
				srcset: {
					query: `file.srcset(${SRCSET_SIZES.join(', ')})`
				}
			}
		}
	}
};

const AUTHOR_SELECT = {
	query: 'page.author.toUser',
	select: {
		username: true
	}
};
const COAUTHOR_SELECT = 'page.coauthor.toUser';
export const PROJECT_SELECT_INITIAL = {
	title: true,
	author: AUTHOR_SELECT,
	coauthor: COAUTHOR_SELECT,
	modified: true,
	url: true,
	formats: {
		query: 'page.format_field_select.toObject'
	},
	location: {
		query: 'page.location_field_select.toObject'
	},
	contexts: true,
	// Timeline-specific event fields
	fridayDate: true,
	fridayTimes: {
		query: 'page.event_field_date_time_friday_times.toObject'
	},
	saturdayDate: true,
	saturdayTimes: {
		query: 'page.event_field_date_time_saturday_times.toObject'
	},
	sundayDate: true,
	sundayTimes: {
		query: 'page.event_field_date_time_sunday_times.toObject'
	},
	uuid: true,
	titleImage: {
		query: 'page.intro_field_title_image.toBlocks',
		select: {
			id: 'block.id',
			type: 'block.type',
			content: {
				alt: 'block.alt',
				image: {
					query: 'block.image.toFile',
					select: {
						uuid: true,
						alt: 'file.alt',
						originalUrl: 'file.url',
						originalWidth: 'file.width',
						originalHeight: 'file.height',
						srcset: {
							query: 'file.srcset([320, 640, 1024])'
						}
					}
				}
			}
		}
	},
	content: {
		query: 'page.content_field.toBlocks'
	}
} as const;

export const PROJECT_SELECT_WITH_IMAGES = {
	uuid: true,
	images: {
		query: 'page.files',
		select: {
			uuid: true,
			alt: 'file.alt',
			originalUrl: 'file.url',
			originalWidth: 'file.width',
			originalHeight: 'file.height',
			srcset: {
				query: 'file.srcset([300, 600, 1200, 1800, 2400])'
			}
		}
	}
} as const;

export const DEFAULT_PROJECT_SELECT = {
	...PROJECT_SELECT_INITIAL,
	images: {
		query: 'page.files',
		select: {
			uuid: true,
			alt: 'file.alt',
			originalUrl: 'file.url',
			originalWidth: 'file.width',
			originalHeight: 'file.height',
			srcset: {
				query: 'file.srcset([300, 600, 1200, 1800, 2400])'
			}
		}
	}
} as const;

export const KQL_FILTER_FIELDS = {
	CATEGORIES: 'categories',
	FORMATS: 'formats',
	LOCATIONS: 'location'
} as const;

const EVENT_FIELDS_SELECT = {
	fridayDate: {
		query: 'page.event_field_date_time_friday'
	},
	fridayTimes: {
		query: 'page.event_field_date_time_friday_times.toObject'
	},
	saturdayDate: {
		query: 'page.event_field_date_time_saturday'
	},
	saturdayTimes: {
		query: 'page.event_field_date_time_saturday_times.toObject'
	},
	sundayDate: {
		query: 'page.event_field_date_time_sunday'
	},
	sundayTimes: {
		query: 'page.event_field_date_time_sunday_times.toObject'
	}
};

// Project query selects
export const PROJECT_SELECTS = {
	/**
	 * Lightweight metadata select for ProjectCard components
	 * Includes title images but minimal image data
	 */
	METADATA: {
		id: true,
		title: true,
		modified: true,
		author: AUTHOR_SELECT,
		coauthor: COAUTHOR_SELECT,
		url: true,
		formats: {
			query: 'page.format_field_select.toObject'
		},
		location: {
			query: 'page.location_field_select.toObject'
		},
		contexts: 'page.categories',
		...EVENT_FIELDS_SELECT,
		uuid: true,
		titleImage: TITLE_IMAGE_SELECT,
		images: {
			query: 'page.files',
			select: IMAGE_SELECT
		}
	},

	/**
	 * Full project select for ProjectSingle components
	 * Includes all metadata plus content blocks
	 */
	FULL: {
		id: true,
		title: true,
		modified: true,
		author: AUTHOR_SELECT,
		coauthor: COAUTHOR_SELECT,
		url: true,
		formats: {
			query: 'page.format_field_select.toObject'
		},
		location: {
			query: 'page.location_field_select.toObject'
		},
		contexts: 'page.categories',
		...EVENT_FIELDS_SELECT,
		uuid: true,
		titleImage: TITLE_IMAGE_SELECT,
		images: {
			query: 'page.files',
			select: IMAGE_SELECT
		},
		event_field_date_time: {
			query: 'page.event_field_date_time.toObject'
		},
		content: {
			query: 'page.content_field.toBlocks'
		}
	},

	MODIFIED: {
		uuid: true,
		modified: true
	},

	/**
	 * Images-only select for loading additional images
	 * Used when fetching images separately from metadata
	 */
	IMAGES_ONLY: {
		uuid: true,
		images: {
			query: 'page.files',
			select: IMAGE_SELECT
		}
	}
};

// Common project queries
export const PROJECT_QUERIES = {
	ALL: 'site.children.unlisted.template("2025")',
	BY_ID: (id: string) => `site.children.unlisted.template("2025").filterBy('id', '${id}')`,
	BY_FORMAT: (format: string) =>
		`site.children.unlisted.template("2025").filterBy('format_field_select', '${format}')`,
	BY_LOCATION: (location: string) =>
		`site.children.unlisted.template("2025").filterBy('location_field_select', '${location}')`,
	BY_CATEGORY: (category: string) =>
		`site.children.unlisted.template("2025").filterBy('categories', '*=', '${category}')`,
	SEARCH: (term: string) => `site.children.unlisted.template("2025").search('${term}')`,
	RECENT: (days: number) =>
		`site.children.unlisted.template("2025").filterBy('created', '>', date('${days} days ago'))`,
	BY_YEAR: (year: number) => `site.children.unlisted.template("2025").filterBy('year', '${year}')`
} as const;

// KQL request body builders
export function createProjectsKQL(
	query: string = PROJECT_QUERIES.ALL,
	selectType: 'metadata' | 'full' | 'images' | 'modified' = 'metadata',
	pagination?: {
		limit?: number;
		offset?: number;
		page?: number;
	}
) {
	let select;
	switch (selectType) {
		case 'metadata':
			select = PROJECT_SELECTS.METADATA;
			break;
		case 'full':
			select = PROJECT_SELECTS.FULL;
			break;
		case 'images':
			select = PROJECT_SELECTS.IMAGES_ONLY;
			break;
		case 'modified':
			select = PROJECT_SELECTS.MODIFIED;
			break;
		default:
			select = PROJECT_SELECTS.METADATA;
	}

	return {
		query,
		select,
		pagination: pagination || {
			limit: -1,
			offset: 0,
			page: 1
		}
	};
}

// Export constants for external use
export const KIRBY_SRCSET_SIZES = SRCSET_SIZES;

// Helper functions for query building
export function buildFilterQuery(
	baseQuery: string = PROJECT_QUERIES.ALL,
	filters: {
		formats?: string[];
		locations?: string[];
		contexts?: string[];
		searchTerm?: string;
	} = {}
): string {
	let query = baseQuery;

	if (filters.formats && filters.formats.length > 0) {
		const formatFilter = filters.formats.map((f) => `'${f}'`).join(',');
		query += `.filterBy('format_field_select', 'in', [${formatFilter}])`;
	}

	if (filters.locations && filters.locations.length > 0) {
		const locationFilter = filters.locations.map((l) => `'${l}'`).join(',');
		query += `.filterBy('location_field_select', 'in', [${locationFilter}])`;
	}

	if (filters.contexts && filters.contexts.length > 0) {
		filters.contexts.forEach((context) => {
			query += `.filterBy('categories', '*=', '${context}')`;
		});
	}

	if (filters.searchTerm) {
		query += `.search('${filters.searchTerm}')`;
	}

	return query;
}
