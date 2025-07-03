<script lang="ts">
	import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';
	import type { Project } from '$lib/api/types/projects';
	import { ensureResponsiveImage, applyProxyToResponsiveImage } from '$lib/utils/image-helpers';
	import { getLocalizedLabel } from '$lib/utils/localization';
	import { activeLanguage } from '$lib/stores/language';

	let { project }: { project: Project } = $props();

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
					const enhancedImages = contentItem.content.image.map((contentImage: any) => {
						// Find the full image data in the images array
						const fullImageData = project.images?.find((image) => {
							if (contentImage.uuid && image.uuid) {
								return contentImage.uuid === image.uuid;
							}
							return contentImage.originalUrl === image.originalUrl;
						});

						// Return the full image data if found, otherwise use the content image
						return fullImageData || contentImage;
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

		// Add remaining images that are not in content and not titleImage
		if (project.images) {
			const remainingImages = project.images.filter((image) => {
				// Skip if it's the titleImage
				if (isImageInTitleImage(image)) return false;

				// Skip if it's already in content blocks
				const isInContent = project.content?.some((contentItem) => {
					if (contentItem.type === 'image' && contentItem.content?.image) {
						return contentItem.content.image.some((contentImage: any) => {
							if (contentImage.uuid && image.uuid) {
								return contentImage.uuid === image.uuid;
							}
							return contentImage.originalUrl === image.originalUrl;
						});
					}
					return false;
				});

				return !isInContent;
			});

			// Convert remaining images to content block format
			remainingImages.forEach((image) => {
				items.push({
					id: image.uuid || `image-${image.originalUrl}`,
					type: 'image',
					isHidden: false,
					content: {
						image: [image],
						alt: image.alt ? { de: image.alt, en: image.alt } : undefined
					}
				});
			});
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
					<figure class="dynamic-image-figure">
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
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;

		// Allow content to flow naturally in columns
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
			line-height: 1.6;
			white-space: pre-wrap; // To respect newlines in plain text from CMS
			p {
				// If text contains <p> tags from {@html}
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

		// Responsive optimizations
		@include mobile-only {
			grid-template-columns: 1fr;
			gap: 1rem;

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

			.dynamic-image-figure {
				margin-bottom: 1.5rem;
			}
		}
	}
</style>
