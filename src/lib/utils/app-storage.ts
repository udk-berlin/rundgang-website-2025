import { get, set, del } from 'idb-keyval';
import { browser } from '$app/environment';

export class AppStorage {
	static async getItem(key: string): Promise<string | undefined> {
		// Return undefined immediately if not in browser
		if (!browser) {
			return undefined;
		}

		try {
			const value = await get<string>(key);
			return value ?? undefined;
		} catch (error) {
			// console.warn('Failed to get item from IndexedDB:', error);
			return undefined;
		}
	}

	static async setItem(key: string, value: string): Promise<void> {
		// Do nothing if not in browser
		if (!browser) {
			return;
		}

		try {
			await set(key, value);
		} catch (error) {
			// console.warn('Failed to set item in IndexedDB:', error);
			throw error;
		}
	}

	static async removeItem(key: string): Promise<void> {
		// Do nothing if not in browser
		if (!browser) {
			return;
		}

		try {
			await del(key);
		} catch (error) {
			// console.warn('Failed to remove item from IndexedDB:', error);
			throw error;
		}
	}

	static storageAvailable(type: 'localStorage' | 'sessionStorage' = 'localStorage'): boolean {
		if (!browser) return false;

		let storage;
		try {
			storage = window[type];
			const x = '__storage_test__';
			storage.setItem(x, x);
			storage.removeItem(x);
			return true;
		} catch (e) {
			return (
				(e instanceof DOMException &&
					// everything except Firefox
					(e.code === 22 ||
						// Firefox
						e.code === 1014 ||
						// test name field too, because code might not be present
						// everything except Firefox
						e.name === 'QuotaExceededError' ||
						// Firefox
						e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
					// acknowledge QuotaExceededError only if there's something already stored
					storage &&
					storage.length !== 0) ||
				false
			);
		}
	}

	/**
	 * Get information about the current storage driver being used
	 */
	static async getStorageInfo(): Promise<{ driver: string; ready: boolean }> {
		if (!browser) {
			return {
				driver: 'none',
				ready: false
			};
		}

		try {
			// Try to perform a simple operation to check if IndexedDB is available
			await get('__test__');
			return {
				driver: 'IndexedDB',
				ready: true
			};
		} catch (error) {
			// console.warn('IndexedDB not available:', error);
			return {
				driver: 'none',
				ready: false
			};
		}
	}
}
