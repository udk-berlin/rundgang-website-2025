import type { ResponsiveImageEntry, ImageVariant } from '$lib/api/types/common';

export interface ImageSizeOptions {
	context: 'card' | 'detail' | 'hero';
	screenSize: 'mobile' | 'tablet' | 'desktop';
	pixelDensity?: number;
	maxWidth?: number;
}

export function selectOptimalImageSize(
	image: ResponsiveImageEntry,
	options: ImageSizeOptions
): ImageVariant {
	const density = options.pixelDensity || 1;
	const baseWidth = getBaseWidth(options.context, options.screenSize);
	const targetWidth = baseWidth * density;

	// Select closest size without going under target
	if (targetWidth <= 300) return image.thumb;
	if (targetWidth <= 600) return image.small;
	if (targetWidth <= 1200) return image.medium;
	if (targetWidth <= 1800) return image.large;
	if (targetWidth <= 2400) return image.xlarge;
	return image.original;
}

function getBaseWidth(
	context: 'card' | 'detail' | 'hero',
	screenSize: 'mobile' | 'tablet' | 'desktop'
): number {
	const sizes = {
		card: { mobile: 375, tablet: 360, desktop: 300 },
		detail: { mobile: 375, tablet: 768, desktop: 1200 },
		hero: { mobile: 375, tablet: 768, desktop: 1920 }
	};
	return sizes[context]?.[screenSize] || 400;
}

export function generateSrcSet(image: ResponsiveImageEntry): string {
	return [
		`${image.thumb.url} 300w`,
		`${image.small.url} 600w`,
		`${image.medium.url} 1200w`,
		`${image.large.url} 1800w`,
		`${image.xlarge.url} 2400w`
	].join(', ');
}

export function generateSizes(context: 'card' | 'detail' | 'hero'): string {
	const sizeMap = {
		card: '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw',
		detail: '(max-width: 767px) 100vw, (max-width: 1023px) 80vw, 60vw',
		hero: '100vw'
	};
	return sizeMap[context];
}

export function getScreenSize(): 'mobile' | 'tablet' | 'desktop' {
	if (typeof window === 'undefined') return 'mobile';

	const width = window.innerWidth;
	if (width >= 1024) return 'desktop';
	if (width >= 768) return 'tablet';
	return 'mobile';
}

export function getPixelDensity(): number {
	if (typeof window === 'undefined') return 1;
	return window.devicePixelRatio || 1;
}
