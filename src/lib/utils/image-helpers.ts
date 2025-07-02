import type { ResponsiveImageEntry } from '$lib/api/types/common';
import { isKirbySrcsetImage, convertSrcsetToResponsiveImage } from './srcset-parser';
import { env } from '$env/dynamic/public';
import { getImageUrl } from '$lib/config/image-proxy';

const IMAGE_PROXY = env.PUBLIC_ENABLE_IMAGE_PROXY;

// Total number of placeholder images available
const TOTAL_PLACEHOLDER_IMAGES = 9;

/**
 * Check if an image object is a ResponsiveImageEntry
 */
export function isResponsiveImage(image: unknown): image is ResponsiveImageEntry {
	return Boolean(
		image &&
			typeof image === 'object' &&
			'original' in image &&
			'thumb' in image &&
			'small' in image &&
			'medium' in image &&
			'large' in image &&
			'xlarge' in image
	);
}

/**
 * Convert Kirby srcset image format to ResponsiveImageEntry
 * Only supports KirbySrcsetImageEntry format
 */
export function ensureResponsiveImage(image: unknown): ResponsiveImageEntry | null {
	if (!image) return null;

	// Already in ResponsiveImageEntry format
	if (isResponsiveImage(image)) {
		return image;
	}

	// Kirby srcset format (primary format)
	if (isKirbySrcsetImage(image)) {
		return convertSrcsetToResponsiveImage(image);
	}

	// Unsupported format
	console.warn('Unsupported image format. Only Kirby srcset format is supported.', image);
	return null;
}

/**
 * Apply proxy URL transformation to all variants of a responsive image
 * Uses global image proxy configuration
 */
export function applyProxyToResponsiveImage(image: ResponsiveImageEntry): ResponsiveImageEntry {
	if (!IMAGE_PROXY) return image;
	return {
		thumb: { ...image.thumb, url: getImageUrl(image.thumb.url) },
		small: { ...image.small, url: getImageUrl(image.small.url) },
		medium: { ...image.medium, url: getImageUrl(image.medium.url) },
		large: { ...image.large, url: getImageUrl(image.large.url) },
		xlarge: { ...image.xlarge, url: getImageUrl(image.xlarge.url) },
		original: {
			...image.original,
			url: getImageUrl(image.original.url)
		}

		// without proxy
		// thumb: { ...image.thumb, url: image.thumb.url },
		// small: { ...image.small, url: image.small.url },
		// medium: { ...image.medium, url: image.medium.url },
		// large: { ...image.large, url: image.large.url },
		// xlarge: { ...image.xlarge, url: image.xlarge.url },
		// original: { ...image.original, url: image.original.url }
	};
}

/**
 * Returns a random placeholder image path
 * @returns string Path to a random placeholder image
 */
export function getRandomPlaceholderImage(): string {
	const randomIndex = Math.floor(Math.random() * TOTAL_PLACEHOLDER_IMAGES) + 1;
	return `/icons/placeholder/placeholder-${randomIndex}.png`;
}
