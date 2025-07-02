<script lang="ts">
	import { activeLanguage } from '$lib/stores/language';
	import { getLocalizedDayAbbreviation } from '$lib/utils/localization';
	import { fade } from 'svelte/transition';

	export let day: 'friday' | 'saturday' | 'sunday';
	export let from: number | string;
	export let to: number | string;
	export let fullSize: boolean = false;

	function formatForDisplay(time: number | string) {
		// Handle hour numbers (from timeline filter)
		if (typeof time === 'number') {
			return `${time.toString().padStart(2, '0')}:00`;
		}
		// actual date strings (from project metadata)
		return new Date(time).toTimeString().split(' ')[0].split(':').slice(0, 2).join(':');
	}
</script>

<span class={day} class:full-size={fullSize} transition:fade={{ duration: 200 }}>
	{getLocalizedDayAbbreviation(day, $activeLanguage)}
	{formatForDisplay(from)}-{formatForDisplay(to)}
</span>

<style lang="scss">
	span {
		display: inline-block;
		padding: 0.125rem 0.375rem 0;
		border-radius: 0.5em;
		font-size: 0.75em;
		font-weight: normal;
		color: white;
		text-align: center;
		white-space: nowrap;
		line-height: 1.2;
		margin-right: 0.5ch;

		&:last-of-type {
			margin-right: 0;
		}

		&.full-size {
			font-size: 1em;
		}

		&.friday {
			background-color: $color_day_friday;
			color: $black; /* Yellow background needs dark text for readability */
		}

		&.saturday {
			background-color: $color_day_saturday;
		}

		&.sunday {
			background-color: $color_day_sunday;
		}
	}
</style>
