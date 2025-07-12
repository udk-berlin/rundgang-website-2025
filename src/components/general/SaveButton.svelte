<script lang="ts">
	import { base } from '$app/paths';
	import { merkelisteStore, addToMerkeliste, removeFromMerkeliste } from '$lib/stores/merkliste';
	import { activeLanguage } from '$lib/stores/language';
	import { getUIText } from '$lib/utils/localization';

	export let projectId: string;
	export let variant: 'card' | 'single' = 'card';

	$: isSaved = $merkelisteStore.savedProjects.includes(projectId);

	function handleSaveClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (isSaved) {
			removeFromMerkeliste(projectId);
		} else {
			addToMerkeliste(projectId);
		}
	}
</script>

<button
	class="save-button {variant}"
	class:saved={isSaved}
	on:click={handleSaveClick}
	aria-label={isSaved
		? getUIText('merkliste.removeFromMerkliste', $activeLanguage)
		: getUIText('merkliste.addToMerkliste', $activeLanguage)}
	data-tooltip={isSaved
		? getUIText('merkliste.removeFromMerkliste', $activeLanguage)
		: getUIText('merkliste.addToMerkliste', $activeLanguage)}
>
	{#if isSaved}
		<img src="{base}/icons/basket_full.png" alt="Remove" class="basket-icon" />
	{:else}
		<img src="{base}/icons/basket_empty.png" alt="Add" class="basket-icon" />
	{/if}
</button>

<style lang="scss">
	.save-button {
		background: none;
		border: none;
		color: black;
		cursor: pointer;
		line-height: 1;
		border-radius: $border-radius;
		transition: all 300ms ease-in-out;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;

		&::after {
			content: attr(data-tooltip);
			position: absolute;
			padding: 0.25rem 0.25rem;
			border-radius: $border-radius;
			font-size: $font-small;
			white-space: nowrap;
			transition: opacity 200ms ease-in-out;
			z-index: 30;
			pointer-events: none;
			opacity: 0;
			visibility: hidden;
		}

		&:hover::after {
			opacity: 1;
			visibility: visible;
		}

		.basket-icon {
			object-fit: contain;
			filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
		}
	}

	/* Card variant - small, semi-transparent, absolute positioned */
	.save-button.card {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(2px);
		font-size: 1.5rem;
		padding: 0.5rem;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid rgba(255, 255, 255, 0.5);

		&:hover {
			transform: scale(1.1);
			background: rgba(255, 255, 255, 0.4);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		}

		&:active {
			transform: scale(0.95);
		}

		&.saved {
			background: rgba(255, 255, 255, 0.3);
			backdrop-filter: blur(2px);
			border: 1px solid $color_pink;
			box-shadow: inset 0px 0px 10px $color_pink;

			&:hover {
				transform: scale(1.1);
			}
		}

		.basket-icon {
			width: 1.5rem;
			height: 1.5rem;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		&.saved .basket-icon {
			animation: pulse 0.6s ease-in-out;
		}

		&::after {
			transform: translate(-70%, 0%) rotate(var(--rotation));
		}
	}

	/* Single variant - large, no background, for detail view */
	.save-button.single {
		font-size: 1rem;
		align-self: flex-start;
		gap: 0.5rem;
		white-space: nowrap;
		flex-shrink: 0;
		min-width: fit-content;

		.basket-icon {
			width: 3rem;
			height: 3rem;
			flex-shrink: 0;
			border-radius: $border-radius;
			border: 1px solid $black;
			padding: 0.5rem;
			transition: all 200ms ease-in-out;

			&:hover {
				transform: scale(1.1);
			}
		}

		&::after {
			transform: translate(-50%, 250%) rotate(-2deg);
			background-color: $white;
		}

		@include mobile-and-tablet {
			&::after {
				transform: translate(-65%, 200%) rotate(-2deg);
			}

			.basket-icon {
				width: 2.5rem;
				height: 2.5rem;
			}
		}
	}

	@keyframes pulse {
		0% {
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			transform: translate(-50%, -50%) scale(1.2);
		}
		100% {
			transform: translate(-50%, -50%) scale(1);
		}
	}
</style>
