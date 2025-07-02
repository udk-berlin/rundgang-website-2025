import { env } from '$env/dynamic/private';

// Server-only API Configuration with environment variable overrides
export const SERVER_API_CONFIG = {
	// Use private environment variable, fallback to production default
	BASE_URL: env.API_BASE_URL
};

// Server-only Authentication configuration with environment variable overrides
export const SERVER_AUTH_CONFIG = {
	// Lazy-loaded auth - only throws error when accessed
	// get BASIC_AUTH() {
	// 	if (!env.API_AUTH) {
	// 		throw new Error('API_AUTH environment variable is required but not set');
	// 	}
	// 	return env.API_AUTH;
	// }
	BASIC_AUTH: !env.API_AUTH.startsWith('Basic') ? `Basic ${env.API_AUTH}` : env.API_AUTH
};

// Server-only Cache configuration with environment variable overrides
export const SERVER_CACHE_CONFIG = {
	// Default TTL values in milliseconds
	FILTER_TTL: 60 * 60 * 1000, // 30 minutes for filter data
	CONTENT_TTL: 10 * 60 * 1000, // 10 minutes for content data

	// Cache sizes
	FILTER_CACHE_SIZE: 50, // Max 50 filter entries
	CONTENT_CACHE_SIZE: 200, // Max 200 content entries

	// Cleanup interval
	CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes

	// Enable/disable caching (can be disabled with CACHE_ENABLED=false)
	ENABLED: env.CACHE_ENABLED !== 'false' // Default enabled
};
