import { SERVER_API_CONFIG, SERVER_AUTH_CONFIG } from './config.server';

// Interfaces for enriched data
export interface EnrichedLocationData {
	id: string;
	name: string;
	street: string;
	postcode: string;
	city: string;
	latitude: string;
	longitude: string;
}

export interface EnrichedFormatData {
	key: string;
	en: string;
	de: string;
}

export interface EnrichedContextData {
	id: string;
	name: string;
	type: string;
	de?: string;
	en?: string;
	// Hierarchy support for contexts
	institution?: EnrichedContextData;
	faculties?: EnrichedContextData[];
	institutes?: EnrichedContextData[];
	courses?: EnrichedContextData[];
	classes?: EnrichedContextData[];
}

// Interface for raw context data from API
interface RawContextData {
	id: string;
	name: string;
	type: string;
	faculties?: RawContextData[];
	institutes?: RawContextData[];
	courses?: RawContextData[];
	classes?: RawContextData[];
}

interface ExternalDataCache {
	locations: EnrichedLocationData[];
	formats: EnrichedFormatData[];
	contexts: Map<string, EnrichedContextData>;
	lastUpdated: number;
}

class ExternalDataCacheService {
	private cache: ExternalDataCache | null = null;
	private refreshInterval: ReturnType<typeof setInterval> | null = null;
	private readonly REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

	/**
	 * Initialize the cache service and start the refresh interval
	 */
	async initialize(): Promise<void> {
		console.log('Initializing external data cache service...');

		// Load initial data
		await this.refreshCache();

		// Set up hourly refresh
		this.refreshInterval = setInterval(() => {
			this.refreshCache().catch((error) => {
				// console.error('Failed to refresh external data cache:', error);
			});
		}, this.REFRESH_INTERVAL);

		console.log('External data cache service initialized with hourly refresh');
	}

	/**
	 * Refresh the cache by fetching fresh data from external APIs
	 */
	async refreshCache(): Promise<void> {
		console.log('Refreshing external data cache...');

		try {
			// Fetch all three APIs in parallel
			const [locationsData, formatsData, contextsData] = await Promise.all([
				this.fetchLocations(),
				this.fetchFormats(),
				this.fetchContexts()
			]);

			// Transform contexts data to Map for efficient lookup
			const contextsMap = this.transformContextsToMap(contextsData);

			// Update cache
			this.cache = {
				locations: locationsData,
				formats: formatsData,
				contexts: contextsMap,
				lastUpdated: Date.now()
			};

			console.log(`External data cache refreshed successfully:`, {
				locations: locationsData.length,
				formats: formatsData.length,
				contexts: contextsMap.size,
				lastUpdated: new Date(this.cache.lastUpdated).toISOString()
			});
		} catch (error) {
			// console.error('Failed to refresh external data cache:', error);
			throw error;
		}
	}

	/**
	 * Get cached data
	 */
	getCachedData(): ExternalDataCache | null {
		return this.cache;
	}

	/**
	 * Get locations from cache
	 */
	getLocations(): EnrichedLocationData[] {
		return this.cache?.locations || [];
	}

	/**
	 * Get formats from cache
	 */
	getFormats(): EnrichedFormatData[] {
		return this.cache?.formats || [];
	}

	/**
	 * Get contexts from cache
	 */
	getContexts(): Map<string, EnrichedContextData> {
		return this.cache?.contexts || new Map();
	}

	/**
	 * Get a specific context by ID
	 */
	getContext(id: string): EnrichedContextData | undefined {
		return this.cache?.contexts.get(id);
	}

	/**
	 * Check if cache is initialized and fresh
	 */
	isReady(): boolean {
		return this.cache !== null;
	}

	/**
	 * Get cache age in milliseconds
	 */
	getCacheAge(): number | null {
		if (!this.cache) return null;
		return Date.now() - this.cache.lastUpdated;
	}

	/**
	 * Force a cache refresh
	 */
	async forceRefresh(): Promise<void> {
		await this.refreshCache();
	}

	/**
	 * Cleanup and stop refresh interval
	 */
	destroy(): void {
		if (this.refreshInterval) {
			clearInterval(this.refreshInterval);
			this.refreshInterval = null;
		}
		this.cache = null;
		console.log('External data cache service destroyed');
	}

	/**
	 * Fetch locations from external API
	 */
	private async fetchLocations(): Promise<EnrichedLocationData[]> {
		const response = await fetch(`${SERVER_API_CONFIG.BASE_URL}/2025/locations`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	}

	/**
	 * Fetch formats from external API
	 */
	private async fetchFormats(): Promise<EnrichedFormatData[]> {
		const response = await fetch(`${SERVER_API_CONFIG.BASE_URL}/2025/formats`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch formats: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	}

	/**
	 * Fetch contexts from external API
	 */
	private async fetchContexts(): Promise<RawContextData> {
		const response = await fetch(`${SERVER_API_CONFIG.BASE_URL}/2025/contexts`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch contexts: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	}

	/**
	 * Transform raw contexts data to Map with translations and hierarchy
	 */
	private transformContextsToMap(
		rawContextsData: RawContextData
	): Map<string, EnrichedContextData> {
		const contextsMap = new Map<string, EnrichedContextData>();

		// Function to enhance context item with translations and parent references
		const enhanceContextItem = (
			item: RawContextData,
			parentChain: EnrichedContextData[] = []
		): EnrichedContextData => {
			const enhanced: EnrichedContextData = {
				id: item.id,
				name: item.name,
				type: item.type,
				de: item.name, // Original German name
				en: item.name // English translation or fallback
			};

			// Add parent hierarchy references based on parent chain
			// Each item gets references to all its direct ancestors in the hierarchy

			const institution = parentChain.find((p) => p.type === 'institution');
			if (institution) {
				enhanced.institution = {
					id: institution.id,
					name: institution.name,
					type: institution.type,
					de: institution.de,
					en: institution.en
				};
			}

			const faculty = parentChain.find((p) => p.type === 'faculty');
			if (faculty) {
				enhanced.faculties = [
					{
						id: faculty.id,
						name: faculty.name,
						type: faculty.type,
						de: faculty.de,
						en: faculty.en
					}
				];
			}

			const institute = parentChain.find((p) => p.type === 'institute');
			if (institute) {
				enhanced.institutes = [
					{
						id: institute.id,
						name: institute.name,
						type: institute.type,
						de: institute.de,
						en: institute.en
					}
				];
			}

			const course = parentChain.find((p) => p.type === 'course');
			if (course) {
				enhanced.courses = [
					{
						id: course.id,
						name: course.name,
						type: course.type,
						de: course.de,
						en: course.en
					}
				];
			}

			const classItem = parentChain.find((p) => p.type === 'class');
			if (classItem) {
				enhanced.classes = [
					{
						id: classItem.id,
						name: classItem.name,
						type: classItem.type,
						de: classItem.de,
						en: classItem.en
					}
				];
			}

			return enhanced;
		};

		// Recursively process contexts with parent chain tracking
		const processContexts = (
			item: RawContextData,
			parentChain: EnrichedContextData[] = []
		): void => {
			if (!item || !item.id) return;

			const enhanced = enhanceContextItem(item, parentChain);
			contextsMap.set(item.id, enhanced);

			// Create new parent chain including current item for children
			const newParentChain = [...parentChain, enhanced];

			// Recursively process children
			if (item.faculties && Array.isArray(item.faculties)) {
				item.faculties.forEach((faculty: RawContextData) =>
					processContexts(faculty, newParentChain)
				);
			}
			if (item.institutes && Array.isArray(item.institutes)) {
				item.institutes.forEach((institute: RawContextData) =>
					processContexts(institute, newParentChain)
				);
			}
			if (item.courses && Array.isArray(item.courses)) {
				item.courses.forEach((course: RawContextData) => processContexts(course, newParentChain));
			}
			if (item.classes && Array.isArray(item.classes)) {
				item.classes.forEach((classItem: RawContextData) =>
					processContexts(classItem, newParentChain)
				);
			}
		};

		// Process the contexts data with parent chain tracking
		if (rawContextsData) {
			processContexts(rawContextsData);
		}

		return contextsMap;
	}
}

// Create singleton instance
export const externalDataCache = new ExternalDataCacheService();

// Export the service class for testing
export { ExternalDataCacheService };
