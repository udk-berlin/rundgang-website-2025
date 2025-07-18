import type {
	FilterGroup,
	FilterOption,
	ContextsResponse,
	FormatsResponse,
	LocationsResponse,
	InstitutionItem,
	FormatItem,
	LocationItem,
	FacultyItem
} from '../types/index';

/**
 * Memoized location name normalization
 */
const normalizedNameCache = new Map<string, string>();

function normalizeLocationName(name: string): string {
	if (!name) return '';

	if (normalizedNameCache.has(name)) {
		return normalizedNameCache.get(name)!;
	}

	const normalized = name
		.replace(/ß/g, 'ss')
		.replace(/[äöü]/g, (char) => {
			switch (char) {
				case 'ä':
					return 'ae';
				case 'ö':
					return 'oe';
				case 'ü':
					return 'ue';
				default:
					return char;
			}
		})
		.replace(/\./g, '-')
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/gi, '')
		.toLowerCase()
		.replace(/^-+|-+$/g, '')
		.replace(/-+/g, '-');

	normalizedNameCache.set(name, normalized);
	return normalized;
}

/**
 * Calculate aggregated project count for faculty hierarchy
 */
function calculateFacultyProjectCount(faculty: FacultyItem): number {
	let total = faculty.projectCount ?? 0;

	faculty.institutes?.forEach((institute) => {
		total += institute.projectCount ?? 0;
		institute.courses?.forEach((course) => {
			total += course.projectCount ?? 0;
			course.classes?.forEach((classItem) => {
				total += classItem.projectCount ?? 0;
			});
		});
	});

	return total;
}

/**
 * Transform contexts with optimized hierarchy traversal
 */
export function transformContexts(data: ContextsResponse): FilterGroup[] {
	if (!data?.id || !data.faculties || !Array.isArray(data.faculties)) {
		return [];
	}

	const facultyOptions: FilterOption[] = [];

	// Pre-allocate array if we know the size
	if (data.faculties.length > 0) {
		facultyOptions.length = 0; // Reset if needed
	}

	for (const faculty of data.faculties) {
		if (!faculty?.id || !faculty.name) continue;

		const projectCount = calculateFacultyProjectCount(faculty);

		facultyOptions.push({
			id: faculty.id,
			label: faculty.name,
			value: faculty.id,
			projectCount,
			type: faculty.type
		});
	}

	return facultyOptions.length > 0
		? [
				{
					title: 'Faculties',
					key: 'faculties',
					options: facultyOptions
				}
			]
		: [];
}

/**
 * Transform locations with batch processing
 */
export function transformLocations(data: LocationsResponse): FilterGroup[] {
	if (!Array.isArray(data) || data.length === 0) {
		return [];
	}

	const options: FilterOption[] = [];

	for (const location of data) {
		if (!location?.name) continue;

		const id = normalizeLocationName(location.name);
		if (!id) continue; // Skip if normalization failed

		options.push({
			id,
			label: location.name,
			value: id,
			projectCount: location.projectCount ?? 0
		});
	}

	return options.length > 0
		? [
				{
					title: 'Locations',
					key: 'locations',
					options
				}
			]
		: [];
}

/**
 * Transform formats with validation
 */
export function transformFormats(data: FormatsResponse): FilterGroup[] {
	if (!Array.isArray(data) || data.length === 0) {
		return [];
	}

	const options: FilterOption[] = [];

	for (const item of data) {
		if (!item?.key) continue;

		// Preserve the full format object structure for localization
		const formatObject = {
			key: item.key,
			de: item.de,
			en: item.en
		};

		options.push({
			id: item.key,
			label: item.en || item.name || item.key, // Keep fallback for non-localized display
			value: item.key,
			projectCount: item.projectCount ?? 0,
			// Store the full format object for localization
			formatData: formatObject
		});
	}

	return options.length > 0
		? [
				{
					title: 'Formats',
					key: 'formats',
					options
				}
			]
		: [];
}

/**
 * Batch transform all filter data
 */
export function transformAllFilters(
	contexts: ContextsResponse,
	locations: LocationsResponse,
	formats: FormatsResponse
) {
	return {
		contexts: transformContexts(contexts),
		locations: transformLocations(locations),
		formats: transformFormats(formats)
	};
}

/**
 * Clear transformation caches (useful for testing or memory management)
 */
export function clearTransformationCaches(): void {
	normalizedNameCache.clear();
}
