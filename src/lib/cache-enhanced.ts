// import { LRUCache } from 'lru-cache';
import TTLCache from '@isaacs/ttlcache';
import { CACHE_CONFIG } from './config';
import type { Project } from './api/types/projects';

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

class EnhancedLRUCache<T> {
	private cache: TTLCache<string, CacheEntry<T>>;
	private enabled: boolean;

	constructor(
		options: {
			max?: number;
			ttl?: number; // TTL in milliseconds
			enabled?: boolean;
		} = {}
	) {
		this.enabled = options.enabled ?? CACHE_CONFIG.ENABLED;
		this.cache = new TTLCache({
			max: options.max || 1000,
			ttl: options.ttl || 60 * 60 * 1000, // 1 hour default
			dispose: (value: CacheEntry<T>, key: string) => {
				console.debug(`Cache entry evicted: ${key}`);
			},
			// TTLCache specific options
			updateAgeOnGet: true, // Update TTL when item is accessed
			checkAgeOnGet: true // Check TTL on get and remove if expired
		});
	}

	set(key: string, value: T, ttl?: number): void {
		if (!this.enabled) return;

		const entry: CacheEntry<T> = {
			data: value,
			timestamp: Date.now()
		};

		this.cache.set(key, entry, { ttl });
	}

	get(key: string): T | null {
		if (!this.enabled) return null;

		const entry = this.cache.get(key);
		return entry ? entry.data : null;
	}


	has(key: string): boolean {
		if (!this.enabled) return false;
		return this.cache.has(key);
	}

	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	getStats() {
		console.log('Getting stats...');
		return {
			size: this.cache.size,
			enabled: this.enabled,
			// TTLCache doesn't have calculatedSize or dump methods
			// We can add our own stats here
			info: {
				keys: Array.from(this.cache.keys()),
				remainingTTLs: Array.from(this.cache.keys()).map(key => ({
					key,
					remainingTTL: this.cache.getRemainingTTL(key)
				}))
			}
		};
	}

	// Get remaining TTL for a key
	getRemainingTTL(key: string): number {
		return this.cache.getRemainingTTL(key);
	}

	// Invalidate entries matching a pattern
	invalidatePattern(pattern: string): void {
		const regex = new RegExp(pattern);
		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				this.cache.delete(key);
			}
		}
	}

	// Get all keys
	keys(): IterableIterator<string> {
		return this.cache.keys();
	}

	// Get all values
	values(): IterableIterator<CacheEntry<T>> {
		return this.cache.values();
	}

	// Get all entries
	entries(): IterableIterator<[string, CacheEntry<T>]> {
		return this.cache.entries();
	}
}

// Specialized cache instances

export const projectContentCache = new EnhancedLRUCache<Project[]>({
	max: 50, // Store fewer full projects since they're heavy
	ttl: CACHE_CONFIG.CONTENT_TTL,
	enabled: CACHE_CONFIG.ENABLED
});

export const singleProjectCache = new EnhancedLRUCache<Project | null>({
	max: 100, // Cache individual projects
	ttl: CACHE_CONFIG.CONTENT_TTL,
	enabled: CACHE_CONFIG.ENABLED
});

export const filterCache = new EnhancedLRUCache<unknown>({
	max: CACHE_CONFIG.FILTER_CACHE_SIZE,
	ttl: CACHE_CONFIG.FILTER_TTL,
	enabled: CACHE_CONFIG.ENABLED
});

export const imageCache = new EnhancedLRUCache<HTMLImageElement>({
	max: 1000, // Cache preloaded images
	ttl: 30 * 60 * 1000, // 30 minutes for images
	enabled: CACHE_CONFIG.ENABLED
});

// Enhanced cache utilities
export const enhancedCacheUtils = {
	/**
	 * Get or set with automatic cache population
	 */
	async getOrSet<T>(
		cache: EnhancedLRUCache<T>,
		key: string,
		fallbackFn: () => Promise<T>,
		ttl?: number
	): Promise<T> {
		const cached = cache.get(key);
		if (cached !== null) {
			// console.debug(`Enhanced cache HIT for key: ${key}`);
			return cached;
		}

		// console.debug(`Enhanced cache MISS for key: ${key}, fetching from source`);

		const data = await fallbackFn();
		cache.set(key, data, ttl);
		return data;
	},

	/**
	 * Pre-load data for both languages and cache them separately
	 */
	async preloadBothLanguages<T>(
		cache: EnhancedLRUCache<T>,
		baseKey: string,
		fetchFn: (language: 'DE' | 'EN') => Promise<T>,
		ttl?: number
	): Promise<{ de: T; en: T }> {
		const deKey = `${baseKey}?lang=DE`;
		const enKey = `${baseKey}?lang=EN`;

		// Check if both languages are already cached
		const cachedDE = cache.get(deKey);
		const cachedEN = cache.get(enKey);

		if (cachedDE !== null && cachedEN !== null) {
			// console.debug(`Both languages cached for: ${baseKey}`);
			return { de: cachedDE, en: cachedEN };
		}

		// console.debug(`Pre-loading both languages for: ${baseKey}`);

		// Fetch both languages in parallel
		const [deData, enData] = await Promise.all([
			cachedDE !== null ? Promise.resolve(cachedDE) : fetchFn('DE'),
			cachedEN !== null ? Promise.resolve(cachedEN) : fetchFn('EN')
		]);

		// Cache both versions
		if (cachedDE === null) cache.set(deKey, deData, ttl);
		if (cachedEN === null) cache.set(enKey, enData, ttl);

		return { de: deData, en: enData };
	},

	/**
	 * Get data for specific language from cache, with fallback to fetch if not available
	 */
	async getLanguageVersion<T>(
		cache: EnhancedLRUCache<T>,
		baseKey: string,
		language: 'DE' | 'EN',
		fetchFn: (language: 'DE' | 'EN') => Promise<T>,
		ttl?: number
	): Promise<T> {
		const languageKey = `${baseKey}?lang=${language}`;

		const cached = cache.get(languageKey);
		if (cached !== null) {
			// console.debug(`Language cache HIT for: ${languageKey}`);
			return cached;
		}

		// console.debug(`Language cache MISS for: ${languageKey}, fetching...`);
		const data = await fetchFn(language);
		cache.set(languageKey, data, ttl);
		return data;
	},

	/**
	 * Switch between cached language versions without refetching
	 */
	switchLanguageVersion<T>(
		cache: EnhancedLRUCache<T>,
		baseKey: string,
		language: 'DE' | 'EN'
	): T | null {
		const languageKey = `${baseKey}?lang=${language}`;
		return cache.get(languageKey);
	},

	/**
	 * Check if both language versions are cached
	 */
	hasBothLanguages<T>(
		cache: EnhancedLRUCache<T>,
		baseKey: string
	): { de: boolean; en: boolean; both: boolean } {
		const deKey = `${baseKey}?lang=DE`;
		const enKey = `${baseKey}?lang=EN`;

		const hasDE = cache.has(deKey);
		const hasEN = cache.has(enKey);

		return {
			de: hasDE,
			en: hasEN,
			both: hasDE && hasEN
		};
	},

	/**
	 * Batch cache operations
	 */
	async batchSet<T>(
		cache: EnhancedLRUCache<T>,
		entries: Array<{ key: string; value: T; ttl?: number }>
	): Promise<void> {
		entries.forEach(({ key, value, ttl }) => {
			cache.set(key, value, ttl);
		});
	},

	/**
	 * Generate hierarchical cache keys with language support
	 */
	generateKey(endpoint: string, params?: Record<string, unknown>, language?: string): string {
		// Include language in cache key to prevent cross-language data pollution
		const finalParams = { ...params };

		// Add current language to params if not already present
		if (!finalParams.lang && !finalParams.language) {
			finalParams.lang = language || 'EN'; // Use provided language or fallback
		}

		if (!finalParams || Object.keys(finalParams).length === 0) {
			return `${endpoint}?lang=${language || 'EN'}`; // Always include language
		}

		// Create deterministic key from sorted params
		const sortedParams = Object.keys(finalParams)
			.sort()
			.map((key) => {
				const value = finalParams[key];
				if (typeof value === 'object') {
					return `${key}=${JSON.stringify(value)}`;
				}
				return `${key}=${value}`;
			})
			.join('&');

		return `${endpoint}?${sortedParams}`;
	},

	/**
	 * Generate base key without language for multi-language caching
	 */
	generateBaseKey(endpoint: string, params?: Record<string, unknown>): string {
		if (!params || Object.keys(params).length === 0) {
			return endpoint;
		}

		// Create deterministic key from sorted params (excluding language)
		const filteredParams = { ...params };
		delete filteredParams.lang;
		delete filteredParams.language;

		if (Object.keys(filteredParams).length === 0) {
			return endpoint;
		}

		const sortedParams = Object.keys(filteredParams)
			.sort()
			.map((key) => {
				const value = filteredParams[key];
				if (typeof value === 'object') {
					return `${key}=${JSON.stringify(value)}`;
				}
				return `${key}=${value}`;
			})
			.join('&');

		return `${endpoint}?${sortedParams}`;
	},

	/**
	 * Warm up cache with predictive loading
	 */
	async warmupCache<T>(
		cache: EnhancedLRUCache<T>,
		keys: string[],
		fetchFn: (key: string) => Promise<T>
	): Promise<void> {
		const promises = keys.map(async (key) => {
			if (!cache.has(key)) {
				try {
					const data = await fetchFn(key);
					cache.set(key, data);
				} catch (error) {
					// console.warn(`Failed to warm up cache for key ${key}:`, error);
				}
			}
		});

		await Promise.allSettled(promises);
	},

	/**
	 * Clear related cache entries
	 */
	invalidateRelated(pattern: string): void {
		projectContentCache.invalidatePattern(pattern);
		filterCache.invalidatePattern(pattern);
	},

	/**
	 * Clear only specific language version
	 */
	invalidateLanguageVersion(baseKey: string, language: 'DE' | 'EN'): void {
		const languageKey = `${baseKey}?lang=${language}`;
		projectContentCache.delete(languageKey);
		filterCache.delete(languageKey);
	},

	/**
	 * Check if cached project data needs updating based on modified timestamps
	 * Checks on every request for immediate updates
	 */
	async checkForUpdates<T extends { uuid: string; modified: string }>(
		cache: EnhancedLRUCache<T[]>,
		cacheKey: string,
		fetchModifiedFn: () => Promise<Array<{ uuid: string; modified: string }>>,
		fetchUpdatedProjectsFn: (uuids: string[]) => Promise<T[]>
	): Promise<T[] | null> {
		const cachedData = cache.get(cacheKey);
		if (!cachedData) {
			return null; // No cached data, need full fetch
		}

		try {
			console.debug(`🔍 Checking for updates for ${cacheKey}`);

			// Get current modified timestamps from server
			const currentModified = await fetchModifiedFn();
			const currentModifiedMap = new Map(currentModified.map(p => [p.uuid, p.modified]));

			// Check which cached projects are outdated
			const outdatedUuids: string[] = [];
			const cachedModifiedMap = new Map(cachedData.map(p => [p.uuid, p.modified]));

			// Only check projects that are in cache, not all server projects
			for (const [uuid, cachedModified] of cachedModifiedMap) {
				const serverModified = currentModifiedMap.get(uuid);
				if (!serverModified || cachedModified !== serverModified) {
					outdatedUuids.push(uuid);
				}
			}

			// Check for deleted projects (in cache but not on server)
			const deletedUuids: string[] = [];
			for (const [uuid] of cachedModifiedMap) {
				if (!currentModifiedMap.has(uuid)) {
					deletedUuids.push(uuid);
				}
			}

			// If no updates needed, return cached data
			if (outdatedUuids.length === 0 && deletedUuids.length === 0) {
				console.debug(`✅ Cache is up to date for key: ${cacheKey}`);
				return cachedData;
			}

			console.debug(`🔄 Found ${outdatedUuids.length} outdated and ${deletedUuids.length} deleted projects`);

			// Fetch only the updated projects
			let updatedProjects: T[] = [];
			if (outdatedUuids.length > 0) {
				updatedProjects = await fetchUpdatedProjectsFn(outdatedUuids);
			}

			// Update cache with selective replacement
			const updatedData = this.replaceProjectsInCache(cachedData, updatedProjects, deletedUuids);
			cache.set(cacheKey, updatedData);

			return updatedData;
		} catch (error) {
			console.warn(`Failed to check for updates on cache key ${cacheKey}:`, error);
			return cachedData; // Return cached data on error
		}
	},

	/**
	 * Replace specific projects in cached data and remove deleted ones
	 */
	replaceProjectsInCache<T extends { uuid: string }>(
		cachedData: T[],
		updatedProjects: T[],
		deletedUuids: string[] = []
	): T[] {
		const updatedMap = new Map(updatedProjects.map(p => [p.uuid, p]));
		const deletedSet = new Set(deletedUuids);

		// Replace updated projects and filter out deleted ones
		const result = cachedData
			.filter(project => !deletedSet.has(project.uuid))
			.map(project => updatedMap.get(project.uuid) || project);

		// Add any new projects that weren't in the original cache
		for (const updatedProject of updatedProjects) {
			const existsInCache = cachedData.some(p => p.uuid === updatedProject.uuid);
			if (!existsInCache) {
				result.push(updatedProject);
			}
		}

		console.debug(`🔄 Cache update: ${updatedProjects.length} updated, ${deletedUuids.length} deleted, ${result.length} total`);
		return result;
	},

	/**
	 * Selective cache invalidation for specific projects
	 */
	invalidateProjects(projectUuids: string[]): void {
		const uuidSet = new Set(projectUuids);
		
		// Invalidate project content cache entries that contain these projects
		for (const key of projectContentCache.keys()) {
			const cached = projectContentCache.get(key);
			if (cached && Array.isArray(cached)) {
				const hasTargetProject = cached.some((project: any) => 
					project.uuid && uuidSet.has(project.uuid)
				);
				if (hasTargetProject) {
					projectContentCache.delete(key);
					console.debug(`🗑️  Invalidated project cache key: ${key}`);
				}
			}
		}

		// Invalidate single project cache entries
		for (const uuid of projectUuids) {
			for (const key of singleProjectCache.keys()) {
				if (key.includes(uuid)) {
					singleProjectCache.delete(key);
					console.debug(`🗑️  Invalidated single project cache key: ${key}`);
				}
			}
		}
	},

	/**
	 * Update cache with modified tracking for automatic updates
	 */
	async getOrSetWithModifiedTracking<T extends { uuid: string; modified: string }>(
		cache: EnhancedLRUCache<T[]>,
		key: string,
		fallbackFn: () => Promise<T[]>,
		fetchModifiedFn: () => Promise<Array<{ uuid: string; modified: string }>>,
		fetchUpdatedProjectsFn: (projectUuids: string[]) => Promise<T[]>,
		ttl?: number
	): Promise<T[]> {
		// First check if we can do selective updates
		const selectiveUpdate = await this.checkForUpdates(
			cache,
			key,
			fetchModifiedFn,
			fetchUpdatedProjectsFn
		);

		if (selectiveUpdate !== null) {
			return selectiveUpdate;
		}

		// No cached data, do full fetch
		console.debug(`💾 No cached data for key: ${key}, performing full fetch`);
		const data = await fallbackFn();
		cache.set(key, data, ttl);
		return data;
	},

	/**
	 * Get comprehensive cache statistics
	 */
	getStats() {
		return {
			projectContent: projectContentCache.getStats(),
			singleProject: singleProjectCache.getStats(),
			filters: filterCache.getStats(),
			images: imageCache.getStats()
		};
	}
};

// Auto-cleanup and monitoring
if (CACHE_CONFIG.ENABLED) {
	setInterval(() => {
		const stats = enhancedCacheUtils.getStats();
		console.debug('Cache statistics:', stats);
	}, CACHE_CONFIG.CLEANUP_INTERVAL);
}

export default {
	projectContentCache,
	singleProjectCache,
	filterCache,
	imageCache,
	enhancedCacheUtils
};
