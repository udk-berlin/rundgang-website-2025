<script lang="ts">
	import type { ResponsiveImageEntry } from '$lib/api/types/common';
	import {
		selectOptimalImageSize,
		generateSrcSet,
		generateSizes,
		getScreenSize,
		getPixelDensity
	} from '$lib/utils/responsive-images';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let {
		image,
		context = 'card',
		alt = '',
		loading = 'lazy',
		className = ''
	}: {
		image: ResponsiveImageEntry;
		context?: 'card' | 'detail' | 'hero';
		alt?: string;
		loading?: 'lazy' | 'eager';
		className?: string;
	} = $props();

	let screenSize: 'mobile' | 'tablet' | 'desktop' = $state('mobile');
	let pixelDensity = $state(1);
	let isHydrated = $state(false);

	// Update screen size and pixel density on mount and resize
	onMount(() => {
		if (browser) {
			updateScreenMetrics();
			isHydrated = true;

			// Add resize listener with debouncing for better performance
			let resizeTimeout: number;
			const handleResize = () => {
				clearTimeout(resizeTimeout);
				resizeTimeout = window.setTimeout(updateScreenMetrics, 100);
			};

			window.addEventListener('resize', handleResize);
			return () => {
				window.removeEventListener('resize', handleResize);
				clearTimeout(resizeTimeout);
			};
		}
	});

	function updateScreenMetrics() {
		screenSize = getScreenSize();
		pixelDensity = getPixelDensity();
	}

	// Use consistent default image for SSR and initial hydration
	let selectedImage = $derived(
		isHydrated
			? selectOptimalImageSize(image, {
					context,
					screenSize,
					pixelDensity
				})
			: image.medium // Always use medium size for SSR consistency
	);

	let srcset = $derived(generateSrcSet(image));
	let sizes = $derived(generateSizes(context));

	// Use alt from original image if not provided
	let imageAlt = $derived(alt || image.original.alt || '');
</script>

<img
	src={selectedImage.url}
	{srcset}
	{sizes}
	alt={imageAlt}
	{loading}
	width={selectedImage.width}
	height={selectedImage.height}
	style="aspect-ratio: {selectedImage.width}/{selectedImage.height}"
	class={className}
/>

<style lang="scss">
	img {
		height: 100%;
		width: 100%;
		object-fit: contain;
	}
</style>
