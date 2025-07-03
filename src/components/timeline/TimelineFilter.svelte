<script lang="ts">
	import { activeLanguage } from '$lib/stores/language';
	import { filterStore, clearTimelineFilters, setTimelineTimeRanges } from '$lib/stores/filter';
	import TimelineMultiSlider from './TimelineMultiSlider.svelte';
	import { ALL_TIMELINE_DAYS } from '$lib/utils/timeline-filter';
	import { getUIText } from '$lib/utils/localization';
	import PaperContainerTitle from '../general/overlay/PaperContainerTitle.svelte';

	// Timeline-specific handlers
	function handleTimeRangeChange(
		event: CustomEvent<{ day: 'friday' | 'saturday' | 'sunday'; ranges: [number, number][] }>
	) {
		setTimelineTimeRanges(event.detail.day, event.detail.ranges);
	}

	function handleClearAll() {
		clearTimelineFilters();
	}
</script>

<!-- Timeline-specific filters -->
<div class="filter-options">
	<!-- Time Slot Filters -->
	<div class="filter-group time-sliders">
		<PaperContainerTitle>{getUIText('filter.timeSlots', $activeLanguage)}</PaperContainerTitle>
		<div class="timeline-sliders">
			{#each ALL_TIMELINE_DAYS as day}
				<TimelineMultiSlider
					day={day.id}
					selectedRanges={$filterStore.timeline.timeRanges[day.id]}
					on:change={handleTimeRangeChange}
				/>
			{/each}
		</div>
	</div>
	<!-- Clear All Button -->
	<div
		class="clear-all-section"
		class:visible={$filterStore.timeline.timeRanges.friday.length > 0 ||
			$filterStore.timeline.timeRanges.saturday.length > 0 ||
			$filterStore.timeline.timeRanges.sunday.length > 0}
	>
		<button class="clear-all-button" on:click={handleClearAll}
			>{getUIText('filter.clearAll', $activeLanguage)}</button
		>
	</div>
</div>

<style lang="scss">
	.filter-options {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		padding: 2rem 5%;
		padding-left: 0;
		gap: 1rem;

		@include desktop {
			padding: 2rem 10%;
		}
	}

	.filter-group {
		margin-bottom: 1.5rem;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.time-sliders {
		.timeline-sliders {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
			margin-top: 0.5rem;

			@include desktop {
				gap: 1rem;
			}
		}
	}

	.clear-all-section {
		visibility: hidden;

		&.visible {
			visibility: visible;
		}
	}

	.clear-all-button {
		width: 100%;
		padding: 0.5rem 1rem;
		border: 1px solid $color_pink;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background-color 0.15s ease;

		&:hover {
			background-color: rgba($color_pink, 0.1);
		}
	}
</style>
