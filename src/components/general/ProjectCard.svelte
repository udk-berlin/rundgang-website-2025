<script lang="ts">
	import { base } from '$app/paths';
	import { merkelisteStore, addToMerkeliste, removeFromMerkeliste } from '$lib/stores/merkliste';
	import { activeLanguage } from '$lib/stores/language';
	import { getRandomRotation } from '$lib/utils';
	import {
		getLocalizedLabel,
		getLocalizedDayName,
		getLocalizedFormats,
		getLocalizedDayAbbreviation,
		getUIText
	} from '$lib/utils/localization';
	import {
		ensureResponsiveImage,
		applyProxyToResponsiveImage,
		getRandomPlaceholderImage
	} from '$lib/utils/image-helpers';
	import ScribbleBorder from '../scribble/ScribbleBorder.svelte';
	import ScribbleAnimation from '../scribble/ScribbleAnimation.svelte';
	import EventBadges from './event-badges/EventBadgeList.svelte';
	import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';
	import { onMount, createEventDispatcher } from 'svelte';
	import { dev } from '$app/environment';
	import type { Project } from '$lib/api/types/index';
	import type { ResponsiveImageEntry } from '$lib/api/types/common';

	const dispatch = createEventDispatcher();

	export let project: Project;

	const FORCE_PLACEHOLDER: boolean = false;

	const rotation = getRandomRotation();

	let scribbleSeed: number;
	// Get the localized title for scribble seed calculation
	$: localizedTitle = getLocalizedLabel(project.title, $activeLanguage);
	$: scribbleSeed = (localizedTitle.charCodeAt(0) % 5) + 1; // just some way to randomize the scribble border

	let imageAspectRatioStyle = 'padding-top: 75%;'; // Default aspect ratio (e.g., 4:3)
	let responsiveImage: ResponsiveImageEntry | undefined = undefined;
	let imageAlt: string | undefined = undefined;
	let placeholderImage: string | undefined = undefined;

	// Get localized format labels
	$: localizedFormats = getLocalizedFormats(project.formats, $activeLanguage);

	$: {
		responsiveImage = undefined;
		placeholderImage = undefined;
		imageAlt = getLocalizedLabel(project.title, $activeLanguage);

		// DEBUG: Force placeholder if debug flag is set
		if (typeof FORCE_PLACEHOLDER !== 'undefined' && FORCE_PLACEHOLDER) {
			placeholderImage = getRandomPlaceholderImage();
		} else {
			// Extract image from titleImage block structure and convert Kirby srcset to ResponsiveImageEntry
			if (
				project.titleImage &&
				Array.isArray(project.titleImage) &&
				project.titleImage.length > 0
			) {
				// Get the first image block
				const imageBlock = project.titleImage[0];
				if (imageBlock && imageBlock.originalUrl) {
					// Use the KirbySrcsetImageEntry directly
					const kirbySrcsetImage = imageBlock;

					const convertedImage = ensureResponsiveImage(kirbySrcsetImage);

					if (convertedImage) {
						responsiveImage = applyProxyToResponsiveImage(convertedImage);

						// Use image alt text if available, otherwise fall back to project title
						if (imageBlock.alt) {
							imageAlt = imageBlock.alt;
						}

						// Calculate aspect ratio from image dimensions if available
						if (imageBlock.originalWidth && imageBlock.originalHeight) {
							imageAspectRatioStyle = `padding-top: ${(imageBlock.originalHeight / imageBlock.originalWidth) * 100}%;`;
						}
					} else {
						// Use placeholder when no valid image
						placeholderImage = getRandomPlaceholderImage();
					}
				} else {
					// Use placeholder when no image in block
					placeholderImage = getRandomPlaceholderImage();
				}
			} else {
				// Use placeholder when no image
				placeholderImage = getRandomPlaceholderImage();
			}
		}
	}

	const schedule = project.schedule;

	$: isSaved = $merkelisteStore.savedProjects.includes(project.id);

	function handleCardClick(event: MouseEvent) {
		event.preventDefault();
		dispatch('click', project);
	}

	function handleSaveClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (isSaved) {
			removeFromMerkeliste(project.id);
		} else {
			addToMerkeliste(project.id);
		}
	}

	// Debug helper for development
	onMount(() => {
		if (dev && typeof window !== 'undefined') {
			// Add debug helper to window for easy testing
			(window as any).debugProjectCard = (projectId: string) => {
				if (project.id === projectId) {
					console.group(`🎯 ProjectCard Debug: ${project.id}`);
					console.log('Project data:', project);
					console.log('Responsive image:', responsiveImage);
					console.log('Title image data:', project.titleImage);
					console.log('Image alt:', imageAlt);
					console.log('Aspect ratio style:', imageAspectRatioStyle);
					console.groupEnd();
				}
			};
		}
	});
</script>

<a
	href="/"
	class="card scribble-container"
	style="--rotation: {rotation}deg"
	on:click={handleCardClick}
>
	<!-- <ScribbleBorder seed={scribbleSeed} scale={0.7} /> -->
	<div class="image-container" style={imageAspectRatioStyle}>
		{#if responsiveImage}
			<ResponsiveImage
				image={responsiveImage}
				context="card"
				alt={imageAlt || getLocalizedLabel(project.title, $activeLanguage)}
				loading="lazy"
				className="card-image"
			/>
		{:else if placeholderImage}
			<img
				src="{base}{placeholderImage}"
				alt={getLocalizedLabel(project.title, $activeLanguage)}
				class="card-image placeholder-image"
			/>
		{:else}
			<div class="placeholder-content">
				<span class="placeholder-text">{getLocalizedLabel(project.title, $activeLanguage)}</span>
			</div>
		{/if}
	</div>
	<div class="info">
		<div class="category-container">
			<div class="formats">
				{#each localizedFormats as formatLabel}
					<p>{formatLabel}</p>
				{/each}
			</div>
			<div class="location">
				<p>{project.location?.name}</p>
			</div>
		</div>
		<h3 class="title">{getLocalizedLabel(project.title, $activeLanguage)}</h3>
		<p class="author">{project.author}</p>
		{#if project.coauthors && project.coauthors.length > 0}
			<div class="coauthors">
				{#each project.coauthors as coauthor}
					<span>{coauthor}</span>
				{/each}
			</div>
		{/if}
		{#if project.schedule?.friday?.length > 0 || project.schedule?.saturday?.length > 0 || project.schedule?.sunday?.length > 0}
			<EventBadges schedule={project.schedule} />
		{/if}
	</div>
	<button
		class="save-button"
		class:saved={isSaved}
		on:click={handleSaveClick}
		aria-label={isSaved
			? getUIText('merkliste.removeFromMerkliste', $activeLanguage)
			: getUIText('merkliste.addToMerkliste', $activeLanguage)}
		data-tooltip={isSaved
			? getUIText('merkliste.removeFromMerkliste', $activeLanguage)
			: getUIText('merkliste.addToMerkliste', $activeLanguage)}
	>
		{#if isSaved}
			<img src="{base}/icons/basket_full.png" alt="Remove" class="basket-icon" />
		{:else}
			<img src="{base}/icons/basket_empty.png" alt="Add" class="basket-icon" />
		{/if}
	</button>
	<!-- <ScribbleAnimation /> -->
</a>

<style lang="scss">
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		gap: 0.5rem;
		width: 100%;
		padding: 1rem;
		background-color: $white;
		border-radius: $border-radius;
		border: 1px solid black;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		text-align: left;
		transition: border 0.3s ease-in-out;
		transform: rotate(var(--rotation));
		transition:
			box-shadow 300ms ease-in-out,
			transform 300ms ease-in-out,
			border 300ms ease-in-out,
			height 300ms ease-in-out;

		.save-button {
			opacity: 1;
		}

		&:hover {
			// border: 1px solid $color_pink;
			box-shadow: $box-shadow;
			box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
			transform: translateX(2px) translateY(-5px) rotate(var(--rotation));
		}
	}

	.image-container {
		width: 100%;
		position: relative;
		background-color: #f0f0f0; // Fallback for when image is loading or fails
		z-index: 10;
		overflow: hidden; // Ensures image stays within bounds
	}

	.image-container :global(.card-image),
	.image-container img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.image-container .placeholder-image {
		background-color: $grey;
	}

	.placeholder-content {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0.5rem; // Padding for placeholder text
	}

	h3,
	p.author {
		margin: 0;
		font-size: $font-medium;
		font-weight: 400;
	}

	p.author {
		font-style: italic;
	}

	.category-container {
		display: flex;
		gap: 1rem;
		flex-flow: row nowrap;
		justify-content: space-between;
		border-radius: 0.5rem;
		margin-bottom: 0.5rem;

		p {
			padding: 0;
			margin: 0;
			font-size: $font-small;
		}
	}

	.save-button {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: white;
		// border: 1px solid rgba(0, 0, 0, 0.5);
		color: black;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		line-height: 1;
		border-radius: $border-radius;
		transition: all 300ms ease-in-out;
		z-index: 20;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		// box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

		&:hover {
			transform: scale(1.1);
			background: white;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		}

		&:active {
			transform: scale(0.95);
		}

		&.saved {
			background: white;
			// color: black;
			border: 1px solid $color_pink;

			&:hover {
				transform: scale(1.1);
			}
		}

		.basket-icon {
			object-fit: contain;
			filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
		}

		// Add a subtle pulse animation when saved
		&.saved .basket-icon {
			animation: pulse 0.6s ease-in-out;
		}

		// Tooltip on hover
		&::after {
			content: attr(data-tooltip);
			position: absolute;
			bottom: 0.6rem;
			right: 3rem;
			background: rgba(0, 0, 0, 0.9);
			color: white;
			padding: 0.25rem 0.5rem;
			border-radius: 0.25rem;
			font-size: 10px;
			white-space: nowrap;
			opacity: 0;
			visibility: hidden;
			transition: opacity 200ms ease-in-out;
			z-index: 30;
			pointer-events: none;
		}

		&:hover::after {
			opacity: 1;
			visibility: visible;
		}
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
