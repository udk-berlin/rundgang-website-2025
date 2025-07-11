<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let { onClose }: { onClose: () => void } = $props();

	let topButtonRef: HTMLElement;
	let showBottomButton = $state(false);
	let observer: IntersectionObserver;
	let bottomButtonElement: HTMLElement | null = null;

	onMount(() => {
		if (topButtonRef) {
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						showBottomButton = !entry.isIntersecting;
					});
				},
				{
					threshold: 0,
					rootMargin: '0px'
				}
			);

			observer.observe(topButtonRef);
		}
	});

	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
		if (bottomButtonElement && browser) {
			bottomButtonElement.remove();
		}
	});

	$effect(() => {
		if (browser && showBottomButton && !bottomButtonElement) {
			// Create bottom button and append to body to bypass overlay positioning
			bottomButtonElement = document.createElement('button');
			bottomButtonElement.textContent = 'Close Overlay';
			bottomButtonElement.setAttribute('aria-label', 'Close project overlay');
			bottomButtonElement.addEventListener('click', onClose);

			// Apply inline styles to avoid global CSS
			Object.assign(bottomButtonElement.style, {
				position: 'fixed',
				bottom: '2rem',
				left: '50%',
				transform: 'translateX(-50%)',
				padding: '0.75rem 1.5rem',
				borderRadius: '0.5rem',
				fontSize: '1rem',
				backgroundColor: '#ff69b4',
				color: 'white',
				border: 'none',
				cursor: 'pointer',
				zIndex: '1000',
				fontFamily: 'inherit',
				transition: 'all 0.3s ease-out',
				opacity: '0',
				transformOrigin: 'center bottom'
			});

			// Add hover effect
			bottomButtonElement.addEventListener('mouseenter', () => {
				if (bottomButtonElement) {
					bottomButtonElement.style.backgroundColor = '#ff1493';
				}
			});
			bottomButtonElement.addEventListener('mouseleave', () => {
				if (bottomButtonElement) {
					bottomButtonElement.style.backgroundColor = '#ff69b4';
				}
			});

			document.body.appendChild(bottomButtonElement);

			// Trigger slide up animation
			requestAnimationFrame(() => {
				if (bottomButtonElement) {
					bottomButtonElement.style.opacity = '1';
					bottomButtonElement.style.transform = 'translateX(-50%) translateY(0)';
				}
			});
		} else if (browser && !showBottomButton && bottomButtonElement) {
			bottomButtonElement.remove();
			bottomButtonElement = null;
		}
	});
</script>

<!-- Top close button (icon only, positioned absolutely) -->
<button
	bind:this={topButtonRef}
	class="close-button top-button"
	onclick={onClose}
	aria-label="Close project"
>
	<img
		src="/icons/close-btn/close-11.png"
		alt="Close"
		width="24"
		height="24"
		style="filter: invert(1);"
	/>
</button>

<!-- Bottom button is now created dynamically and appended to body -->

<style lang="scss">
	.close-button {
		background-color: $color_pink;
		color: white;
		border: none;
		cursor: pointer;
		z-index: 1000;

		&:hover {
			background-color: $color_pink;
		}
	}

	.top-button {
		position: absolute;
		top: -2rem;
		right: 0;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;

		img {
			width: 1.5rem;
			height: 1.5rem;
		}
	}
</style>
