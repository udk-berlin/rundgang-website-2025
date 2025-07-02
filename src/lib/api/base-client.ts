// Base API client with shared functionality for browser and server contexts

export interface ApiErrorOptions {
	message: string;
	status: number;
	endpoint: string;
	code?: string;
}

export class ApiError extends Error {
	public status: number;
	public endpoint: string;
	public code?: string;

	constructor(options: ApiErrorOptions) {
		super(options.message);
		this.name = 'ApiError';
		this.status = options.status;
		this.endpoint = options.endpoint;
		this.code = options.code;
	}
}

export interface ApiResponse<T> {
	data: T;
	status: number;
	headers: Headers;
}

export interface RequestOptions {
	method?: string;
	headers?: Record<string, string>;
	body?: string | Record<string, unknown> | FormData;
	timeout?: number;
}

export abstract class BaseApiClient {
	protected abstract baseUrl: string;
	protected abstract defaultHeaders: Record<string, string>;
	protected fetchFn: typeof fetch;

	constructor(fetchFn?: typeof fetch) {
		this.fetchFn = fetchFn || fetch;
	}

	/**
	 * Generic request method with consistent error handling
	 */
	async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
		const { method = 'GET', headers = {}, body, timeout = 30000 } = options;

		const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

		const requestHeaders = {
			...this.defaultHeaders,
			...headers
		};

		const requestInit: RequestInit = {
			method,
			headers: requestHeaders,
			signal: AbortSignal.timeout(timeout)
		};

		if (body && method !== 'GET') {
			if (typeof body === 'string') {
				requestInit.body = body;
			} else if (body instanceof FormData) {
				requestInit.body = body;
				// Remove Content-Type for FormData to allow browser to set boundary
				delete (requestHeaders as Record<string, string>)['Content-Type'];
			} else {
				requestInit.body = JSON.stringify(body);
			}
		}

		try {
			const response = await this.fetchFn(url, requestInit);

			if (!response.ok) {
				const errorText = await response.text().catch(() => 'Unknown error');
				throw new ApiError({
					message: `HTTP ${response.status}: ${errorText}`,
					status: response.status,
					endpoint: url
				});
			}

			const data = (await response.json()) as T;

			return {
				data,
				status: response.status,
				headers: response.headers
			};
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}

			if (error instanceof DOMException && error.name === 'TimeoutError') {
				throw new ApiError({
					message: `Request timeout after ${timeout}ms`,
					status: 408,
					endpoint: url
				});
			}

			if (error instanceof TypeError && error.message.includes('fetch')) {
				throw new ApiError({
					message: 'Network error - unable to reach server',
					status: 0,
					endpoint: url
				});
			}

			throw new ApiError({
				message: error instanceof Error ? error.message : 'Unknown error occurred',
				status: 500,
				endpoint: url
			});
		}
	}

	/**
	 * GET request wrapper
	 */
	async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
		const response = await this.request<T>(endpoint, { method: 'GET', headers });
		return response.data;
	}

	/**
	 * POST request wrapper
	 */
	async post<T>(
		endpoint: string,
		body?: string | Record<string, unknown> | FormData,
		headers?: Record<string, string>
	): Promise<T> {
		const response = await this.request<T>(endpoint, { method: 'POST', body, headers });
		return response.data;
	}

	/**
	 * PUT request wrapper
	 */
	async put<T>(
		endpoint: string,
		body?: string | Record<string, unknown> | FormData,
		headers?: Record<string, string>
	): Promise<T> {
		const response = await this.request<T>(endpoint, { method: 'PUT', body, headers });
		return response.data;
	}

	/**
	 * DELETE request wrapper
	 */
	async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
		const response = await this.request<T>(endpoint, { method: 'DELETE', headers });
		return response.data;
	}

	/**
	 * KQL query helper for Kirby CMS
	 */
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
}
