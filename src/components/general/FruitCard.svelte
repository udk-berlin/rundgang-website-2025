<script lang="ts">
	import { onMount } from 'svelte';
	import { intersectionManager } from '$lib/utils/intersectionObserver';

	export let animation: 'scroll' | 'click' | 'none' = 'scroll';

	let videoElement: HTMLVideoElement;
	let videoContainer: HTMLDivElement;
	let clickFrame = 1;
	let currentTime = 1;

	function handleClick() {
		if (animation === 'click' && videoElement) {
			clickFrame = clickFrame >= 15 ? 1 : clickFrame + 2;
			currentTime = clickFrame;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}

	onMount(() => {
		currentTime = 1; // Start at frame 1

		if (animation === 'scroll') {
			const handleIntersection = (entry: IntersectionObserverEntry) => {
				if (!videoElement) return;

				const boundingRect = entry.boundingClientRect;
				const viewportHeight = window.innerHeight;

				// Calculate normalized position: 0 when element bottom enters viewport, 1 when element top reaches viewport top
				const elementHeight = boundingRect.height;
				const totalDistance = viewportHeight + elementHeight;
				const currentPosition = viewportHeight - boundingRect.top;
				const normalizedPosition = Math.max(0, Math.min(1, currentPosition / totalDistance));

				// Map position to currentTime 1-15s
				currentTime = 1 + normalizedPosition * 14;
			};

			intersectionManager.registerElement(videoContainer, handleIntersection);

			// Cleanup function
			return () => {
				intersectionManager.unregisterElement(videoContainer);
			};
		}
	});

	const fruit = ['birne', 'fenchel', 'moehre'];
	const random_fruit = fruit[Math.floor(Math.random() * fruit.length)];
</script>

{#if animation === 'click'}
	<div
		class="video-item clickable"
		bind:this={videoContainer}
		on:click={handleClick}
		on:keydown={handleKeydown}
		role="button"
		tabindex="0"
	>
		<video bind:this={videoElement} bind:currentTime muted loop playsinline preload="metadata">
			<source type="video/mp4" src="/illustration/{random_fruit}.mp4" />
			<source src="/illustration/{random_fruit}_1x.webm" type="video/webm" />
		</video>
	</div>
{:else}
	<div class="video-item" bind:this={videoContainer}>
		<video bind:this={videoElement} bind:currentTime muted loop playsinline preload="metadata">
			<source type="video/mp4" src="/illustration/{random_fruit}.mp4" />
			<source src="/illustration/{random_fruit}_1x.webm" type="video/webm" />
		</video>
	</div>
{/if}

<style lang="scss">
	.clickable {
		cursor: pointer;
	}
</style>
