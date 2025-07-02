// kql-helpers.ts
//-------------------------------------------------------------

import { PROJECT_QUERIES } from './api/queries/kirby';

/** Shape of a KQL POST body */
interface KqlRequestBody {
	query: 'site';
	select: Record<string, string>;
}

/**
 * Turn "design-history" (or anything else) into "designHistory".
 * Also prefixes an underscore if the string would start with a digit.
 */
function camelize(input: string): string {
	const safe = input
		// replace any sequence of non-alphanumerics with the next char upper-cased
		.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
		// ensure the first character is never a digit
		.replace(/^[0-9]/, (m) => `_${m}`);
	return safe.charAt(0).toLowerCase() + safe.slice(1);
}

/**
 * Build the JSON body for a single "site" query that counts all given items for a specific field.
 *
 * @param items  List of item strings as stored in the specified field.
 * @param fieldName The name of the field to filter by (e.g., 'categories', 'formats').
 * @returns           JSON-serialisable body for POST /api/query
 */
function buildCountBody(items: string[], fieldName: string): KqlRequestBody {
	const select: Record<string, string> = {};

	items.forEach((item) => {
		const key = `${camelize(item)}`;
		// Escape single quotes that might appear inside the item value
		const value = item.replace(/'/g, "\\'");
		select[key] = `${PROJECT_QUERIES.ALL}.filterBy('${fieldName}', '*=', '${value}').count`;
	});

	return { query: 'site', select };
}

/**
 * Build the JSON body for a single "site" query that counts all given categories.
 *
 * @param categories  List of category strings as stored in the `categories` field.
 * @returns           JSON-serialisable body for POST /api/query
 */
export function buildCategoryCountBody(categories: string[]): KqlRequestBody {
	return buildCountBody(categories, 'categories');
}

/**
 * Build the JSON body for a single "site" query that counts all given formats.
 *
 * @param formats  List of format strings as stored in the `formats` field.
 * @returns           JSON-serialisable body for POST /api/query
 */
export function buildFormatCountBody(formats: string[]): KqlRequestBody {
	return buildCountBody(formats, 'formats');
}

/**
 * Optional convenience wrapper that performs the fetch for a given field and
 * returns the counts as `{ [key: string]: number }`.
 *
 * @param apiUrl   Absolute URL to your /api/query endpoint
 * @param auth     Basic auth string for HTTP Basic auth
 * @param items    List of items for the specified field
 * @param fieldName Name of the field to fetch counts for (e.g., 'categories', 'formats')
 * @param fieldDisplayName User-friendly name for logging (e.g., 'categories', 'formats')
 */
async function fetchCounts(
	apiUrl: string,
	auth: string,
	items: string[],
	fieldName: string,
	fieldDisplayName: string
): Promise<Record<string, number>> {
	const body = buildCountBody(items, fieldName);
	const headers = {
		Authorization: auth,
		'Content-Type': 'application/json',
		Accept: 'application/json'
	};

	const url = `${apiUrl}/query`;

	const res = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		let errorBody = '';
		try {
			errorBody = await res.text();
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (_e) {
			// Ignore if reading body fails
		}
		throw new Error(
			`KQL request for ${fieldDisplayName} failed with status ${res.status}. Body: ${errorBody}`
		);
	}

	const jsonResponse = await res.json();

	if (
		jsonResponse &&
		jsonResponse.code === 200 &&
		jsonResponse.status === 'ok' &&
		jsonResponse.result &&
		typeof jsonResponse.result === 'object' &&
		jsonResponse.result !== null
	) {
		return jsonResponse.result as Record<string, number>;
	} else {
		console.error(
			`KQL API call for ${fieldDisplayName} successful (HTTP 200) but response content is not as expected or indicates an internal error:`,
			jsonResponse
		);
		throw new Error(
			`KQL API response content error for ${fieldDisplayName}. Code: ${jsonResponse?.code}, Status: ${jsonResponse?.status}`
		);
	}
}

/**
 * Optional convenience wrapper that performs the fetch and
 * returns the counts as `{ [key: string]: number }`.
 *
 * @param apiUrl   Absolute URL to your /api/query endpoint
 * @param auth     Basic auth string for HTTP Basic auth
 * @param categories Same category list as above
 */
export async function fetchContextCounts(
	apiUrl: string,
	auth: string,
	contexts: string[]
): Promise<Record<string, number>> {
	return fetchCounts(apiUrl, auth, contexts, 'categories', 'contexts');
}

/**
 * Optional convenience wrapper that performs the fetch and
 * returns the counts as `{ [key: string]: number }`.
 *
 * @param apiUrl   Absolute URL to your /api/query endpoint
 * @param auth     Basic auth string for HTTP Basic auth
 * @param formats Same format list as above
 */
export async function fetchFormatCounts(
	apiUrl: string,
	auth: string,
	formats: string[]
): Promise<Record<string, number>> {
	return fetchCounts(apiUrl, auth, formats, 'format_field_select', 'formats');
}

export async function fetchLocationCounts(
	apiUrl: string,
	auth: string,
	locations: string[]
): Promise<Record<string, number>> {
	return fetchCounts(apiUrl, auth, locations, 'location_field_select', 'locations');
}
