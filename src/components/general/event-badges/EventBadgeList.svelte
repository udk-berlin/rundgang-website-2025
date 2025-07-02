<script lang="ts">
	import type { Project } from '$lib/api/types/index';
	import EventBadge from './EventBadge.svelte';
	export let schedule: Project['schedule'];

	// Flatten and sort all events by start time
	$: allEvents = [
		...schedule.friday.map((event) => ({ ...event, day: 'friday' as const })),
		...schedule.saturday.map((event) => ({ ...event, day: 'saturday' as const })),
		...schedule.sunday.map((event) => ({ ...event, day: 'sunday' as const }))
	].sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());

	function formatForDisplay(date: string) {
		return new Date(date).toTimeString().split(' ')[0].split(':').slice(0, 2).join(':');
	}
</script>

<div class="events">
	{#each allEvents as event}
		<EventBadge from={event.fromDate} to={event.toDate} day={event.day} />
	{/each}
</div>

<style lang="scss">
	.events {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.5rem;
	}
</style>
