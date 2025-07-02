<script lang="ts">
	import { openProjectOverlay, type Project } from '../../lib/stores/overlay';
	import { removeFromMerkeliste, closeMerkeliste } from '$lib/stores/merkliste';
	import { activeLanguage } from '$lib/stores/language';
	import { getLocalizedLabel, getLocalizedDayName } from '$lib/utils/localization';
	import { getRandomRotation } from '$lib/utils';
	import ScribbleBorder from '../scribble/ScribbleBorder.svelte';
	import EventBadges from './event-badges/EventBadgeList.svelte';

	export let project: Project;
	export let closeOverlay: () => void;
	const rotation = getRandomRotation();

	function formatForDisplay(date: string) {
		return new Date(date).toTimeString().split(' ')[0].split(':').slice(0, 2).join(':');
	}

	let scribbleSeed: number;
	// Get the localized title for scribble seed calculation
	$: localizedTitle = getLocalizedLabel(project.title, $activeLanguage);
	$: scribbleSeed = (localizedTitle.charCodeAt(0) % 5) + 1; // just some way to randomize the scribble border

	function handleClick(event: MouseEvent) {
		event.preventDefault();
		closeOverlay();
		setTimeout(() => {
			openProjectOverlay(project);
		}, 300);
	}

	function handleRemove(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		removeFromMerkeliste(project.id);
	}
</script>

<div class="entry" style="--rotation: {rotation}deg">
	<!-- <ScribbleBorder seed={scribbleSeed} scale={0.7} /> -->
	<a href="/" class="content" on:click={handleClick}>
		<div class="info">
			<h3 class="title">{getLocalizedLabel(project.title, $activeLanguage)}</h3>
			<p class="author">{project.author}</p>
			{#if project.coauthors && project.coauthors.length > 0}
				<p class="coauthors">
					{#each project.coauthors as coauthor}
						<span>{coauthor}</span>
					{/each}
				</p>
			{/if}
			<div class="category-container">
				<p class="category">
					{project.formats && project.formats.length > 0
						? getLocalizedLabel(project.formats[0], $activeLanguage)
						: ''}
				</p>
			</div>
			<div class="location">
				<p>{project.location?.name}</p>
			</div>
			{#if project.schedule}
				<div class="events">
					<EventBadges schedule={project.schedule} />
				</div>
			{/if}
		</div>
	</a>
	<button class="remove-button" on:click={handleRemove} aria-label="Remove from Merkliste">
		<img src="icons/basket_full.png" alt="Remove" class="basket-icon" />
	</button>
</div>

<style lang="scss">
	.entry {
		position: relative;
		border-radius: $border-radius;
		// border: 1px solid $black;
		transition: all 0.3s ease-in-out;
		background-color: $white;
		width: 100%;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

		border: 1px solid $black;
		border-radius: $border-radius;

		&:hover {
			box-shadow: $box-shadow;
			box-shadow: 10px 5px 10px 0 rgba($black, 0.1);
			transform: translateX(2px) translateY(-5px);
		}
	}

	.content {
		display: flex;
		padding: 0.5rem;
		gap: 1rem;
		width: 100%;
	}

	.info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.category-container {
		display: flex;
		justify-content: space-between;
		gap: 1rem;

		p {
			margin: 0;
			font-size: $font-small;
			color: rgba($black, 0.7);
		}
	}

	.title {
		margin: 0;
		font-size: $font-medium;
		font-weight: 400;
		line-height: 1.2;
	}

	.author {
		margin: 0;
		font-style: italic;
		font-size: $font-small;
		color: rgba($black, 1);
	}

	.coauthors {
		margin: 0;
		font-style: italic;
		font-size: $font-small;
		color: rgba($black, 1);
	}

	.location {
		font-size: $font-small;
		color: rgba($black, 1);
	}

	.events {
		font-size: $font-small;
		color: rgba($black, 1);
	}

	.remove-button {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s ease;
		z-index: 2;

		&:hover {
			color: $color_pink;
		}
	}
</style>
