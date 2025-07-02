<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { getRandomRotation } from '$lib/utils';
	import {
		press,
		pan,
		scroll,
		composedGesture,
		type GestureCallback,
		type PanCustomEvent
	} from 'svelte-gestures';
	import CloseButton from './CloseButton.svelte';

	let {
		horizontal = 'center',
		vertical = 'center',
		height = 'full',
		staticRotation,
		showCloseButton = true,
		children
	}: {
		horizontal?: 'left' | 'center' | 'right';
		vertical?: 'top' | 'center' | 'bottom';
		height?: 'auto' | 'full';
		staticRotation?: number;
		showCloseButton?: boolean;
		children?: import('svelte').Snippet<[{ closeOverlay: () => void }]>;
	} = $props();

	const dispatch = createEventDispatcher();

	let containerElement: HTMLDivElement;
	let isClosing = $state(false);
	let isAtTop = $state(true);

	const rotation = staticRotation ?? getRandomRotation(-0.75, 0.75);
	const rotation_mobile = staticRotation ?? getRandomRotation(-0.25, 0.25);

	// Calculate animation start positions based on overlay position
	function getAnimationVariables(h: string, v: string) {
		const vars: Record<string, string> = {};

		// Default end state (where animation ends)
		vars['--end-x'] = '0px';
		vars['--end-y'] = '0px';
		vars['--end-rotation'] = 'var(--rotation)';

		// Calculate start state based on position
		if (h === 'left') {
			vars['--start-x'] = '-100vw';
			vars['--start-y'] = '100vh';
			vars['--start-rotation'] = '-2deg';
		} else if (h === 'right') {
			vars['--start-x'] = '100vw';
			vars['--start-y'] = '-100vh';
			vars['--start-rotation'] = '-2deg';
		} else if (h === 'center') {
			vars['--start-x'] = '0px';
			if (v === 'top') {
				vars['--start-y'] = '-100vh';
			} else if (v === 'bottom') {
				vars['--start-y'] = '100vh';
			} else {
				vars['--start-y'] = '100vh';
			}
			vars['--start-rotation'] = '0deg';
		}

		return vars;
	}

	const animationVars = $derived(getAnimationVariables(horizontal, vertical));

	export function closeOverlay() {
		if (isClosing) return;
		isClosing = true;
		containerElement?.classList.add('slide-out');

		setTimeout(() => {
			isClosing = false;
			dispatch('close');
		}, 300);
	}

	function handleScroll() {
		if (containerElement) {
			isAtTop = containerElement.scrollTop <= 10;
		}
	}

	const scrollPan: GestureCallback = (register) => {
		const pressFns = register(press, {
			triggerBeforeFinished: true,
			spread: 10,
			timeframe: 100
		});
		const scrollFns = register(scroll, { delay: 0 });
		const panFns = register(pan, { delay: 0 });

		return (activeEvents: PointerEvent[], event: PointerEvent) => {
			pressFns.onMove(activeEvents, event) || event.pointerType !== 'touch'
				? panFns.onMove(activeEvents, event)
				: scrollFns.onMove(activeEvents, event);
		};
	};

	function handlePan(event: PanCustomEvent) {
		const { x, y } = event.detail;

		// Only handle pan gestures when at top of container
		if (!isAtTop) return;

		// Check for downward pan gesture to close overlay
		if (Math.abs(y) > Math.abs(x) && y > 50) {
			if (horizontal === 'center') {
				closeOverlay();
			}
		}

		// Handle horizontal pan gestures for left/right overlays
		if (Math.abs(x) > Math.abs(y)) {
			if (horizontal === 'left' && x < -50) {
				closeOverlay();
			} else if (horizontal === 'right' && x > 50) {
				closeOverlay();
			}
		}

		// Handle vertical pan gestures for top/bottom overlays
		if (Math.abs(y) > Math.abs(x)) {
			if (vertical === 'top' && y < -50) {
				closeOverlay();
			} else if (vertical === 'bottom' && y > 50) {
				closeOverlay();
			}
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="container"
	class:center={horizontal === 'center' && vertical === 'center'}
	class:left={horizontal === 'left'}
	class:right={horizontal === 'right'}
	class:top={vertical === 'top'}
	class:bottom={vertical === 'bottom'}
	class:height-auto={height === 'auto'}
	class:height-full={height === 'full'}
	class:slide-out={isClosing}
	style="--rotation: {rotation}deg; --rotation-mobile: {rotation_mobile}deg; {Object.entries(
		animationVars
	)
		.map(([key, value]) => `${key}: ${value}`)
		.join('; ')}"
	bind:this={containerElement}
>
	{#if showCloseButton}
		<!-- Position on left hand side when overlay comes from the right. For center and left, close button is right. -->
		<CloseButton onClick={closeOverlay} position={horizontal === 'right' ? 'left' : 'right'} />
	{/if}

	{@render children?.({ closeOverlay })}
</div>

<style lang="scss">
	.container {
		background-color: $white;
		border-radius: $border-radius;
		position: relative;
		box-shadow: $box-shadow;
		transform: rotate(var(--rotation));
		bottom: -3vh;
		animation: slideIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
		will-change: transform, opacity;

		&.center {
			width: 75vw;
			height: auto;
			min-height: 90vh;
			@include margin-h(auto);
			// animation: slideIn 250ms ease-out;
			border: 1px solid $black;
			border-radius: $border-radius;
		}

		&.left {
			width: 40vw;
			left: 0;
			right: unset;
			max-width: 500px;
			height: 90vh;
			margin-left: 2rem;
			margin-right: auto;
			padding-left: 5vw;
			margin-left: -5vw;
			// animation: slideIn 250ms ease-out;
			border: 1px solid $black;
			border-radius: $border-radius;
		}

		&.right {
			display: flex;
			transform: rotate(var(--rotation));
			top: -14vh;
			left: unset;
			right: 0;
			width: 35vw;
			height: auto;
			min-height: 20vh;
			max-height: 90vh;
			margin-left: auto;
			margin-right: -5vw;
			padding-right: 5vw;
			overflow-y: auto;
			// animation: slideIn 250ms ease-out;
			border: 1px solid $black;
			border-radius: $border-radius;

			@include mobile-and-tablet {
				justify-content: flex-end;
				padding-right: 2rem;
			}
		}

		&.slide-out {
			animation: slideOut 0.2s ease-in-out forwards;
		}

		&.top {
			position: fixed;
			top: 2rem;
			transform: translateX(0) rotate(var(--rotation));
			width: 60vw;
			max-width: 600px;
			height: auto;
			// animation: slideIn 250ms ease-out;
			border: 1px solid $black;
			border-radius: $border-radius;
		}

		&.bottom {
			position: fixed;
			top: unset;
			bottom: 2rem;
			transform: translateX(0) rotate(var(--rotation));
			width: 60vw;
			max-width: 600px;
			height: auto;
			// animation: slideIn 250ms ease-out;
			border: 1px solid $black;
			border-radius: $border-radius;
		}

		&.height-auto {
			height: auto;
			max-height: 90vh;
		}

		&.height-full {
			height: 90vh;
		}
	}

	@include mobile-and-tablet {
		.container {
			transform: rotate(var(--rotation-mobile));
			&.center {
				width: 100%;
				height: auto;
				min-height: 85vh;
			}

			&.left,
			&.right {
				width: 80vw;
			}

			&.left {
				margin-left: -5vw;
			}

			&.right {
				height: 85vh;
				margin-right: -5vw;
			}

			&.top,
			&.bottom {
				width: 90vw;
				position: fixed;
				left: 50%;
				transform: translateX(0) rotate(var(--rotation-mobile));
			}

			&.top {
				top: 1rem;
			}

			&.bottom {
				bottom: 1rem;
			}

			&.height-auto {
				height: auto;
				max-height: 85vh;
			}

			&.height-full {
				// height: 85vh;
				height: fit-content;
			}
		}
	}

	@keyframes slideIn {
		from {
			transform: translateX(var(--start-x)) translateY(var(--start-y)) rotate(var(--start-rotation));
			opacity: 0;
		}
		to {
			transform: translateX(var(--end-x)) translateY(var(--end-y)) rotate(var(--end-rotation));
			opacity: 1;
		}
	}

	@keyframes slideOut {
		from {
			transform: translateX(var(--end-x)) translateY(var(--end-y)) rotate(var(--end-rotation));
			opacity: 1;
		}
		to {
			transform: translateX(var(--start-x)) translateY(var(--start-y)) rotate(var(--start-rotation));
			opacity: 0;
		}
	}
</style>
