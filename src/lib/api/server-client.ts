import { SERVER_API_CONFIG, SERVER_AUTH_CONFIG } from '../config.server';
import { BaseApiClient } from './base-client';

// Re-export types from base client with server naming for compatibility
export type {
	ApiError as ServerApiError,
	ApiResponse as ServerApiResponse,
	RequestOptions as ServerRequestOptions
} from './base-client';

class ServerApiClient extends BaseApiClient {
	protected baseUrl: string;
	protected defaultHeaders: Record<string, string>;

	constructor() {
		super();
		this.baseUrl = SERVER_API_CONFIG.BASE_URL;
		this.defaultHeaders = {
			'Content-Type': 'application/json',
			Authorization: SERVER_AUTH_CONFIG.BASIC_AUTH
		};
	}

	// Override request method to add server-specific logging
	async request<T>(endpoint: string, options: any = {}): Promise<any> {
		const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
		console.log(`[SERVER CLIENT] Server API Request: ${options.method || 'GET'} ${url}`);

		return super.request<T>(endpoint, options);
	}
}

// Export singleton instance for server-side use
export const serverApiClient = new ServerApiClient();

export default serverApiClient;
