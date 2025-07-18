<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import OverlayContainer from './OverlayContainer.svelte';

	export let isOpen = false;
	export let horizontal: 'left' | 'center' | 'right' = 'center';
	export let vertical: 'top' | 'center' | 'bottom' = 'center';
	export let height: 'auto' | 'full' = 'full';
	export let staticRotation: number | undefined;
	export let showCloseButton = true;
	export let variant: 'default' | 'full-content' = 'default';

	const dispatch = createEventDispatcher();

	let overlayElement: HTMLDivElement;
	let overlayContainer: OverlayContainer;

	function closeOverlay() {
		overlayContainer?.closeOverlay();
	}

	function handleClose() {
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeOverlay();
		}
	}

	function handleBackdropClick(event: MouseEvent | KeyboardEvent) {
		if (event.target === overlayElement) {
			closeOverlay();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div
		class="overlay {horizontal === 'center' && vertical === 'center'
			? 'center-active'
			: ''} {horizontal === 'left' ? 'left-active' : ''} {variant === 'full-content'
			? 'full-content-variant'
			: ''}"
		bind:this={overlayElement}
		on:click={handleBackdropClick}
		on:keydown={(e) => e.key === 'Enter' && handleBackdropClick(e)}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<OverlayContainer
			{showCloseButton}
			{horizontal}
			{vertical}
			{height}
			{staticRotation}
			{variant}
			bind:this={overlayContainer}
			on:close={handleClose}
		>
			<slot {closeOverlay} />
		</OverlayContainer>
	</div>
{/if}

<style lang="scss">
	.overlay {
		position: fixed;
		bottom: 0;
		top: 0;
		left: 0;
		right: 0;
		margin: auto;
		background-color: rgba($grey, 0.6);
		backdrop-filter: blur(0.3px);
		-webkit-backdrop-filter: blur(0.3px);
		z-index: 101;
		display: block;
		justify-content: center;
		padding-top: 10vh;
		animation: fadeIn 0.3s ease-in-out;

		&.center-active,
		&.left-active {
			overflow-y: auto;
			padding-bottom: 10vh;
		}

		:global(.container.left) ~ & {
			overflow-y: auto;
			padding-bottom: 10vh;
		}

		&.full-content-variant {
			@include desktop {
				overflow-y: auto;
				padding: 2rem 0;
				display: flex;
				align-items: flex-start;
				min-height: 100vh;
			}
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes fadeOut {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}
</style>
