<script lang="ts">
	import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';
	import type { Project } from '$lib/api/types/projects';
	import { ensureResponsiveImage, applyProxyToResponsiveImage } from '$lib/utils/image-helpers';
	import { getLocalizedLabel } from '$lib/utils/localization';
	import { activeLanguage } from '$lib/stores/language';

	let { project }: { project: Project } = $props();

	// Function to determine if an image is landscape or portrait
	function getImageOrientation(image: any): 'landscape' | 'portrait' {
		if (!image?.originalWidth || !image?.originalHeight) return 'landscape';
		return image.originalWidth > image.originalHeight ? 'landscape' : 'portrait';
	}

	// Function to check if an image is the same as titleImage
	function isImageInTitleImage(imageToCheck: any): boolean {
		if (!project.titleImage || project.titleImage.length === 0) return false;

		const titleImageUuid = project.titleImage[0]?.uuid;
		const titleImageUrl = project.titleImage[0]?.originalUrl;

		// Check by UUID if available
		if (titleImageUuid && imageToCheck.uuid) {
			return titleImageUuid === imageToCheck.uuid;
		}

		// Fallback to URL comparison
		if (titleImageUrl && imageToCheck.originalUrl) {
			return titleImageUrl === imageToCheck.originalUrl;
		}

		return false;
	}

	// Function to get all content items with proper image lookups
	function getAllContentItems() {
		const items: any[] = [];

		// Process content array in order
		if (project.content) {
			for (const contentItem of project.content) {
				if (contentItem.type === 'image' && contentItem.content?.image) {
					// For image content, look up the full image data from the images array
					const enhancedImages = contentItem.content.image.map((contentImageRef: any) => {
						// Handle file ID references in format "file://uuid"
						let lookupUuid = null;
						if (typeof contentImageRef === 'string' && contentImageRef.startsWith('file://')) {
							lookupUuid = contentImageRef.replace('file://', '');
						} else if (contentImageRef.uuid) {
							lookupUuid = contentImageRef.uuid;
						}

						// Find the full image data in the images array
						const fullImageData = project.images?.find((image) => {
							// Handle both formats: strip file:// prefix from image.uuid if present
							let imageUuid = image.uuid;
							if (typeof imageUuid === 'string' && imageUuid.startsWith('file://')) {
								imageUuid = imageUuid.replace('file://', '');
							}

							if (lookupUuid && imageUuid) {
								return imageUuid === lookupUuid;
							}
							if (contentImageRef.originalUrl && image.originalUrl) {
								return contentImageRef.originalUrl === image.originalUrl;
							}
							return false;
						});

						// Return the full image data if found, otherwise use the content image reference
						return fullImageData || contentImageRef;
					});

					// Skip if this image is the titleImage
					const containsTitleImage = enhancedImages.some((image) => isImageInTitleImage(image));
					if (containsTitleImage) continue;

					items.push({
						...contentItem,
						content: {
							...contentItem.content,
							image: enhancedImages
						}
					});
				} else {
					// For non-image content, add as-is
					items.push(contentItem);
				}
			}
		}

		return items;
	}
</script>

<div class="dynamic-content-blocks">
	{#each getAllContentItems() as item (item.id)}
		{#if item.type === 'heading'}
			{@const headingText = item?.content?.text}
			{#if headingText}
				<h2 class="dynamic-heading">{getLocalizedLabel(headingText, $activeLanguage)}</h2>
			{/if}
		{/if}

		{#if item.type === 'text'}
			{@const textContent = item?.content?.text}
			{#if textContent}
				<div class="dynamic-text">
					{@html getLocalizedLabel(textContent, $activeLanguage)}
				</div>
			{/if}
		{/if}

		{#if item.type === 'image' && item.content?.image}
			{#each item.content.image as image}
				{@const responsiveImage = ensureResponsiveImage(image)}
				{#if responsiveImage}
					{@const proxiedImage = applyProxyToResponsiveImage(responsiveImage)}
					{@const orientation = getImageOrientation(image)}
					<figure class="dynamic-image-figure image-{orientation}">
						<ResponsiveImage
							image={proxiedImage}
							context="detail"
							alt={item.content?.alt
								? getLocalizedLabel(item.content.alt, $activeLanguage)
								: image.alt || ''}
							loading="lazy"
							className="dynamic-image-content"
						/>
					</figure>
				{/if}
			{/each}
		{/if}
	{/each}
</div>

<style lang="scss">
	.dynamic-content-blocks {
		display: flex;
		flex-direction: column;
		gap: 2rem;

		// Allow content to flow naturally
		> * {
			break-inside: avoid;
		}

		& :global(p) {
			margin-bottom: 1rem;
		}

		:global(a) {
			text-decoration: underline;
		}

		.dynamic-heading {
			// Assuming global h1, h2, etc. styles handle font size and weight.
			margin: 0.5em 0 0.25em 0;
			line-height: 1.3;
		}

		.dynamic-text {
			white-space: pre-wrap;
			p {
				margin-bottom: 1em;
				&:last-child {
					margin-bottom: 0;
				}
			}
		}

		.dynamic-image-figure {
			margin: 0;
			width: 100%;
			max-width: 100%;

			:global(img.dynamic-image-content) {
				width: 100%;
				max-width: 100%;
				height: auto;
				display: block;
				background-color: #f0f0f0;
				object-fit: contain;
				will-change: transform;
				transition: transform 0.2s ease-in-out;
			}
		}

		// Mobile: all content takes full width
		@include mobile-only {
			gap: 1rem;

			.dynamic-text,
			.dynamic-heading,
			.dynamic-image-figure {
				width: 100% !important;
				max-width: 100% !important;
			}

			.dynamic-image-figure {
				margin-bottom: 1rem;

				:global(img.dynamic-image-content) {
					border-radius: 2px;
				}

				// Disable hover effects on mobile for better performance
				&:hover :global(img.dynamic-image-content) {
					transform: none;
				}
			}
		}

		@include tablet-only {
			gap: 1.25rem;

			.dynamic-image-figure {
				margin-bottom: 1.25rem;
			}
		}

		@include desktop {
			gap: 1.5rem;

			// Text blocks take 2/3 width
			.dynamic-text,
			.dynamic-heading {
				width: 66.666%;
				max-width: 66.666%;
			}

			// Portrait images take 2/3 width
			.dynamic-image-figure.image-portrait {
				width: 66.666%;
				max-width: 66.666%;
			}

			// Landscape images take full width
			.dynamic-image-figure.image-landscape {
				width: 100%;
				max-width: 100%;
			}

			.dynamic-image-figure {
				margin-bottom: 1.5rem;
			}
		}
	}
</style>
