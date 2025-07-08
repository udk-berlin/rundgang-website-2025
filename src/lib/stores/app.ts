import { writable } from 'svelte/store';
import { projectsService } from '../api/services/projects';
import { getCurrentLanguage } from './language';

// App initialization state
export const appInitialized = writable(false);
export const cacheReady = writable(false);

/**
 * Initialize the application and preload essential data
 */
export async function initializeApp() {
	try {
		// Initialize project cache in the background with current language
		const currentLanguage = await getCurrentLanguage();
		await projectsService.initializeCache(currentLanguage);
		cacheReady.set(true);

		appInitialized.set(true);
	} catch (error) {
		// Continue without cache rather than failing completely
		appInitialized.set(true);
	}
}

/**
 * Get current cache statistics
 */
export function getCacheStats() {
	return projectsService.getCacheStats();
}

/**
 * Clear all application caches
 */
export function clearAppCache() {
	projectsService.clearCache();
	cacheReady.set(false);
}
