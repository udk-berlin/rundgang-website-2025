import { ApiError } from '../base-client';

// Error type guards
export function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

export function isNetworkError(error: unknown): boolean {
	if (!isApiError(error)) return false;
	return error.status === 0 || error.message.includes('Network error');
}

export function isTimeoutError(error: unknown): boolean {
	if (!isApiError(error)) return false;
	return error.status === 408 || error.message.includes('timeout');
}

export function isServerError(error: unknown): boolean {
	if (!isApiError(error)) return false;
	return error.status >= 500;
}

export function isClientError(error: unknown): boolean {
	if (!isApiError(error)) return false;
	return error.status >= 400 && error.status < 500;
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
	if (isApiError(error)) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return 'An unknown error occurred';
}

export function getErrorCode(error: unknown): string | undefined {
	if (isApiError(error)) {
		return error.code;
	}

	return undefined;
}

export function shouldRetry(error: unknown, attempt: number, maxAttempts: number = 3): boolean {
	if (attempt >= maxAttempts) return false;

	// Retry on network errors and server errors (5xx)
	return isNetworkError(error) || isServerError(error);
}

// Error logging utility
export function logError(error: unknown, context?: string): void {
	const message = getErrorMessage(error);
	const code = getErrorCode(error);

	// console.error(`[API Error]${context ? ` [${context}]` : ''}: ${message}`, { error, code });
}

// Create user-friendly error messages
export function getUserFriendlyMessage(error: unknown): string {
	if (isNetworkError(error)) {
		return 'Unable to connect to the server. Please check your internet connection.';
	}

	if (isTimeoutError(error)) {
		return 'The request took too long. Please try again.';
	}

	if (isServerError(error)) {
		return 'Server error occurred. Please try again later.';
	}

	if (isClientError(error)) {
		return 'Invalid request. Please check your input.';
	}

	return 'An unexpected error occurred. Please try again.';
}
