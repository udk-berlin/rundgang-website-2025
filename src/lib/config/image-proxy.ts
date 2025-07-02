import { env } from '$env/dynamic/public';

/**
 * Global image proxy configuration
 * In development: Uses Vite proxy to route through staging server
 * In production/staging: Transforms HTTP dev server URLs to HTTPS staging URLs
 */
export const IMAGE_PROXY_CONFIG = {
	// Enable proxy in development, disable in production
	// Can be overridden with VITE_ENABLE_IMAGE_PROXY=false
	enabled: env.PUBLIC_ENABLE_IMAGE_PROXY !== 'false',

	// Dev server base URL that needs proxying
	devServerUrl: env.PUBLIC_DEV_KIRBY_URL || 'http://194.95.202.68:8000/',

	// Proxy route path (handled by Vite in dev)
	proxyPath: '/proxy-image/',

	// Production staging server (fallback if needed)
	stagingServer:
		env.PUBLIC_STAGING_PROXY_SERVER ||
		'https://rundgang-website-2025.medienhaus.udk-berlin.de/proxy-image/'
} as const;

/**
 * Transform image URL based on environment
 * - Development: Uses Vite proxy route
 * - Production/Staging: Transforms HTTP dev server URLs to HTTPS staging URLs to prevent mixed content errors
 */
export function getImageUrl(originalUrl: string): string {
	if (IMAGE_PROXY_CONFIG.enabled) {
		if (originalUrl.startsWith(IMAGE_PROXY_CONFIG.devServerUrl)) {
			const pathSegment = originalUrl.replace(IMAGE_PROXY_CONFIG.devServerUrl, '');
			return `${IMAGE_PROXY_CONFIG.stagingServer}${pathSegment}`;
		}
		return originalUrl;
	}

	// When proxy is disabled, return the original URL unchanged
	return originalUrl;
}

/**
 * Check if we're currently using image proxying
 */
export function isProxyEnabled(): boolean {
	return IMAGE_PROXY_CONFIG.enabled;
}
