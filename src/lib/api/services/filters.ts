import { universalApiClient as apiClient } from '../universal-client';
import { transformContexts, transformLocations, transformFormats } from '../transformers/filters';
import type {
	FilterData,
	FilterGroup,
	ContextsResponse,
	FormatsResponse,
	LocationsResponse
} from '../types/index';

class FiltersService {
	/**
	 * Fetch contexts/categories data
	 */
	async fetchContexts(): Promise<FilterGroup[]> {
		const data = await apiClient.get<ContextsResponse>('/api/filters/contexts');
		return transformContexts(data);
	}

	/**
	 * Fetch locations data
	 */
	async fetchLocations(): Promise<FilterGroup[]> {
		const data = await apiClient.get<LocationsResponse>('/api/filters/locations');
		return transformLocations(data);
	}

	/**
	 * Fetch formats data
	 */
	async fetchFormats(): Promise<FilterGroup[]> {
		const data = await apiClient.get<FormatsResponse>('/api/filters/formats');
		return transformFormats(data);
	}

	/**
	 * Fetch all filter data in parallel
	 */
	async fetchAll(): Promise<FilterData> {
		try {
			const [contextsData, locationsData, formatsData] = await Promise.all([
				this.fetchContexts(),
				this.fetchLocations(),
				this.fetchFormats()
			]);

			return {
				contexts: contextsData,
				locations: locationsData,
				formats: formatsData
			};
		} catch (error) {
			// console.error('Error fetching filter data:', error);
			// Return empty data structure on error
			return {
				contexts: [],
				locations: [],
				formats: []
			};
		}
	}

	/**
	 * Get raw contexts data (for advanced use cases)
	 */
	async getRawContexts(): Promise<ContextsResponse> {
		return apiClient.get<ContextsResponse>('/api/filters/contexts');
	}

	/**
	 * Get raw locations data (for advanced use cases)
	 */
	async getRawLocations(): Promise<LocationsResponse> {
		return apiClient.get<LocationsResponse>('/api/filters/locations');
	}

	/**
	 * Get raw formats data (for advanced use cases)
	 */
	async getRawFormats(): Promise<FormatsResponse> {
		return apiClient.get<FormatsResponse>('/api/filters/formats');
	}
}

// Export singleton instance
export const filtersService = new FiltersService();

export default filtersService;
