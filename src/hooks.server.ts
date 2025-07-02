import { externalDataCache } from './lib/external-data-cache';
import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';




// Initialize external data cache when server starts
let cacheInitialized = false;

// Initialize cache on server startup
async function initializeServerCache() {
	if (cacheInitialized) return;

	try {
		console.log('🚀 Starting server data initialization...');

		await externalDataCache.initialize();

		cacheInitialized = true;
		console.log('✅ Server initialization completed successfully');
	} catch (error) {
		// console.error('❌ Failed to initialize server data on startup:', error);
		// Don't throw here to avoid crashing the server
		// The data will be loaded on first request instead
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
	console.log('Received SIGINT, cleaning up external data cache...');
	externalDataCache.destroy();
	process.exit(0);
});

process.on('SIGTERM', () => {
	console.log('Received SIGTERM, cleaning up external data cache...');
	externalDataCache.destroy();
	process.exit(0);
});
