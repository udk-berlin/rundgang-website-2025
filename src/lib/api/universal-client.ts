// Universal client that always uses SvelteKit API routes
// This way both client and server use the same endpoints

import { apiClient, createApiClient } from './client';

// Universal interface
export interface UniversalClient {
	get<T>(endpoint: string, headers?: Record<string, string>): Promise<T>;
	post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T>;
	put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T>;
	delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T>;
	kql<T>(
		query: string,
		select?: Record<string, unknown>,
		pagination?: { limit?: number; offset?: number; page?: number }
	): Promise<T>;
}

// Create universal client that always uses local SvelteKit routes
export const universalApiClient: UniversalClient = {
	async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
		return apiClient.get<T>(endpoint, headers);
	},

	async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
		return apiClient.post<T>(endpoint, body, headers);
	},

	async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
		return apiClient.put<T>(endpoint, body, headers);
	},

	async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
		return apiClient.delete<T>(endpoint, headers);
	},

	async kql<T>(
		query: string,
		select?: Record<string, unknown>,
		pagination?: { limit?: number; offset?: number; page?: number }
	): Promise<T> {
		const body = {
			query,
			...(select && { select }),
			...(pagination && { pagination })
		};

		return this.post<T>('/query', body);
	}
};

// Factory function to create a universal client with custom fetch
export const createUniversalApiClient = (fetchFn?: typeof fetch): UniversalClient => {
	const client = createApiClient(fetchFn);

	return {
		async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
			return client.get<T>(endpoint, headers);
		},

		async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
			return client.post<T>(endpoint, body, headers);
		},

		async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
			return client.put<T>(endpoint, body, headers);
		},

		async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
			return client.delete<T>(endpoint, headers);
		},

		async kql<T>(
			query: string,
			select?: Record<string, unknown>,
			pagination?: { limit?: number; offset?: number; page?: number }
		): Promise<T> {
			const body = {
				query,
				...(select && { select }),
				...(pagination && { pagination })
			};

			return client.post<T>('/query', body);
		}
	};
};

export default universalApiClient;
