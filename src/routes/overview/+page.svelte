<script lang="ts">
	import { onMount } from 'svelte';
	import ProjectContainer from '../../components/general/ProjectContainer.svelte';
	import { projectsService, type Project } from '$lib/api';
	import { activeLanguage } from '$lib/stores/language';

	import ScribbleAnimation from '../../components/scribble/ScribbleAnimation.svelte';
	import { getUIText } from '$lib/utils/localization';
	import FilterContainer from '../../components/filter/FilterContainer.svelte';

	// All projects loaded at once
	let allProjects: Project[] = [];
	let loading = true;
	let error: string | null = null;

	// Load projects using simplified bilingual API
	async function loadProjects() {
		try {
			loading = true;
			error = null;

			console.log(`Overview: Loading bilingual projects`);
			allProjects = await projectsService.fetchAllProjects();

			console.log(`Overview: Loaded ${allProjects.length} bilingual projects`);
			console.log(`Overview: Sample project:`, {
				title: allProjects[0]?.title,
				formats: allProjects[0]?.formats
			});
		} catch (err) {
			// console.error('Failed to load projects:', err);
			error = err instanceof Error ? err.message : 'Failed to load projects';
		} finally {
			loading = false;
		}
	}

	// Initialize on mount - load bilingual data once
	onMount(() => {
		console.log('Overview component mounted');
		loadProjects();
	});

	// Debug logging to track data changes
	$: if (allProjects.length > 0) {
		console.log(`Overview: Projects data updated for language ${$activeLanguage}:`, {
			projectCount: allProjects.length,
			firstProjectSample: {
				title: allProjects[0].title,
				author: allProjects[0].author,
				coauthors: allProjects[0].coauthors,
				formats: allProjects[0].formats
			}
		});
		// Verify that project data actually contains correct language content
		console.log(
			`Overview: Sample project formats (should match ${$activeLanguage}):`,
			allProjects[0].formats
		);
	}

	// Create a reactive key that includes language to force component updates
	$: projectsKey = `${$activeLanguage}-${allProjects.length}`;
</script>

<svelte:head>
	<title
		>{getUIText('pages.title_base', $activeLanguage)} - {getUIText(
			'pages.overview',
			$activeLanguage
		)}</title
	>
</svelte:head>

<!-- <div class="scribble-container">
	<ScribbleAnimation />
</div> -->
<main>
	<h1>{getUIText('pages.overview', $activeLanguage)}</h1>

	{#if loading && allProjects.length === 0}
		<div class="loading-state">
			<p>Loading projects...</p>
		</div>
	{:else if error && allProjects.length === 0}
		<div class="error-state">
			<p>Error loading projects: {error}</p>
			<button on:click={() => loadProjects()}>Retry</button>
		</div>
	{:else}
		{#key projectsKey}
			<ProjectContainer projects={allProjects} bottomSpace={true} />
		{/key}

		<!-- {#if allProjects.length > 0}
	<div class="project-stats">
		<p>Showing {allProjects.length} projects</p>
		</div>
		{/if} -->

		{#if error && allProjects.length > 0}
			<div class="error-message">
				<p>Error: {error}</p>
				<button on:click={() => loadProjects()}>Retry</button>
			</div>
		{/if}
	{/if}

	<FilterContainer />
</main>

<style lang="scss">
	@include mobile-only {
		main {
			display: flex;
			flex-direction: column;
			gap: 2rem;
			padding: $body-header-spacing $body-padding-h-mobile;
		}
	}

	.loading-state,
	.error-state {
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


	.error-message {
		text-align: center;
		margin: 2rem 0;

		p {
			color: #d32f2f;
			font-size: $font-medium;
		}

		button {
			padding: 0.5rem 1rem;
			border: 1px solid #d32f2f;
			border-radius: $border-radius;
			background: white;
			color: #d32f2f;
			cursor: pointer;
			font-size: $font-small;
			margin-top: 0.5rem;
			transition: all 0.2s ease;

			&:hover {
				background: #d32f2f;
				color: white;
			}
		}
	}
</style>
