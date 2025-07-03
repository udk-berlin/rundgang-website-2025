<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import { getUIText } from '$lib/utils/localization';
	import { activeLanguage } from '$lib/stores/language';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let open = false;
	export let showDivider = true;
	export let showDividerTop = false;
	export let textAlign = 'left'; // 'left' or 'right'
	export let contentAlign = 'left'; // 'left' or 'right'
	export let noMargin = false;
	export let onclick = () => {};
	export let item = undefined; // The item/location data for this accordion
	export let showLocationActions = false; // Show "Show on Map" and "Show Projects" buttons
	export let showOpenStyling = false; // Show pink border and padding when open
	let targetElement: HTMLElement | undefined;

	const handleClick = () => {
		open = !open;
		onclick();
		scrollToElement();
	};

	const scrollToElement = () => {
		setTimeout(() => {
			if (targetElement) {
				const rect = targetElement.getBoundingClientRect();
				const offsetTop = window.pageYOffset + rect.top - 150; // 150px padding
				window.scrollTo({
					top: offsetTop,
					behavior: 'smooth'
				});
			}
		}, 300); // 300ms delay to wait for accordion open and close transitions
	};

	const handleShowOnMap = () => {
		if (item && item.id) {
			dispatch('showOnMap', { locationId: item.id, event: new Event('click') });
		}
	};

	const handleShowProjects = () => {
		if (item && item.id) {
			dispatch('showProjects', { locationId: item.id });
		}
	};
</script>

<div
	bind:this={targetElement}
	class="accordion {open ? 'open' : 'closed'}"
	class:open={open && showOpenStyling}
	class:no-margin={noMargin}
>
	<div class="header" class:text-right={textAlign === 'right'}>
		<button class="text" class:text-right={textAlign === 'right'} on:click={handleClick}>
			<slot name="head"></slot>
			<span>
				{open ? '-' : '+'}
			</span>
		</button>
	</div>

	{#if showDividerTop}
		<svg
			class="divider"
			xmlns="http://www.w3.org/2000/svg"
			width="100%"
			height="5"
			viewBox="0 0 100 5"
			preserveAspectRatio="none"
		>
			<line
				x1="0"
				y1="2.5"
				x2="100"
				y2="2.5"
				stroke="#000"
				stroke-width="2px"
				vector-effect="non-scaling-stroke"
				filter="url(#scribble-animation)"
			/>
		</svg>
	{/if}

	{#if open}
		<div
			class="details"
			class:content-right={contentAlign === 'right'}
			in:slide={{ duration: 200 }}
			out:slide={{ duration: 200 }}
		>
			<slot name="details"></slot>
			{#if showLocationActions}
				<div class="map-button-container">
					<button class="map-button show-on-map" on:click={handleShowOnMap}
						>{getUIText('locations.accordion.showOnMap', $activeLanguage)}</button
					>
					<button class="map-button" on:click={handleShowProjects}
						>{getUIText('locations.accordion.showProjects', $activeLanguage)}</button
					>
				</div>
			{/if}
		</div>
	{/if}
	{#if showDivider}
		<svg
			class="divider"
			xmlns="http://www.w3.org/2000/svg"
			width="100%"
			height="5"
			viewBox="0 0 100 5"
			preserveAspectRatio="none"
		>
			<line
				x1="0"
				y1="2.5"
				x2="100"
				y2="2.5"
				stroke="#000"
				stroke-width="2px"
				vector-effect="non-scaling-stroke"
				filter="url(#scribble-animation)"
			/>
		</svg>
	{/if}
</div>

<style lang="scss">
	.accordion {
		margin-bottom: 0.7em;
		@include margin-h(0);

		&.no-margin {
			margin-bottom: 0;
		}
	}

	.header {
		display: flex;
		width: 100%;
		flex-flow: row nowrap;

		&.text-right button {
			flex-direction: row-reverse;
		}
	}

	.header .text {
		flex: 1;
		margin-right: 5px;
	}

	.header button {
		display: flex;
		justify-content: space-between;
		background: none;
		border: none;
		cursor: pointer;
	}

	.details {
		@include padding-h(0);
		@include padding-v(1rem);

		.no-margin & {
			padding-top: 0;
		}

		.map-button-container {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			margin-top: 1rem;
		}
		.map-button {
			margin-top: 0.5rem;
			width: 100%;
			padding: 0.5rem;
			border: 1px solid $color_pink;
			border-radius: $border-radius;
			background: none;
			color: $color_pink;
			font-size: small;
			font-weight: bold;
			cursor: pointer;
			transition: all 0.2s ease;

			&:hover {
				background: $color_pink;
				color: white;
			}
		}

		.accordion.open & {
			border-left: 2px solid $color_pink;
			padding: 0.5rem 2rem 1rem 1rem;
		}

		.map-button.show-on-map {
			@include mobile-only {
				display: block;
			}

			@include desktop {
				display: none;
			}
		}
	}

	.divider {
		margin-top: 0.5rem;
	}

	button.text-right {
		text-align: right;
	}

	button > span {
		margin-left: 1ch;
	}

	.content-right {
		text-align: right;
	}

	span {
		font-size: 1.5em;
		font-weight: normal;
	}
</style>
