import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { AppStorage } from '../utils/app-storage';

const initialValue: 'DE' | 'EN' = 'EN';

// Initialize with stored value if in browser
if (browser) {
	AppStorage.getItem('rg-25-lang')
		.then((stored) => {
			const storedLang = stored as 'DE' | 'EN' | undefined;
			if (storedLang && (storedLang === 'DE' || storedLang === 'EN')) {
				activeLanguage.set(storedLang);
			}
		})
		.catch((error) => {
			// console.warn('Failed to load language from storage:', error);
		});
}

function createLanguageStore() {
	const { subscribe, set, update } = writable<'DE' | 'EN'>(initialValue);

	return {
		subscribe,
		set: (value: 'DE' | 'EN') => {
			// console.log(`Language store: Setting language to ${value}`);

			if (browser) {
				AppStorage.setItem('rg-25-lang', value)
					.then(() => {
						// console.log(`Language store: Saved to AppStorage: ${value}`);
					})
					.catch((error) => {
						// console.error('Failed to save language to storage:', error);
					});
			}

			// No need to clear cache anymore - we use multi-language caching
			// The cached data for both languages will be available instantly

			set(value);
			// console.log(`Language store: Store updated to ${value}`);
		},
		toggle: () => update((lang) => (lang === 'DE' ? 'EN' : 'DE'))
	};
}

export const activeLanguage = createLanguageStore();

/**
 * Helper function to get current language value (for non-reactive contexts)
 */
export async function getCurrentLanguage(): Promise<'DE' | 'EN'> {
	if (!browser) return 'EN';
	try {
		const stored = await AppStorage.getItem('rg-25-lang');
		return (stored as 'DE' | 'EN') || 'EN';
	} catch (error) {
		// console.warn('Failed to get current language from storage:', error);
		return 'EN';
	}
}
