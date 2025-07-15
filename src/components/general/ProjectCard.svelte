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
	import SaveButton from './SaveButton.svelte';
	import { onMount, createEventDispatcher } from 'svelte';
	import { dev } from '$app/environment';
	import type { Project } from '$lib/api/types/index';
	import type { ResponsiveImageEntry } from '$lib/api/types/common';

	const dispatch = createEventDispatcher();

	export let project: Project;

	const FORCE_PLACEHOLDER: boolean = false;

	const rotation = getRandomRotation();

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

	function handleCardClick(event: MouseEvent) {
		event.preventDefault();
		dispatch('click', project);
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
		<SaveButton projectId={project.id} variant="card" />
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
		{#if project.schedule?.friday?.length > 0 || project.schedule?.saturday?.length > 0 || project.schedule?.sunday?.length > 0}
			<div class="event-badge-container">
				<EventBadges schedule={project.schedule} direction="column" />
			</div>
		{/if}
	</div>
	<div class="info">
		<div class="category-container">
			<div class="location">
				<p>{project.location?.name}</p>
			</div>
			<div class="formats">
				{#each localizedFormats as formatLabel}
					<p>{formatLabel}</p>
				{/each}
			</div>
		</div>
		<h3 class="title">{getLocalizedLabel(project.title, $activeLanguage)}</h3>
		{#if !project.authorship_visibility}
			<div class="author">
				<span>{project.author}</span>{#if project.coauthors && project.coauthors.length > 0}
					{#each project.coauthors as coauthor}
						<span>, {coauthor}</span>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
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

	.event-badge-container {
		position: absolute;
		bottom: 0.5rem;
		left: 0.5rem;
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
	.author span {
		margin: 0;
		font-size: $font-medium;
		font-weight: 400;
	}

	h3 {
		overflow-wrap: anywhere; // otherwise very long titles disrupt layout
	}

	.author span {
		font-style: italic;
	}

	.category-container {
		display: flex;
		gap: 0.5ch;
		flex-flow: row nowrap;
		justify-content: space-between;
		border-radius: 0.5rem;
		margin-bottom: 0.5rem;
		text-transform: uppercase;

		p {
			padding: 0;
			margin: 0;
			font-size: $font-small;
		}
	}
</style>
