// Client-side API client for making requests to SvelteKit API routes
import { BaseApiClient } from './base-client';

// Re-export types from base client for compatibility
export type { ApiError, ApiResponse, RequestOptions } from './base-client';

class ApiClient extends BaseApiClient {
	protected baseUrl: string;
	protected defaultHeaders: Record<string, string>;

	constructor(fetchFn?: typeof fetch) {
		super(fetchFn);
		// Client-side should use local SvelteKit API routes
		// These routes will proxy to the external API
		this.baseUrl = ''; // Use relative URLs for SvelteKit routes
		this.defaultHeaders = {
			'Content-Type': 'application/json'
			// No authorization needed for local routes
		};
		// console.log('[NEW CLIENT] Initialized with baseUrl:', this.baseUrl);
	}
}

// Export singleton instance
// Default client for browser/client-side use
export const apiClient = new ApiClient();

// Factory function for creating API clients with custom fetch (e.g., event.fetch)
export const createApiClient = (fetchFn?: typeof fetch) => new ApiClient(fetchFn);

export default apiClient;
