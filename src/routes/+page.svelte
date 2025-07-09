<script lang="ts">
	import type { PageData } from './$types';
	import ProjectContainer from '../components/general/ProjectContainer.svelte';
	import LandingPage from '../components/landing/LandingPage.svelte';
	import FilterContainer from '../components/filter/FilterContainer.svelte';
	import { projectsService } from '$lib/api';
	import type { Project } from '$lib/api/types/index';
	import { getUIText } from '$lib/utils/localization';
	import { activeLanguage } from '$lib/stores/language';

	export let data: PageData;

	// State for progressive loading
	let allProjects: Project[] = data.initialProjects;
	let loading = false;
	let loadingProgress = data.initialProjects.length;
	let expectedProjectCount = data.expectedCount;
	// Remove projectsKey - no longer needed for re-rendering
	let landingContentReady = false;

	// Calculate skeleton count for remaining projects
	$: skeletonCount = Math.max(0, expectedProjectCount - loadingProgress);

	async function startProgressiveLoad() {
		if (loading || allProjects.length >= expectedProjectCount) return;

		loading = true;

		try {
			// Get all metadata (should be cached from server load)
			const allMetadata = await projectsService.fetchAllProjects({}, data.language);

			// Progressive loading in chunks
			const chunkSize = 30;
			let currentIndex = allProjects.length;

			while (currentIndex < allMetadata.length && loading) {
				const nextChunk = allMetadata.slice(currentIndex, currentIndex + chunkSize);

				if (nextChunk.length > 0) {
					allProjects = [...allProjects, ...nextChunk];
					loadingProgress = allProjects.length;

					// Small delay to allow UI updates
					await new Promise((resolve) => setTimeout(resolve, 50));
				}

				currentIndex += chunkSize;
			}
		} catch (error) {
			// console.error('Error during progressive loading:', error);
		} finally {
			loading = false;
		}
	}

	function handleLandingContentReady() {
		landingContentReady = true;
		// Start progressive loading after landing is ready
		if (allProjects.length < expectedProjectCount) {
			startProgressiveLoad();
		}
	}
</script>

<svelte:head>
	<title>{getUIText('pages.title_base', $activeLanguage)}</title>
	<meta name="description" content="Rundgang 2025 - Graduate Exhibition" />
</svelte:head>

<main>
	<FilterContainer />

	<LandingPage on:contentReady={handleLandingContentReady} />
	<ProjectContainer projects={allProjects} {skeletonCount} bottomSpace={true} />
</main>

<style lang="scss">
	main {
		position: relative;
		width: 100%;
		min-height: 100vh;
	}
</style>
