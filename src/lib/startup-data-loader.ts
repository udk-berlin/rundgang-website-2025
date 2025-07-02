import { SERVER_API_CONFIG, SERVER_AUTH_CONFIG } from './config.server';
import { CACHE_CONFIG } from './config';
import { externalDataCache } from './external-data-cache';
import { filterCache, enhancedCacheUtils } from './cache-enhanced';
import { PROJECT_QUERIES, PROJECT_SELECTS } from './api/queries/kirby';
import type { KirbyAPIResponse } from '../routes/api/projects/+server';

/**
 * Comprehensive startup data loader that loads and caches all necessary data
 * when the server starts up
 */
class StartupDataLoader {
	private isLoaded = false;
	private loadingPromise: Promise<void> | null = null;

	/**
	 * Load all necessary data on server startup
	 */
	async loadAllData(): Promise<void> {
		if (this.isLoaded || this.loadingPromise) {
			return this.loadingPromise || Promise.resolve();
		}

		console.log('🚀 Starting data loading...');
		const startTime = performance.now();

		this.loadingPromise = this.performDataLoading();

		try {
			await this.loadingPromise;
			this.isLoaded = true;
			const duration = performance.now() - startTime;
			console.log(`✅ All startup data loaded successfully in ${duration.toFixed(2)}ms`);
		} catch (error) {
			// console.error('❌ Startup data loading failed:', error);
			this.loadingPromise = null;
			throw error;
		}
	}

	/**
	 * Check if all data has been loaded
	 */
	isReady(): boolean {
		return this.isLoaded;
	}

	/**
	 * Force reload all data
	 */
	async forceReload(): Promise<void> {
		this.isLoaded = false;
		this.loadingPromise = null;
		await this.loadAllData();
	}

	/**
	 * Perform the actual data loading
	 */
	private async performDataLoading(): Promise<void> {
		console.log('📊 Loading startup data in optimized order...');

		// Step 1: Load external reference data (fastest, needed by other steps)
		console.log('1️⃣ Loading external reference data...');
		await this.loadExternalData();

		// Step 2: Load filter data directly (needed for UI)
		console.log('2️⃣ Loading filter data...');
		await this.loadFilterData();

		// Step 3: Load and cache all projects (most important for performance)
		console.log('3️⃣ Loading and caching all project data...');
		await this.loadAllProjects();

		console.log('✨ All startup data loading completed!');
	}

	/**
	 * Load external reference data (locations, formats, contexts)
	 */
	private async loadExternalData(): Promise<void> {
		try {
			if (!externalDataCache.isReady()) {
				await externalDataCache.initialize();
			}
			console.log('  ✅ External data loaded');
		} catch (error) {
			// console.error('  ❌ Failed to load external data:', error);
			throw error;
		}
	}

	/**
	 * Load filter data using direct API calls (bypassing the universal client)
	 */
	private async loadFilterData(): Promise<void> {
		try {
			if (!SERVER_API_CONFIG.BASE_URL) {
				throw new Error('API_BASE_URL environment variable is required');
			}

			// Load all filter data in parallel using direct Kirby API calls
			const [contextsData, locationsData, formatsData] = await Promise.all([
				this.fetchKirbyData('/2025/contexts'),
				this.fetchKirbyData('/2025/locations'),
				this.fetchKirbyData('/2025/formats')
			]);

			// Cache the filter data with specific keys that match the API endpoints
			const filterCacheKey = enhancedCacheUtils.generateKey('/api/filters', {});
			filterCache.set(`${filterCacheKey}/contexts`, contextsData, CACHE_CONFIG.FILTER_TTL);
			filterCache.set(`${filterCacheKey}/locations`, locationsData, CACHE_CONFIG.FILTER_TTL);
			filterCache.set(`${filterCacheKey}/formats`, formatsData, CACHE_CONFIG.FILTER_TTL);

			console.log(
				`  ✅ Filter data loaded (${contextsData.length || 0} contexts, ${locationsData.length || 0} locations, ${formatsData.length || 0} formats)`
			);
		} catch (error) {
			// console.error('  ❌ Failed to load filter data:', error);
			// Don't throw here - filter data is not critical for basic functionality
		}
	}

	private async loadProjectMetadata(): Promise<void> {
		try {
			if (!SERVER_API_CONFIG.BASE_URL) {
				throw new Error('API_BASE_URL environment variable is required');
			}

			console.log('  📦 Fetching all projects with metadata...');

			const kqlBody = {
				query: PROJECT_QUERIES.ALL,
				select: PROJECT_SELECTS.METADATA,
				pagination: {
					limit: 9999, // Get all projects
					offset: 0,
					page: 1
				}
			};

			const apiUrl = `${SERVER_API_CONFIG.BASE_URL}/query`;
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
				},
				body: JSON.stringify(kqlBody)
			});

			if (!response.ok) {
				throw new Error(
					`Project metadata API request failed: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();
			// console.log('  ✅ Project metadata loaded');

			// Note: Caching is handled by loadAllProjects via cacheProjectVariations
		} catch (error) {
			// console.error('  ❌ Failed to load project metadata:', error);
			throw error;
		}
	}

	/**
	 * Load and cache all project data
	 */
	private async loadAllProjects(): Promise<void> {
		try {
			if (!SERVER_API_CONFIG.BASE_URL) {
				throw new Error('API_BASE_URL environment variable is required');
			}

			console.log('  📦 Fetching all projects with full content...');

			// Prepare the KQL request for all projects with full content
			const kqlBody = {
				query: PROJECT_QUERIES.ALL,
				select: PROJECT_SELECTS.FULL,
				pagination: {
					limit: 9999, // Get all projects
					offset: 0,
					page: 1
				}
			};

			// Fetch both languages in parallel
			const apiUrl = `${SERVER_API_CONFIG.BASE_URL}/query`;
			const [deResponse, enResponse] = await Promise.all([
				fetch(apiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Language': 'de',
						Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
					},
					body: JSON.stringify(kqlBody)
				}),
				fetch(apiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Language': 'en',
						Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
					},
					body: JSON.stringify(kqlBody)
				})
			]);

			if (!deResponse.ok || !enResponse.ok) {
				throw new Error(
					`Project API request failed: DE=${deResponse.status}, EN=${enResponse.status}`
				);
			}

			const [deData, enData]: [KirbyAPIResponse, KirbyAPIResponse] = await Promise.all([
				deResponse.json(),
				enResponse.json()
			]);

			// Cache multiple variations of the project data for different use cases
			await this.cacheProjectVariations(deData, enData);

			console.log(`  ✅ All projects loaded and cached (${deData.result.data.length} projects)`);
		} catch (error) {
			// console.error('  ❌ Failed to load project data:', error);
			throw error;
		}
	}

	/**
	 * Cache different variations of project data for various API endpoints
	 */
	private async cacheProjectVariations(
		deData: KirbyAPIResponse,
		enData: KirbyAPIResponse
	): Promise<void> {
		// Cache full projects data (limit: -1 = all projects)
		const fullProjectsKey = enhancedCacheUtils.generateKey('/projects', {
			query: PROJECT_QUERIES.ALL,
			select: JSON.stringify(PROJECT_SELECTS.FULL),
			limit: -1,
			offset: 0,
			page: 1,
			shuffle: false,
			metadataOnly: false
		});

		// Cache metadata-only version
		const metadataKey = enhancedCacheUtils.generateKey('/projects', {
			query: PROJECT_QUERIES.ALL,
			select: JSON.stringify(PROJECT_SELECTS.METADATA),
			limit: -1,
			offset: 0,
			page: 1,
			shuffle: false,
			metadataOnly: true
		});

		// Cache common pagination variations
		const paginatedKeys = [
			{ limit: 20, offset: 0, page: 1 },
			{ limit: 50, offset: 0, page: 1 },
			{ limit: 100, offset: 0, page: 1 }
		].map((pagination) => ({
			key: enhancedCacheUtils.generateKey('/projects', {
				query: PROJECT_QUERIES.ALL,
				select: JSON.stringify(PROJECT_SELECTS.METADATA),
				...pagination,
				shuffle: false,
				metadataOnly: true
			}),
			data: {
				...deData,
				result: {
					...deData.result,
					data: deData.result.data.slice(pagination.offset, pagination.offset + pagination.limit),
					pagination: {
						...deData.result.pagination,
						...pagination
					}
				}
			}
		}));

		// Set all cache entries
		const cacheOperations = [
			{ key: fullProjectsKey, data: deData },
			{ key: metadataKey, data: deData },
			...paginatedKeys.map(({ key, data }) => ({ key, data }))
		];

		// Cache with 10 minute TTL (same as main API)
		const ttl = 10 * 60 * 1000;
		cacheOperations.forEach(({ key, data }) => {
			filterCache.set(key, data, ttl);
		});

		console.log(`  📦 Cached ${cacheOperations.length} project data variations`);
	}

	/**
	 * Helper method to fetch data directly from Kirby API
	 */
	private async fetchKirbyData(endpoint: string): Promise<any> {
		// console.log('DEBUG: Fetching Kirby data from:', `${SERVER_API_CONFIG.BASE_URL}${endpoint}`);
		// console.log('DEBUG: Authorization:', SERVER_AUTH_CONFIG.BASIC_AUTH);
		const response = await fetch(`${SERVER_API_CONFIG.BASE_URL}${endpoint}`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	}

	/**
	 * Get loading statistics
	 */
	getStats() {
		return {
			isLoaded: this.isLoaded,
			isLoading: this.loadingPromise !== null && !this.isLoaded,
			externalDataReady: externalDataCache.isReady(),
			externalDataStats: {
				locations: externalDataCache.getLocations().length,
				formats: externalDataCache.getFormats().length,
				contexts: externalDataCache.getContexts().size
			},
			cacheStats: filterCache.getStats()
		};
	}
}

// Export singleton instance
export const startupDataLoader = new StartupDataLoader();

/**
 * Initialize all startup data loading
 */
export async function initializeStartupData(): Promise<void> {
	if (!CACHE_CONFIG.WARMUP.ENABLED) {
		console.log('🔥 Startup data loading disabled by configuration');
		return;
	}

	try {
		if (CACHE_CONFIG.WARMUP.STARTUP_DELAY > 0) {
			console.log(`🔥 Delaying startup data loading by ${CACHE_CONFIG.WARMUP.STARTUP_DELAY}ms`);
			await new Promise((resolve) => setTimeout(resolve, CACHE_CONFIG.WARMUP.STARTUP_DELAY));
		}

		await startupDataLoader.loadAllData();
	} catch (error) {
		// console.error('Failed to initialize startup data:', error);
		// Don't throw to avoid crashing the server
	}
}

/**
 * Check if startup data loading is complete
 */
export function isStartupDataReady(): boolean {
	return startupDataLoader.isReady();
}
