<script lang="ts">
	import { base } from '$app/paths';
	import { onMount, createEventDispatcher } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import { closeProjectOverlay, type Project } from '$lib/stores/overlay';
	import { activeLanguage } from '$lib/stores/language';
	import { getLocalizedLabel, getUIText } from '$lib/utils/localization';
	import Overlay from './overlay/Overlay.svelte';
	import ProjectSingleContent from '../project/ProjectSingleContent.svelte';
	import EventBadges from './event-badges/EventBadgeList.svelte';
	import { merkelisteStore, addToMerkeliste, removeFromMerkeliste } from '$lib/stores/merkliste';
	import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';
	import { ensureResponsiveImage, applyProxyToResponsiveImage } from '$lib/utils/image-helpers';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	let { project, isOpen }: { project: Project; isOpen: boolean } = $props();

	const dispatch = createEventDispatcher();

	// Get optimal title image
	let titleImage = $derived.by(() => {
		if (!project?.titleImage?.[0]) {
			// Fallback to first image if no titleImage
			return project?.images?.[0] || null;
		}
		return project.titleImage[0];
	});

	// Calculate aspect ratio for layout
	let titleImageAspectRatio = $derived.by(() => {
		if (!titleImage) return 'landscape';

		const width = titleImage.originalWidth;
		const height = titleImage.originalHeight;

		if (width && height) {
			return width > height ? 'landscape' : 'portrait';
		}

		return 'landscape';
	});

	// Convert title image to responsive format
	let responsiveTitleImage = $derived.by(() => {
		if (!titleImage) return null;

		const converted = ensureResponsiveImage(titleImage);
		return converted ? applyProxyToResponsiveImage(converted) : null;
	});

	// No longer need to reload project data on language change since we have bilingual data

	function closeOverlay() {
		// Update URL back to projects only if in browser and router is ready
		if (browser) {
			try {
				replaceState('/projects', {});
			} catch (error) {
				// Router not ready, skip URL update
			}
		}
		closeProjectOverlay();
		dispatch('close');
	}

	onMount(() => {
		if (isOpen && browser) {
			// Update URL with project ID only if in browser and router is ready
			try {
				replaceState(`/projects/${project.id}`, {});
			} catch (error) {
				// Invalid project ID, skip URL update
			}
		}
	});

	let isSaved = $derived($merkelisteStore.savedProjects.includes(project.id));

	function handleSaveClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (isSaved) {
			removeFromMerkeliste(project.id);
		} else {
			addToMerkeliste(project.id);
		}
	}
</script>

<Overlay
	{isOpen}
	horizontal="center"
	vertical="center"
	height="full"
	staticRotation={0}
	on:close={closeOverlay}
>
	<div class="content aspect-ratio-{titleImageAspectRatio}">
		<div class="title-image-container">
			{#if responsiveTitleImage}
				<ResponsiveImage
					image={responsiveTitleImage}
					context="detail"
					alt={getLocalizedLabel(project.title, $activeLanguage) || 'Project image'}
					loading="eager"
					className="title-image-content"
				/>
			{:else}
				<div class="image-placeholder">
					<span>No image available</span>
				</div>
			{/if}
		</div>

		<div class="description-container">
			<div class="description-title-container">
				<h1 class="title">{getLocalizedLabel(project.title, $activeLanguage)}</h1>
				<div
					class="language-switcher-container"
					data-tooltip="Note that some projects are only available in German or English."
				>
					<LanguageSwitcher />
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
			</div>
			{#if project.authorship_visibility !== false}
				<div class="author">
					<span>{project.author}</span>{#if project.coauthors && project.coauthors.length > 0}
						{#each project.coauthors as coauthor}
							<span>, {coauthor}</span>
						{/each}
					{/if}
				</div>
			{/if}
			<div class="location-format-section">
				<p class="category">
					{project.formats.map((format) => getLocalizedLabel(format, $activeLanguage)).join(', ')}
				</p>
				<p class="location">{project.location?.name}</p>
			</div>
			{#if project.schedule.friday.length > 0 || project.schedule.saturday.length > 0 || project.schedule.sunday.length > 0}
				<EventBadges schedule={project.schedule} />
			{/if}

			<div class="contexts-section">
				<div class="contexts pills-container">
					{#each project.contexts as context}
						<p class="context info-pill">{context.name}</p>
					{/each}
				</div>
			</div>
		</div>
		{#if project.intro}
			<div class="project-intro">
				{getLocalizedLabel(project.intro, $activeLanguage)}
			</div>
		{/if}
		{#if project}
			<ProjectSingleContent {project} />
		{/if}
	</div>
</Overlay>

<style lang="scss">
	/* Desktop layout */
	@include desktop {
		:global(.overlay) {
			overflow-y: auto;
			padding: 2rem 0;
			display: flex !important;
			align-items: flex-start !important;
			min-height: 100vh;
		}

		:global(.container) {
			overflow: visible !important;
			height: fit-content !important;
			min-height: fit-content !important;
			margin: 0 auto;
			width: 75vw;
			position: relative !important;
			display: block !important;
		}

		:global(.container > *) {
			height: fit-content !important;
			min-height: fit-content !important;
		}

		.content {
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto auto 1fr;
			height: fit-content;
			padding: 2rem;
			gap: 2rem;
			max-height: none;
			overflow: visible;
			width: 100%;
		}

		.content.aspect-ratio-landscape {
			.title-image-container {
				grid-column: 1 / 3;
				grid-row: 1 / 2;
			}

			.description-container {
				grid-column: 1 / 3;
				grid-row: 2 / 3;
			}
		}

		.content.aspect-ratio-portrait {
			.title-image-container {
				grid-column: 1 / 2;
				grid-row: 1 / 2;
			}

			.description-container {
				grid-column: 2 / 3;
				grid-row: 1 / 2;
			}
		}

		:global(.dynamic-content-blocks) {
			grid-column: 1 / 3;
			grid-row: 3 / 4;
			transform: rotate(0deg);
		}
	}

	.description-title-container {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.title-image-container {
		display: block;
		background-color: #f0f0f0;
		width: 100%;
		position: relative;
		overflow: hidden;
		min-height: 200px;

		:global(.title-image-content) {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}

		.image-placeholder {
			width: 100%;
			height: 200px;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #f8f8f8;
			color: #666;
			font-size: $font-medium;
		}
	}

	.top-container {
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 4rem;
		gap: 1ch;

		.title-container {
			flex-grow: 1;
		}

		.save-button-container {
			width: fit-content;
			flex-grow: 0;
		}
	}

	@include desktop {
		.content.aspect-ratio-portrait .top-container {
			align-items: flex-end;
		}
	}

	.title {
		margin: 0;
		font-size: $font-xlarge;
		font-weight: 400;
		line-height: 1.2;
	}

	.author {
		margin-bottom: 1em;
	}

	.author span {
		margin: 0;
		font-size: $font-large;
		font-style: italic;
		color: rgba($black, 0.8);
	}

	.language-switcher-container {
		@include padding-h(1em);
	}

	.location-format-section {
		display: flex;
		gap: 1rem;
		align-items: baseline;
		flex-wrap: wrap;

		p.location {
			padding: 0;
			margin: 0;
			font-size: $font-medium;
		}

		p.category {
			padding: 0;
			margin: 0;
			font-size: $font-medium;
			color: rgba($black, 0.7);
		}
	}

	.contexts-section {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-top: 1rem;
	}

	.save-button {
		background: none;
		border: none;
		color: black;
		font-size: 1rem;
		cursor: pointer;
		line-height: 1;
		border-radius: $border-radius;
		transition: all 200ms ease-in-out;
		z-index: 20;
		display: flex;
		align-self: flex-start;
		gap: 0.5rem;
		white-space: nowrap;
		flex-shrink: 0;
		min-width: fit-content;

		// &:hover {
		// 	transform: scale(1.1);
		// }

		.basket-icon-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;
			white-space: nowrap;
			background: $white;
		}

		.basket-icon {
			width: 3rem;
			height: 3rem;
			object-fit: contain;
			flex-shrink: 0;
			border-radius: $border-radius;
			border: 1px solid $black;
			padding: 0.5rem;
			transition: all 200ms ease-in-out;

			&:hover {
				transform: scale(1.1);
			}
		}

		.basket-icon-text {
			font-size: $font-small;
			white-space: nowrap;
		}

		&:hover::before {
			opacity: 1;
			visibility: visible;
		}
	}

	.project-intro {
		margin-bottom: 1em;
		font-weight: bold;
		white-space: pre-wrap;
	}

	@include mobile-and-tablet {
		.content {
			padding: 1rem;
			display: flex;
			flex-direction: column;
			gap: 1rem;
			width: 100%;
		}

		.title {
			font-size: $font-large;
		}

		.description-container {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}

		.artist {
			font-size: $font-large;
		}

		.save-button {
			.basket-icon-text {
				display: none;
			}

			.basket-icon {
				width: 2.5rem;
				height: 2.5rem;
			}

			&::before {
				transform: translate(-105%, 20%);
				font-size: 0.75rem;
			}
		}
	}
</style>
