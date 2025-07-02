import { shouldRetry, logError } from './errors';

export interface RetryOptions {
	maxAttempts?: number;
	delayMs?: number;
	backoffMultiplier?: number;
	maxDelayMs?: number;
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
	const { maxAttempts = 3, delayMs = 1000, backoffMultiplier = 2, maxDelayMs = 10000 } = options;

	let lastError: unknown;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			if (!shouldRetry(error, attempt, maxAttempts)) {
				throw error;
			}

			if (attempt < maxAttempts) {
				const delay = Math.min(delayMs * Math.pow(backoffMultiplier, attempt - 1), maxDelayMs);

				logError(error, `Attempt ${attempt}/${maxAttempts}, retrying in ${delay}ms`);

				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError;
}

/**
 * Create a retryable version of a function
 */
export function makeRetryable<T extends any[], R>(
	fn: (...args: T) => Promise<R>,
	options: RetryOptions = {}
) {
	return (...args: T): Promise<R> => {
		return withRetry(() => fn(...args), options);
	};
}
