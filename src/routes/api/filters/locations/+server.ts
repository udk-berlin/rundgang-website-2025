import { SERVER_API_CONFIG, SERVER_AUTH_CONFIG } from '$lib/config.server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchLocationCounts } from '$lib/kql-helpers';
import { filterCache } from '$lib/cache-enhanced';

// Type for a single location item from the API
interface ApiLocationItem {
	name: string;
	street: string;
	postcode: string;
	city: string;
	latitude: string;
	longitude: string;
	normalizedKebabName?: string; // Added to store the kebab-case normalized name
	projectCount?: number; // Added to store project counts
}

// The API /2025/locations returns an array of ApiLocationItem objects.
type LocationsData = ApiLocationItem[];

// Helper function to normalize a single location name to a kebab-case ID
// TODO: Check if this is needed
function normalizeLocationNameForId(name: string): string {
	if (!name) return '';
	let normalized = name;
	// replace ß with ss
	normalized = normalized.replace(/ß/g, 'ss');
	// replace umlauts with their base characters (äöü -> ae, oe, ue)
	normalized = normalized.replace(/[äöü]/g, (char) => {
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
	});
	// Replace dots with dashes
	normalized = normalized.replace(/\./g, '-');
	// Replace spaces with a single dash
	normalized = normalized.replace(/\s+/g, '-');
	// Remove any characters that are not alphanumeric or a dash
	normalized = normalized.replace(/[^a-z0-9-]/gi, '');
	// Convert to lowercase
	normalized = normalized.toLowerCase();
	// Remove leading and trailing dashes
	normalized = normalized.replace(/^-+|-+$/g, '');
	// Replace multiple consecutive dashes with a single dash
	normalized = normalized.replace(/-+/g, '-');
	return normalized;
}

// Helper function to convert kebab-case to camelCase
function kebabToCamelCase(str: string): string {
	if (!str) return '';
	return str.replace(/-([a-z0-9])/g, (match, char) => char.toUpperCase());
}

// Helper function to get all unique 'normalizedKebabName' fields for fetching project counts.
function getAllLocationNormalizedIds(locations: LocationsData): string[] {
	if (!locations) return [];
	const ids = new Set<string>();
	locations.forEach((loc) => {
		if (loc && loc.normalizedKebabName) {
			ids.add(loc.normalizedKebabName);
		}
	});
	return Array.from(ids);
}

// Helper function to assign project counts to location items.
function assignProjectCountsToLocations(
	locations: LocationsData,
	counts: Record<string, number>
): void {
	if (!locations || !counts) return;
	locations.forEach((loc) => {
		if (loc && loc.normalizedKebabName) {
			const camelCaseKey = kebabToCamelCase(loc.normalizedKebabName);
			if (counts[camelCaseKey] !== undefined) {
				loc.projectCount = counts[camelCaseKey];
			} else {
				loc.projectCount = 0;
			}
		} else if (loc) {
			loc.projectCount = 0;
		}
	});
}

export const GET: RequestHandler = async () => {
	// Check cache
	const cachedData = filterCache.get('locations');
	if (cachedData) {
		return json(cachedData);
	}
	// console.log('DEBUG: Fetching locations from:', `${SERVER_API_CONFIG.BASE_URL}/2025/locations`);
	// console.log('DEBUG: Authorization:', SERVER_AUTH_CONFIG.BASIC_AUTH);
	const response = await fetch(`${SERVER_API_CONFIG.BASE_URL}/2025/locations`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error(
			`(GET locations) Failed to fetch locations: ${response.status} ${response.statusText}. Body: ${errorText}`
		);
		throw new Error(`Failed to fetch locations: ${response.status}`);
	}

	// Type the response data as an array of ApiLocationItem
	const locationsData = (await response.json()) as LocationsData;

	// Normalize location names and store them on each item
	locationsData.forEach((loc) => {
		if (loc && loc.name) {
			loc.normalizedKebabName = normalizeLocationNameForId(loc.name);
		}
	});

	// Collect all unique normalized kebab-case IDs for fetching project counts
	const locationIdsForCountFetching = getAllLocationNormalizedIds(locationsData);

	let projectCounts: Record<string, number> = {};
	if (locationIdsForCountFetching.length > 0) {
		projectCounts = await fetchLocationCounts(
			SERVER_API_CONFIG.BASE_URL,
			SERVER_AUTH_CONFIG.BASIC_AUTH,
			locationIdsForCountFetching // Use the normalized kebab-case IDs
		);
	} else {
		console.log(`(GET locations) No normalized location IDs found to fetch project counts for.`);
	}

	// Assign project counts to the locations data
	assignProjectCountsToLocations(locationsData, projectCounts);

	// Update cache with the enriched data
	filterCache.set('locations', locationsData, 30 * 60 * 1000); // 30 minutes

	return json(locationsData);
};
