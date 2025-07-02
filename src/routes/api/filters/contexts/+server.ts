import { SERVER_API_CONFIG, SERVER_AUTH_CONFIG } from '$lib/config.server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchContextCounts } from '$lib/kql-helpers';
import { filterCache } from '$lib/cache-enhanced';

// Types for context data structure
interface BaseItem {
	id: string;
	name: string;
	type: string;
	projectCount?: number | 0;
}

type ClassItem = BaseItem;

interface CourseItem extends BaseItem {
	classes?: ClassItem[];
}

interface InstituteItem extends BaseItem {
	courses?: CourseItem[];
}

interface FacultyItem extends BaseItem {
	institutes?: InstituteItem[];
}

interface InstitutionItem extends BaseItem {
	faculties: FacultyItem[]; // Assuming 'faculties' is always present based on example
}

// Assuming the API /2025/contexts returns a single Institution object.
// If it can return an array, this should be InstitutionItem[] and logic below adjusted.
type ContextStructure = InstitutionItem;

// Helper function to recursively collect all IDs
function collectAllIdsRecursive(item: BaseItem, ids: Set<string>): void {
	if (!item || !item.id) return;
	ids.add(item.id);

	switch (item.type) {
		case 'institution':
			(item as InstitutionItem).faculties?.forEach((f) => collectAllIdsRecursive(f, ids));
			break;
		case 'faculty':
			(item as FacultyItem).institutes?.forEach((i) => collectAllIdsRecursive(i, ids));
			break;
		case 'institute':
			(item as InstituteItem).courses?.forEach((c) => collectAllIdsRecursive(c, ids));
			break;
		case 'course':
			(item as CourseItem).classes?.forEach((cl) => collectAllIdsRecursive(cl, ids));
			break;
		// 'class' and other types have no children to recurse into for this purpose
	}
}

function getAllIdsForContext(institution: InstitutionItem): string[] {
	const ids = new Set<string>();
	collectAllIdsRecursive(institution, ids);
	return Array.from(ids);
}

// Helper function to recursively assign project counts
function assignProjectCountsRecursive(item: BaseItem, counts: Record<string, number>): void {
	if (!item || !item.id) return;
	item.projectCount = counts[item.id] ?? 0;
	switch (item.type) {
		case 'institution':
			(item as InstitutionItem).faculties?.forEach((f) => assignProjectCountsRecursive(f, counts));
			break;
		case 'faculty':
			(item as FacultyItem).institutes?.forEach((i) => assignProjectCountsRecursive(i, counts));
			break;
		case 'institute':
			(item as InstituteItem).courses?.forEach((c) => assignProjectCountsRecursive(c, counts));
			break;
		case 'course':
			(item as CourseItem).classes?.forEach((cl) => assignProjectCountsRecursive(cl, counts));
			break;
	}
}

function assignAllProjectCounts(
	institution: InstitutionItem,
	counts: Record<string, number>
): void {
	assignProjectCountsRecursive(institution, counts);
}

export const GET: RequestHandler = async () => {
	// Check cache
	const cachedData = filterCache.get('contexts');
	if (cachedData) {
		return json(cachedData);
	}

	const response = await fetch(`${SERVER_API_CONFIG.BASE_URL}/2025/contexts`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
		}
	});

	// Type the response data (assuming it's a single InstitutionItem as per example)
	const data = (await response.json()) as InstitutionItem;

	// Collect all IDs from all levels (institution, faculties, institutes, courses, classes)
	const allIds = getAllIdsForContext(data);

	let allProjectCounts: Record<string, number> = {};
	if (allIds.length > 0) {
		allProjectCounts = await fetchContextCounts(
			SERVER_API_CONFIG.BASE_URL,
			SERVER_AUTH_CONFIG.BASIC_AUTH,
			allIds
		);
	}

	// Assign project counts to the institution and all its nested children
	assignAllProjectCounts(data, allProjectCounts);

	// Update cache
	filterCache.set('contexts', data, 30 * 60 * 1000); // 30 minutes

	return json(data);
};
