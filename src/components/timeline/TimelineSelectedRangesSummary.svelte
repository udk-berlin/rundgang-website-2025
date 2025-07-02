<script lang="ts">
	import { ALL_TIMELINE_DAYS } from '$lib/utils/timeline-filter';
	import EventBadge from '../general/event-badges/EventBadge.svelte';
	import { slide } from 'svelte/transition';
	import Underlined from '../general/highlighting/Underlined.svelte';
	import { activeLanguage } from '$lib/stores/language';
	import { getUIText } from '$lib/utils/localization';

	export let selectedRanges: {
		friday: [number, number][];
		saturday: [number, number][];
		sunday: [number, number][];
	};
	export let projectCount: number = 0;
	export let locationsCount: number = 0;
</script>

<div transition:slide>
	<p>
		<Underlined
			>{projectCount}
			{#if projectCount > 1}{getUIText(
					'timeline.summary.projects.plural',
					$activeLanguage
				)}{:else}{getUIText('timeline.summary.projects.singular', $activeLanguage)}{/if}</Underlined
		>
		{getUIText('timeline.summary.foundFor', $activeLanguage)}
		{#if selectedRanges.friday.length > 0 || selectedRanges.saturday.length > 0 || selectedRanges.sunday.length > 0}
			{@const flattenedRanges = ALL_TIMELINE_DAYS.flatMap((day) =>
				selectedRanges[day.id].map(([start, end]) => ({ day: day.id, start, end }))
			)}
			{#each flattenedRanges as range, index}
				{#if index === flattenedRanges.length - 1 && flattenedRanges.length > 1}<span>
						{getUIText('timeline.summary.and', $activeLanguage)}
					</span>{/if}<EventBadge day={range.day} from={range.start} to={range.end} fullSize />
			{/each}{getUIText('timeline.summary.in', $activeLanguage)}
			<Underlined
				>{locationsCount}
				{#if locationsCount > 1}{getUIText(
						'timeline.summary.locations.plural',
						$activeLanguage
					)}{:else}{getUIText(
						'timeline.summary.locations.singular',
						$activeLanguage
					)}{/if}</Underlined
			>.
		{/if}
	</p>
</div>

<style lang="scss">
	div {
		margin-bottom: 3em;
		height: auto;
		transition: height 200ms ease-in-out;

		@include desktop {
			width: 66%;
			margin-left: auto;
			margin-bottom: 3em;
		}

		span {
			margin-right: 0.5ch;
		}

		p {
			text-wrap: balance;
			font-size: $font-xlarge;

			@include desktop {
				text-align: right;
				font-size: $font-xlarge;
			}
		}
	}
</style>
