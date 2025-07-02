import type {
	KirbySrcsetImageEntry,
	ResponsiveImageEntry,
	ImageVariant
} from '$lib/api/types/common';

/**
 * Parse Kirby's srcset string into individual image variants
 * Example input: "image-300.jpg 300w, image-600.jpg 600w, image-1200.jpg 1200w"
 */
export function parseSrcset(srcset: string): Array<{ url: string; width: number }> {
	if (!srcset || typeof srcset !== 'string') {
		return [];
	}

	return srcset
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean)
		.map((item) => {
			const parts = item.split(' ');
			if (parts.length >= 2) {
				const url = parts[0];
				const widthStr = parts[1];
				const width = parseInt(widthStr.replace('w', ''), 10);

				if (!isNaN(width)) {
					return { url, width };
				}
			}
			return null;
		})
		.filter((item): item is { url: string; width: number } => item !== null);
}

/**
 * Convert Kirby srcset image format to our ResponsiveImageEntry format
 */
export function convertSrcsetToResponsiveImage(
	kirbySrcsetImage: KirbySrcsetImageEntry
): ResponsiveImageEntry {
	const parsedSrcset = parseSrcset(kirbySrcsetImage.srcset);

	// Helper function to find image by width or return fallback
	const findImageByWidth = (targetWidth: number): ImageVariant => {
		const found = parsedSrcset.find((img) => img.width === targetWidth);
		if (found) {
			// Calculate height maintaining aspect ratio
			const aspectRatio =
				kirbySrcsetImage.originalHeight && kirbySrcsetImage.originalWidth
					? kirbySrcsetImage.originalHeight / kirbySrcsetImage.originalWidth
					: 0.75; // Default 4:3 aspect ratio

			return {
				url: found.url,
				width: found.width,
				height: Math.round(found.width * aspectRatio)
			};
		}

		// Fallback to original image
		return {
			url: kirbySrcsetImage.originalUrl,
			width: kirbySrcsetImage.originalWidth || 800,
			height: kirbySrcsetImage.originalHeight || 600
		};
	};

	// Map to our standard responsive image format
	const responsiveImage: ResponsiveImageEntry = {
		thumb: findImageByWidth(300),
		small: findImageByWidth(600),
		medium: findImageByWidth(1200),
		large: findImageByWidth(1800),
		xlarge: findImageByWidth(2400),
		original: {
			url: kirbySrcsetImage.originalUrl,
			width: kirbySrcsetImage.originalWidth || 800,
			height: kirbySrcsetImage.originalHeight || 600,
			alt: kirbySrcsetImage.alt,
			uuid: kirbySrcsetImage.uuid
		}
	};

	return responsiveImage;
}

/**
 * Check if an image is in Kirby srcset format
 */
export function isKirbySrcsetImage(image: unknown): image is KirbySrcsetImageEntry {
	return (
		typeof image === 'object' &&
		image !== null &&
		'srcset' in image &&
		'originalUrl' in image &&
		typeof (image as Record<string, unknown>).srcset === 'string'
	);
}

/**
 * Generate srcset string from ResponsiveImageEntry (for backwards compatibility)
 */
export function generateSrcsetFromResponsiveImage(responsiveImage: ResponsiveImageEntry): string {
	return [
		`${responsiveImage.thumb.url} ${responsiveImage.thumb.width}w`,
		`${responsiveImage.small.url} ${responsiveImage.small.width}w`,
		`${responsiveImage.medium.url} ${responsiveImage.medium.width}w`,
		`${responsiveImage.large.url} ${responsiveImage.large.width}w`,
		`${responsiveImage.xlarge.url} ${responsiveImage.xlarge.width}w`
	].join(', ');
}

/**
 * Get best image URL from srcset based on target width
 */
export function getBestImageFromSrcset(srcset: string, targetWidth: number): string | null {
	const parsed = parseSrcset(srcset);
	if (parsed.length === 0) return null;

	// Find the smallest image that's >= target width
	const suitable = parsed
		.filter((img) => img.width >= targetWidth)
		.sort((a, b) => a.width - b.width);

	if (suitable.length > 0) {
		return suitable[0].url;
	}

	// If no image is large enough, return the largest available
	const largest = parsed.sort((a, b) => b.width - a.width)[0];
	return largest ? largest.url : null;
}

/**
 * Parse and validate Kirby's srcset format for debugging
 */
export function debugSrcset(srcset: string): {
	isValid: boolean;
	parsed: Array<{ url: string; width: number }>;
	errors: string[];
} {
	const errors: string[] = [];

	if (!srcset || typeof srcset !== 'string') {
		errors.push('Srcset is empty or not a string');
		return { isValid: false, parsed: [], errors };
	}

	const parsed = parseSrcset(srcset);

	if (parsed.length === 0) {
		errors.push('No valid images found in srcset');
	}

	// Check for duplicates
	const widths = parsed.map((img) => img.width);
	const duplicateWidths = widths.filter((width, index) => widths.indexOf(width) !== index);
	if (duplicateWidths.length > 0) {
		errors.push(`Duplicate widths found: ${duplicateWidths.join(', ')}`);
	}

	// Check for proper ordering
	const sortedWidths = [...widths].sort((a, b) => a - b);
	if (JSON.stringify(widths) !== JSON.stringify(sortedWidths)) {
		errors.push('Images are not ordered by width');
	}

	return {
		isValid: errors.length === 0,
		parsed,
		errors
	};
}
