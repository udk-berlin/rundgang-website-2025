<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { projectsService } from '$lib/api';
	import { activeLanguage } from '$lib/stores/language';
	import { overlayStore } from '$lib/stores/overlay';
	import { getUIText } from '$lib/utils/localization';

	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			const projectId = $page.params.slug;

			if (!projectId) {
				goto('/');
				return;
			}

			// Try to load the project by ID
			const project = await projectsService.fetchById(projectId, $activeLanguage);

			if (project) {
				// First navigate to overview, then show the overlay
				goto('/', { replaceState: true }).then(() => {
					// goto('/overview', { replaceState: true }).then(() => {
					overlayStore.set({ isOpen: true, project });
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
	<title
		>{getUIText('pages.title_base', $activeLanguage)} - {getUIText(
			'pages.overview',
			$activeLanguage
		)}</title
	>
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
