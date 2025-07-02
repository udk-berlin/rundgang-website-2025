import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	// This runs on both server and client
	// You can use this for initial data that should be available everywhere
	return {
		// Add any global data here if needed
	};
};

export const prerender = false; // Disable prerendering for dynamic content
