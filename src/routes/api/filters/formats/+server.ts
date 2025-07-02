import { SERVER_API_CONFIG, SERVER_AUTH_CONFIG } from '$lib/config.server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchFormatCounts } from '$lib/kql-helpers';
import { logger } from '$lib/utils.server';
import { filterCache } from '$lib/cache-enhanced';

// Define the structure for a format item
interface FormatItem {
	key: string;
	name: string;
	projectCount?: number; // To store the count of projects
}

export const GET: RequestHandler = async () => {
	//  Check cache
	const cachedData = filterCache.get('formats');
	if (cachedData) {
		return json(cachedData);
	}

	const response = await fetch(`${SERVER_API_CONFIG.BASE_URL}/2025/formats`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
		}
	});

	if (!response.ok) {
		// console.log(`Error fetching formats: ${response.status}`);
		throw new Error(`Failed to fetch formats: ${response.status}`);
	}

	const formatData = (await response.json()) as FormatItem[];

	// Extract all IDs from the format data
	const formatIds = formatData.map((format) => format.key).filter((id) => id != null);

	let projectCounts: Record<string, number> = {};
	if (formatIds.length > 0) {
		console.log(`Fetching project counts for ${formatIds.length} format IDs`);
		projectCounts = await fetchFormatCounts(
			SERVER_API_CONFIG.BASE_URL,
			SERVER_AUTH_CONFIG.BASIC_AUTH,
			formatIds
		);
	} else {
		console.log('No format IDs found to fetch counts for.');
	}

	// Assign project counts to each format item
	const formatsWithCounts = formatData.map((format) => ({
		...format,
		projectCount: projectCounts[format.key] ?? 0
	}));

	filterCache.set('formats', formatsWithCounts, 30 * 60 * 1000); // 30 minutes

	return json(formatsWithCounts);
};
