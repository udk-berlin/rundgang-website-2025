<script lang="ts">
	import { onMount } from 'svelte';

	export let onClick: () => void;
	export let description: string = 'Close';
	export let position: 'left' | 'right' = 'right';

	let icon: number = 3; // default to 3
	const close_indices = [3, 4, 5, 9, 10];

	onMount(() => {
		icon = close_indices[Math.floor(Math.random() * close_indices.length)];
	});

	function handleClick() {
		onClick();
	}
</script>

<button class="close-btn {position}" on:click={handleClick} aria-label={description} type="button">
	<img src="/icons/close-btn/close-{icon}.png" alt="Close" class="close-icon" />
</button>

<style lang="scss">
	.close-btn {
		position: absolute;
		top: $overlay-padding;
		// background: none;
		background-color: $white;
		border: none;
		cursor: pointer;
		z-index: 10;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: $border-radius;
		transition: all 0.2s ease;
		padding: 0.5rem;

		&.left {
			left: $overlay-padding;
		}

		&.right {
			right: $overlay-padding;
		}

		&:hover {
			transform: scale(1.1);
			// background-color: rgba(0, 0, 0, 0.02);
		}

		&:hover .close-icon {
			filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
		}
	}

	.close-icon {
		width: 100%;
		height: 100%;
		transition: filter 0.2s ease;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
	}
</style>
