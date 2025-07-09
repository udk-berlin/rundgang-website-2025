import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => ({
	plugins: [sveltekit()],
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use '$styles/variables.scss' as *;`,
				silenceDeprecations: ['legacy-js-api']
			}
		}
	},
	resolve: {
		alias: {
			$styles: fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	server: {
		// Set up proxy for development when VITE_USE_PROXY is true
		// You can disable by setting VITE_NO_PROXY=true or when running on localhost
		proxy:
			mode === 'development'
				? {
						// Proxy image requests to the production server
						'/proxy-image': {
							target: 'https://rundgang-website-2025.medienhaus.udk-berlin.de',
							changeOrigin: true,
							secure: true,
							rewrite: (path) => path.replace(/^\/proxy-image/, ''),
							headers: {
								'User-Agent': 'RG25-Dev-Proxy'
							}
						}
					}
				: undefined
	}
}));
