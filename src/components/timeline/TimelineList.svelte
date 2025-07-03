<script lang="ts">
	import ProjectContainer from '../general/ProjectContainer.svelte';
	import AccordionList from '../general/accordion/AccordionList.svelte';
	import TimelineSelectedRangesSummary from './TimelineSelectedRangesSummary.svelte';
	import type { Project } from '$lib/api';
	import type { EnrichedLocationData } from '$lib/api/types/kirby';
	import { activeLanguage } from '$lib/stores/language';
	import { clearTimelineFilters } from '$lib/stores/filter';
	import { getUIText } from '$lib/utils/localization';

	export let loading: boolean = false;
	export let error: string | null = null;
	export let allProjects: Project[] = [];
	export let availableLocations: EnrichedLocationData[] = [];
	export let locationGroups: {
		location: EnrichedLocationData;
		projects: Project[];
	}[] = [];
	export let accordionItems: any[] = [];
	export let totalFilteredProjects: number = 0;
	export let data: { totalProjects: number };
	export let hasFiltersActive: boolean;
	export let loadAllProjects: (language: 'DE' | 'EN') => Promise<void>;
	export let selectedRanges: {
		friday: [number, number][];
		saturday: [number, number][];
		sunday: [number, number][];
	};
</script>

{#if loading && allProjects.length === 0}
	<div class="loading-state">
		<p>{getUIText('timeline.loadingProjects', $activeLanguage)}</p>
	</div>
{:else if error && allProjects.length === 0}
	<div class="error-state">
		<p>{getUIText('timeline.errorLoadingProjects', $activeLanguage, { error })}</p>
		<button on:click={() => loadAllProjects($activeLanguage)}
			>{getUIText('timeline.retry', $activeLanguage)}</button
		>
	</div>
{:else if availableLocations.length === 0}
	<div class="empty-state">
		<p>{getUIText('timeline.noProjectsWithLocations', $activeLanguage)}</p>
	</div>
{:else}
	<div class="timeline-projects-container">
		{#if hasFiltersActive}
			<TimelineSelectedRangesSummary
				{selectedRanges}
				projectCount={totalFilteredProjects}
				locationsCount={locationGroups.length}
			/>
		{/if}
		{#if locationGroups.length === 0}
			<div class="no-results">
				<p>{getUIText('timeline.noMatchingProjects', $activeLanguage)}</p>
				{#if hasFiltersActive}
					<button on:click={clearTimelineFilters}
						>{getUIText('timeline.clearFiltersToSeeAll', $activeLanguage)}</button
					>
				{/if}
			</div>
		{:else}
			<AccordionList
				items={accordionItems}
				showDivider={false}
				showDividerTop={true}
				textAlign="right"
				contentAlign="right"
			>
				<div slot="head" let:item class="location-info">
					<p class="project-count">
						{item.projects.length}
						{item.projects.length === 1
							? getUIText('timeline.projectCount.singular', $activeLanguage)
							: getUIText('timeline.projectCount.plural', $activeLanguage)}
					</p>
					<h2>{item.location.name}</h2>
				</div>

				<div slot="details" let:item>
					{#key `${$activeLanguage}-${item.projects.length}-${item.projects[0]?.id}`}
						<ProjectContainer projects={item.projects} disableFiltering={true} />
					{/key}
				</div>
			</AccordionList>
		{/if}
	</div>

	{#if error && allProjects.length > 0}
		<div class="error-message">
			<p>{getUIText('timeline.error', $activeLanguage, { error })}</p>
			<button on:click={() => loadAllProjects($activeLanguage)}
				>{getUIText('timeline.retry', $activeLanguage)}</button
			>
		</div>
	{/if}
{/if}

<style lang="scss">
	.loading-state,
	.error-state,
	.empty-state {
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

	.no-results {
		text-align: center;
		padding: 3rem 1rem;
		color: rgba($black, 0.6);

		p {
			font-size: $font-medium;
			margin-bottom: 1rem;
		}

		button {
			background: none;
			border: 1px solid $color_pink;
			border-radius: 4px;
			padding: 0.75rem 1.5rem;
			color: $color_pink;
			cursor: pointer;
			font-size: $font-small;
			transition: all 0.2s ease;

			&:hover {
				background: $color_pink;
				color: white;
			}
		}
	}

	.timeline-projects-container {
		max-width: 100%;
		width: 100%;
		margin: 5rem auto;
	}

	.location-info {
		display: flex;
		width: 100%;
		text-align: right;
		flex-direction: column-reverse;
		align-items: flex-end;

		@include desktop {
			flex-flow: row nowrap;
			justify-content: flex-end;
			align-items: baseline;
			gap: 2ch;
		}

		h2 {
			font-size: $font-large;
			transition: color 0.2s ease;
		}

		:global(.accordion) & h2 {
			color: inherit;
		}

		:global(.accordion.open) & h2 {
			color: $color_pink;
		}

		&:hover {
			h2 {
				color: $color_pink;
			}
		}

		.project-count {
			font-size: $font-medium;
			color: rgba($black, 0.6);
		}
	}

	.summary-stats {
		position: fixed;
		bottom: 20px;
		right: 20px;
		font-family: 'Courier', monospace;
		text-align: right;
		background: rgba($black, 0.02);
		border-radius: $border-radius;

		p {
			font-size: $font-small;
			color: rgba($black, 0.6);
			margin-bottom: 0.5rem;

			&:last-child {
				margin-bottom: 0;
			}

			&.note {
				font-style: italic;
				color: rgba($black, 0.5);
			}
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
