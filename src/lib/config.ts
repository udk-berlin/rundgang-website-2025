// API Configuration
export const API_CONFIG = {
	// Default to production URL - will be overridden by server config in server contexts
	// BASE_URL: 'https://rundgang-cms.udk-berlin.de/api',
	BASE_URL: 'http://194.95.202.68:8000/api',

	// Development URL for reference
	DEV_URL: 'http://194.95.202.68:8000/api',

	// Production URL
	// PROD_URL: 'https://rundgang-cms.udk-berlin.de/api'
	PROD_URL: 'http://194.95.202.68:8000/api'
};

// Authentication configuration
export const AUTH_CONFIG = {
	// No default credentials for security - server contexts use server config
	BASIC_AUTH: ''
};

// Cache configuration
export const CACHE_CONFIG = {
	// Default TTL values in milliseconds
	FILTER_TTL: 60 * 60 * 1000, // 60 minutes for filter data
	CONTENT_TTL: 30 * 60 * 1000, // 30 minutes for content data

	// Cache sizes
	FILTER_CACHE_SIZE: 50, // Max 50 filter entries
	CONTENT_CACHE_SIZE: 300, // Max 300 content entries

	// Cleanup interval
	CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes

	// Enable/disable caching (useful for development)
	ENABLED: true, // Can be disabled with CACHE_ENABLED env var in server contexts

	// Modified tracking configuration
	MODIFIED_API_CACHE_TTL: 60 * 1000, // Cache modified timestamps for 1 minute

	// Cache warmup configuration
	WARMUP: {
		ENABLED: true, // Re-enabled with proper error handling
		STARTUP_DELAY: 0,
		AGGRESSIVE: false
	}
};

// Filter API endpoints
export const FILTER_ENDPOINTS = {
	CONTEXTS: '/2025/contexts',
	LOCATIONS: '/2025/locations',
	FORMATS: '/2025/formats'
} as const;
