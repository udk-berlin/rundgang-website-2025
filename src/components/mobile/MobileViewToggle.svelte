<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface $$Props {
		titles?: {
			left: string;
			right: string;
		};
		leftPanelRatio?: number;
		children?: Snippet;
		left?: Snippet;
		right?: Snippet;
		// New prop to control rendering strategy
		initialView?: 'left' | 'right';
	}

	export let titles = {
		left: 'Left',
		right: 'Right'
	};
	export let leftPanelRatio = 0.5; // Default to 50/50 split, can be 0.33 for 1/3, 0.67 for 2/3, etc.
	export let initialView = 'left'; // 'left' or 'right'

	let currentView = initialView; // 'left' or 'right'
	let isMobile = false;
	let isTransitioning = false;

	// Export methods to control the view
	export function setLeftPanel() {
		if (currentView !== 'left') {
			isTransitioning = true;
			currentView = 'left';
			// Reset transition state after animation completes
			setTimeout(() => {
				isTransitioning = false;
			}, 300);
		}
	}

	export function setRightPanel() {
		if (currentView !== 'right') {
			isTransitioning = true;
			currentView = 'right';
			// Reset transition state after animation completes
			setTimeout(() => {
				isTransitioning = false;
			}, 300);
		}
	}

	export function toggleView() {
		isTransitioning = true;
		currentView = currentView === 'left' ? 'right' : 'left';
		// Reset transition state after animation completes
		setTimeout(() => {
			isTransitioning = false;
		}, 300);
	}

	// Check if we're on mobile
	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 768; // Adjust breakpoint as needed
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

	// Calculate flex values for desktop layout
	$: leftFlexValue = leftPanelRatio;
	$: rightFlexValue = 1 - leftPanelRatio;
</script>

<div class="view-container" style="--left-flex: {leftFlexValue}; --right-flex: {rightFlexValue};">
	{#if isMobile}
		<div class="mobile-views">
			<!-- Left panel -->
			<div
				class="view-panel left-panel"
				class:active={currentView === 'left'}
				style="transform: translateX({currentView === 'left' ? '0' : '-95vw'})"
			>
				<slot name="left" />
			</div>

			<!-- Right panel -->
			<div
				class="view-panel right-panel"
				class:active={currentView === 'right'}
				style="transform: translateX({currentView === 'right' ? '0' : '10vw'})"
			>
				<slot name="right" />
			</div>
		</div>

		<!-- Mobile toggle button with two sides -->
		<div class="toggle-button">
			<button
				class="toggle-side left-side"
				class:active={currentView === 'left'}
				on:click={() => (currentView = 'left')}
			>
				{titles.left}
			</button>
			<button
				class="toggle-side right-side"
				class:active={currentView === 'right'}
				on:click={() => (currentView = 'right')}
			>
				{titles.right}
			</button>
		</div>
	{:else}
		<!-- Desktop: Side by side flex layout -->
		<div class="desktop-views">
			<div class="view-panel left-panel">
				<slot name="left" />
			</div>
			<div class="view-panel right-panel">
				<slot name="right" />
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.view-container {
		position: relative;
		height: 100vh;

		@include mobile-and-tablet {
			overflow: hidden;
		}
	}

	/* Mobile styles */
	.mobile-views {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.view-panel {
		width: 100%;
		height: 100%;
	}

	.mobile-views .view-panel {
		position: absolute;
		top: 0;
		left: 0;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		/* Smooth transitions for translateX panels */
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		/* Optimize for transforms */
		will-change: transform;
		backface-visibility: hidden;
	}

	.mobile-views .view-panel.active {
		z-index: 1;
	}

	/* Performance optimizations for translateX panels */
	.mobile-views .view-panel:not(.active) {
		/* Hide content when off-screen to improve performance */
		pointer-events: none;
	}

	/* Desktop styles */
	.desktop-views {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		height: 100%;
	}

	.left-panel {
		z-index: 2; // Render above right panel
	}

	.desktop-views .left-panel {
		flex: var(--left-flex);
	}

	.desktop-views .right-panel {
		flex: var(--right-flex);
	}

	/* Toggle button container */
	.toggle-button {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;

		display: flex;
		background: rgba(0, 0, 0, 0.8);
		border-radius: 25px;
		padding: 4px;

		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);

		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	/* Individual toggle sides */
	.toggle-side {
		background: transparent;
		color: white;
		border: none;
		border-radius: 20px;
		padding: 8px 16px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		min-width: 60px;
	}

	/* Active state */
	.toggle-side.active {
		background: rgba(255, 255, 255, 0.9);
		color: rgba(0, 0, 0, 0.8);
	}

	/* Inactive state with inner shadow */
	.toggle-side:not(.active) {
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	/* Hover effects */
	.toggle-side:not(.active):hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.toggle-side.active:hover {
		background: rgba(255, 255, 255, 1);
		color: rgba(0, 0, 0, 0.9);
	}

	/* Hide toggle button on desktop */
	@media (min-width: 768px) {
		.toggle-button {
			display: none;
		}
	}

	/* Ensure proper mobile viewport */
	@media (max-width: 767px) {
		.view-container {
			width: 100vw;
		}

		.mobile-views .view-panel {
			width: 100vw;
		}
	}
</style>
