<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import PaperContainer from '../general/overlay/PaperContainer.svelte';
	import { activeLanguage } from '$lib/stores/language';
	import { getUIText } from '$lib/utils/localization';
	import type { EnrichedContextData } from '$lib/api/types/kirby';
	import { slide } from 'svelte/transition';
	import CloseButton from '../general/overlay/CloseButton.svelte';

	export let availableFaculties: Array<{ faculty: any; count: number }>;
	export let availableContexts: Array<{ context: EnrichedContextData; count: number }>;

	const dispatch = createEventDispatcher<{
		contextClick: { contextId: string };
		close: void;
	}>();

	function handleContextClick(contextId: string) {
		dispatch('contextClick', { contextId });
	}

	function handleClose() {
		dispatch('close');
	}
</script>

<PaperContainer height="auto" width="66vw" vertical="bottom">
	<CloseButton onClick={handleClose} />
	<p class="contexts-heading">{getUIText('locations.contexts.heading', $activeLanguage)}</p>
	<div class="location-details-section" transition:slide={{ duration: 150 }}>
		<!-- Faculties -->
		{#if availableFaculties.length > 0}
			<div class="section-group">
				<h4>{getUIText('locations.facultiesHeading', $activeLanguage)}</h4>
				<div class="pills-container">
					{#each availableFaculties as { faculty, count }}
						<div class="info-pill">
							<span class="item-name">{faculty.name}</span>
							<span class="project-count">({count})</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Courses (Contexts) -->
		{#if availableContexts.length > 0}
			<div class="section-group">
				<h4>{getUIText('locations.coursesHeading', $activeLanguage)}</h4>
				<div class="pills-container">
					{#each availableContexts as { context, count }}
						<button
							class="info-pill clickable-pill"
							on:click={() => handleContextClick(context.id)}
							data-tooltip={getUIText('locations.navigateToOverview', $activeLanguage)}
						>
							<span class="item-name">{context.name}</span>
							<span class="project-count">({count})</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</PaperContainer>

<style lang="scss">
	.location-details-section {
		margin-top: 1rem;
	}

	.section-group {
		margin-bottom: 1.5rem;
	}

	.section-group h4 {
		font-size: 0.9rem;
		font-weight: 600;
		color: #555;
		margin: 0 0 0.5rem 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.contexts-heading {
		// font-weight: normal;
		width: 100%;

		@include desktop {
			width: 80%;
		}
	}

	.clickable-pill {
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.clickable-pill:hover {
		border-color: $color_pink;
		color: $color_pink;
		transform: translateY(-1px);
	}

	.item-name {
		font-weight: 500;
		flex: 1;
	}

	.project-count {
		font-size: $font-size-project-count;
		margin-left: 0.5rem;
		font-variant-numeric: tabular-nums;
	}
</style>
