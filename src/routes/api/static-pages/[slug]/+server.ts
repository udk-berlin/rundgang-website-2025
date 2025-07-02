import type { RequestHandler } from '@sveltejs/kit';
import { SERVER_API_CONFIG, SERVER_AUTH_CONFIG } from '$lib/config.server';

const getStaticPage = async (slug: string, language: string) => {
	try {
		const query = {
			query: `site.children.template("2025_static").filterBy('id', '${slug}')`,
			select: {
				title: true,
				modified: true,
				url: true,
				content: {
					query: 'page.content_field.toBlocks'
				}
			}
		};

		console.log('Query:', query);
		console.log('URL:', `${SERVER_API_CONFIG.BASE_URL}/query`);
		console.log('Auth:', ` ${SERVER_AUTH_CONFIG.BASIC_AUTH}`);

		const response = await fetch(`${SERVER_API_CONFIG.BASE_URL}/query`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Language': language,
				Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
			},
			body: JSON.stringify(query)
		});

		console.log('Response:', response);

		if (!response.ok) {
			throw new Error(`API request failed: ${response.status}`);
		}

		const data = await response.json();
		console.log('Result:', JSON.stringify(data));

		return data;
	} catch (error) {
		console.error('Failed to fetch static page', error);
		throw error;
	}
};

export const GET: RequestHandler = async ({ params }): Promise<Response> => {
	const { slug } = params;

	if (!slug) {
		return new Response('Missing slug', { status: 400 });
	}

	try {
		const enData = await getStaticPage(slug, 'en');
		const deData = await getStaticPage(slug, 'de');

		return new Response(JSON.stringify({ enData, deData }), { 
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('API Error:', error);
		return new Response('Failed to fetch static page data', { status: 500 });
	}
};
