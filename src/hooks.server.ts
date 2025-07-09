import { externalDataCache } from './lib/external-data-cache';
import { projectContentCache, enhancedCacheUtils } from './lib/cache-enhanced';
import { PROJECT_QUERIES } from './lib/api/queries/kirby';
import { PROJECT_SELECTS } from './lib/api/queries/kirby';
import { SERVER_API_CONFIG, SERVER_AUTH_CONFIG } from './lib/config.server';
import { transformAndValidateProjects } from './lib/api/transformers/projects';
import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import type { KirbyAPIResponse } from './routes/api/projects/+server';

// Initialize external data cache when server starts
let cacheInitialized = false;

// Initialize cache on server startup
async function initializeServerCache() {
	if (cacheInitialized) return;

	try {
		console.log('🚀 Starting server data initialization...');

		await externalDataCache.initialize();
		await initializeProjectCacheWithRefresh();

		cacheInitialized = true;
		console.log('✅ Server initialization completed successfully');
	} catch (error) {
		console.error('❌ Failed to initialize server data on startup:', error);
		// Don't throw here to avoid crashing the server
		// The data will be loaded on first request instead
	}
}

// Initialize project cache with 5-minute background refresh
async function initializeProjectCacheWithRefresh() {
	try {
		console.log('🚀 Initializing project cache with 5-minute server-side refresh...');

		const requestBody = {
			query: PROJECT_QUERIES.ALL,
			select: PROJECT_SELECTS.FULL,
			limit: -1, // Get all projects
			offset: 0,
			page: 1,
			shuffle: true,
			shuffleSeed: 'main-page-2025'
		};

		const cacheKey = enhancedCacheUtils.generateKey('/api/projects', requestBody, 'EN');

		// Set up background refresh for project data every 5 minutes
		await enhancedCacheUtils.setupBackgroundRefresh(
			projectContentCache,
			cacheKey,
			async () => {
				console.log('🔄 Server-side background refresh: Fetching updated project data...');

				const apiUrl = `${SERVER_API_CONFIG.BASE_URL}/query`;
				const response = await fetch(apiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Language': 'en',
						Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
					},
					body: JSON.stringify({
						query: PROJECT_QUERIES.ALL,
						select: PROJECT_SELECTS.FULL,
						pagination: {
							limit: 9999,
							offset: 0,
							page: 1
						}
					})
				});

				if (!response.ok) {
					throw new Error(
						`Server background refresh API error: ${response.status} ${response.statusText}`
					);
				}

				const data: KirbyAPIResponse = await response.json();
				return transformAndValidateProjects(data.result.data);
			},
			5, // Refresh every 5 minutes
			30 * 60 * 1000 // TTL: 30 minutes
		);

		console.log('✅ Project cache initialized with server-side 5-minute background refresh');
	} catch (error) {
		console.error('❌ Failed to initialize project cache with background refresh:', error);
	}
}

if (!building) {
	initializeServerCache();
}

export const handle: Handle = async ({ event, resolve }) => {
	// Ensure cache is initialized before handling requests
	if (!cacheInitialized) {
		await externalDataCache.initialize();
	}

	// Add cache readiness check to locals for use in API routes
	event.locals.externalDataReady = externalDataCache.isReady();

	// Handle image proxy requests
	if (event.url.pathname.startsWith('/proxy-image/')) {
		const imagePath = event.url.pathname.replace('/proxy-image/', '');
		const imageUrl = `http://194.95.202.68:8000/${imagePath}`;

		try {
			console.log(`[Image Proxy] Proxying: ${imageUrl}`);
			const response = await fetch(imageUrl);

			if (!response.ok) {
				// console.warn(`[Image Proxy] Failed: ${response.status} ${response.statusText}`);
				return new Response('Image not found', { status: 404 });
			}

			// Get the image data and forward it
			const imageBuffer = await response.arrayBuffer();
			const contentType = response.headers.get('content-type') || 'image/jpeg';

			return new Response(imageBuffer, {
				headers: {
					'Content-Type': contentType,
					'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
					'Content-Length': imageBuffer.byteLength.toString()
				}
			});
		} catch (error) {
			// console.error(`[Image Proxy] Error:`, error);
			return new Response('Proxy error', { status: 500 });
		}
	}

	const response = await resolve(event);
	return response;
};
// Graceful shutdown cleanup
process.on('SIGINT', () => {
	console.log('Received SIGINT, cleaning up caches and background refreshes...');
	enhancedCacheUtils.stopAllBackgroundRefreshes();
	externalDataCache.destroy();
	process.exit(0);
});

process.on('SIGTERM', () => {
	console.log('Received SIGTERM, cleaning up caches and background refreshes...');
	enhancedCacheUtils.stopAllBackgroundRefreshes();
	externalDataCache.destroy();
	process.exit(0);
});
