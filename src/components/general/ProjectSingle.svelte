<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import { closeProjectOverlay, type Project } from '$lib/stores/overlay';
	import { activeLanguage } from '$lib/stores/language';
	import { getLocalizedLabel, getUIText } from '$lib/utils/localization';
	import Overlay from './overlay/Overlay.svelte';
	import ProjectSingleContent from '../project/ProjectSingleContent.svelte';
	import EventBadges from './event-badges/EventBadgeList.svelte';
	import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';
	import SaveButton from './SaveButton.svelte';
	import { ensureResponsiveImage, applyProxyToResponsiveImage } from '$lib/utils/image-helpers';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import ProjectSingleCloseButton from './ProjectSingleCloseButton.svelte';

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
</script>

<Overlay
	{isOpen}
	horizontal="center"
	vertical="center"
	height="full"
	staticRotation={0}
	showCloseButton={false}
	variant="full-content"
	on:close={closeOverlay}
>
	<ProjectSingleCloseButton onClose={closeOverlay} />
	<div class="content aspect-ratio-{titleImageAspectRatio}">
		<div class="title-image-container">
			<SaveButton projectId={project.id} variant="card" />
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
			{#if project.schedule.friday.length > 0 || project.schedule.saturday.length > 0 || project.schedule.sunday.length > 0}
				<div class="event-badge-container">
					<EventBadges schedule={project.schedule} direction="column" />
				</div>
			{/if}
		</div>

		<div class="location-format-section">
			<div class="location-container">
				<p class="location">{project.location?.name}</p>
				{#if project.location_additional_info}
					<p class="location-additional-info">{project.location_additional_info}</p>
				{/if}
			</div>
			<div class="category-container">
				<p class="category">
					{project.formats.map((format) => getLocalizedLabel(format, $activeLanguage)).join(', ')}
				</p>
			</div>
		</div>

		<div class="info-section">
			<div class="title-author-container">
				<div class="description-title-container">
					<h1 class="title">{getLocalizedLabel(project.title, $activeLanguage)}</h1>
					<div
						class="language-switcher-container"
						data-tooltip={getUIText('languageSwitcher.de', $activeLanguage)}
					>
						<LanguageSwitcher />
					</div>
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
			</div>

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
		.content {
			padding: 2rem;
			gap: 2rem;
			max-height: none;
			overflow: visible;
			width: 100%;
			height: fit-content;
		}

		.content.aspect-ratio-landscape {
			display: grid;
			grid-template-areas:
				'image image'
				'location contexts'
				'title-author contexts'
				'intro intro'
				'content content';
			grid-template-columns: 2fr 1fr;
			grid-template-rows: auto auto auto auto 1fr;

			.title-image-container {
				grid-area: image;
			}

			.location-format-section {
				grid-area: location;
				align-self: start;
				height: fit-content;
			}

			.info-section {
				display: contents;

				.title-author-container {
					grid-area: title-author;
				}

				.contexts-section {
					grid-area: contexts;
					align-self: start;
				}
			}

			.project-intro {
				grid-area: intro;
			}

			:global(.dynamic-content-blocks) {
				grid-area: content;
			}
		}

		.content.aspect-ratio-portrait {
			display: grid;
			grid-template-areas:
				'image location-format'
				'image title-author'
				'intro intro'
				'content content';
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto 1fr auto 1fr;

			.title-image-container {
				grid-area: image;
			}

			.location-format-section {
				grid-area: location-format;
				align-self: start;
				height: fit-content;
			}

			.info-section {
				grid-area: title-author;
				display: flex;
				flex-direction: column;
				gap: 1rem;
				align-self: start;
				margin-top: 1rem;
			}

			.project-intro {
				grid-area: intro;
			}

			:global(.dynamic-content-blocks) {
				grid-area: content;
			}
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

		.event-badge-container {
			font-size: $font-large;
			position: absolute;
			bottom: 0.5rem;
			left: 0.5rem;

			@include desktop {
				font-size: $font-large;
			}
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
		gap: 0.5ch;
		align-items: flex-start;
		flex-flow: row nowrap;
		justify-content: space-between;
		text-transform: uppercase;
		font-size: $font-small;

		@include desktop {
			font-size: $font-medium;
		}

		& .location-additional-info {
			text-transform: none;
		}

		& > div {
			flex-basis: 50%;
		}

		p.location,
		p.category {
			padding: 0;
			margin: 0;
		}

		p.category {
			text-align: end;
		}
	}

	.contexts-section {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;

		.pills-container {
			justify-content: flex-end;

			.info-pill {
				text-align: end;
			}
		}
	}

	.project-intro {
		width: 66.666%;
		max-width: 66.666%;
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

		.info-section {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.title-author-container {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
