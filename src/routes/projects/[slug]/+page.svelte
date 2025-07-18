<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { projectsService } from '$lib/api';
	import { activeLanguage } from '$lib/stores/language';
	import { overlayStore } from '$lib/stores/overlay';
	import { getUIText } from '$lib/utils/localization';
	import type { Project } from '$lib/api/types/projects';

	let loading = true;
	let error: string | null = null;
	let project: Project | null = null;

	onMount(async () => {
		try {
			const projectId = $page.params.slug;

			if (!projectId) {
				goto('/');
				return;
			}

			// Try to load the project by ID
			const fetchedProject = await projectsService.fetchById(projectId, $activeLanguage);

			if (fetchedProject) {
				project = fetchedProject;
				// First navigate to overview, then show the overlay
				goto('/', { replaceState: true }).then(() => {
					// goto('/overview', { replaceState: true }).then(() => {
					overlayStore.set({ isOpen: true, project: fetchedProject });
				});
			} else {
				// Project not found, redirect to main page
				goto('/');
			}
		} catch (err) {
			// console.error('Failed to load project:', err);
			error = err instanceof Error ? err.message : 'Failed to load project';

			// Redirect to main page after a brief delay
			setTimeout(() => {
				goto('/');
			}, 2000);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	{#if project}
		<title
			>{getUIText('pages.title_base', $activeLanguage)} - {project.title[$activeLanguage]}</title
		>
		<meta property="og:title" content={project.title[$activeLanguage]} />
		<meta property="og:type" content="article" />
		<meta property="og:url" content={project.url} />
		{#if project.titleImage && project.titleImage.length > 0}
			<meta property="og:image" content={project.titleImage[0].url} />
			<meta property="og:image:alt" content={project.title[$activeLanguage]} />
		{/if}
		{#if project.intro}
			<meta property="og:description" content={project.intro[$activeLanguage]} />
		{/if}
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={project.title[$activeLanguage]} />
		{#if project.intro}
			<meta name="twitter:description" content={project.intro[$activeLanguage]} />
		{/if}
		{#if project.titleImage && project.titleImage.length > 0}
			<meta name="twitter:image" content={project.titleImage[0].url} />
		{/if}
	{:else}
		<title
			>{getUIText('pages.title_base', $activeLanguage)} - {getUIText(
				'pages.overview',
				$activeLanguage
			)}</title
		>
	{/if}
</svelte:head>

{#if loading}
	<div class="loading-container">
		<p>Loading project...</p>
	</div>
{:else if error}
	<div class="error-container">
		<p>Error: {error}</p>
		<p>Redirecting to main page...</p>
	</div>
{/if}

<style lang="scss">
	.loading-container,
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		text-align: center;
		gap: 1rem;

		p {
			font-size: $font-large;
			color: rgba($black, 0.7);
		}
	}

	.error-container p {
		color: #d32f2f;
	}
</style>
