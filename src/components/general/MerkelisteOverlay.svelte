<script lang="ts">
	import { merkelisteStore, merkelisteProjects, closeMerkeliste } from '$lib/stores/merkliste';
	import { activeLanguage } from '$lib/stores/language';
	import { getUIText } from '$lib/utils/localization';
	import Overlay from './overlay/Overlay.svelte';
	import MerkelisteEntry from './MerkelisteEntry.svelte';
	import { getRandomRotation } from '$lib/utils';
	import { onMount } from 'svelte';

	const staticRotation = getRandomRotation();
	let vertical: 'top' | 'bottom' = 'bottom';

	function handleClose() {
		closeMerkeliste();
	}

	// show on bottom on mobile devices to avoid overlapping with menu
	onMount(() => {
		vertical = window.innerWidth < 1023 ? 'bottom' : 'top';
	});
</script>

<Overlay
	isOpen={$merkelisteStore.isOpen}
	horizontal="right"
	{vertical}
	height="auto"
	{staticRotation}
	on:close={handleClose}
	let:closeOverlay
>
	<div class="content">
		<h2>{getUIText('merkliste.title', $activeLanguage)}</h2>
		{#if $merkelisteProjects.loading}
			<p class="loading-state">Loading saved projects...</p>
		{:else if $merkelisteProjects.error}
			<p class="error-state">{$merkelisteProjects.error}</p>
		{:else if $merkelisteStore.savedProjects.length === 0}
			<p class="empty-state">{getUIText('merkliste.empty', $activeLanguage)}</p>
		{:else if $merkelisteProjects.projects.length === 0}
			<p class="error-state">No saved projects could be loaded</p>
		{:else}
			<div class="projects-list">
				{#each $merkelisteProjects.projects as project (project.id)}
					<MerkelisteEntry {project} {closeOverlay} />
				{/each}
			</div>
		{/if}
		<!-- <h2>{getUIText('merkliste.title', $activeLanguage)}</h2> -->
	</div>
</Overlay>

<style lang="scss">
	.content {
		padding: 2rem;
		padding-top: 3rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		overflow: auto;
	}

	h2 {
		margin: 0;
		font-size: $font-xlarge;
		font-weight: 400;
	}

	.empty-state {
		color: rgba($black, 0.6);
		font-style: italic;
	}

	.loading-state {
		color: rgba($black, 0.6);
		font-style: italic;
	}

	.error-state {
		color: rgba($black, 0.8);
		font-style: italic;
	}

	.projects-list {
		display: flex;
		width: 100%;
		flex-direction: column-reverse;
		gap: 1rem;
		overflow: inherit;
		padding: 1rem 0.2rem 0.2rem 0.2rem;
	}
</style>
