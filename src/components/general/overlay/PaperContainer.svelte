<script lang="ts">
	import { getRandomRotation } from '$lib/utils';

	export let staticRotation: number | undefined = undefined;
	export let padding: string = '2rem';
	export let width: string = 'auto';
	export let height: string = 'auto';
	export let vertical: 'top' | 'bottom' = 'top';
	export let fixed: boolean = true;

	const rotation = staticRotation ?? getRandomRotation();
</script>

<div
	class="paper-container"
	class:top={vertical === 'top'}
	class:bottom={vertical === 'bottom'}
	class:fixed
	style="--rotation: {rotation}deg; --padding: {padding}; --width: {width}; --height: {height};"
>
	<slot />
</div>

<style lang="scss">
	.paper-container {
		position: relative;
		background-color: $white;
		border-radius: $border-radius;
		box-shadow: $paper-shadow-large;
		padding: var(--padding);
		padding-left: 5rem;
		margin-left: -5rem;
		height: var(--height);
		position: relative;
		left: -1rem;
		bottom: -1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		transform: rotate(var(--rotation));
		transition: transform 0.3s ease, width 0.3s ease, height 0.3s ease;
		width: auto;

		&.fixed {
			position: fixed;
		}

		@include desktop {
			width: var(--width);
			border: 1px solid black;
			left: 0;

			&.top {
				top: 15vh;
			}

			&.bottom {
				bottom: 0;
				top: unset;
			}
		}

		@include mobile-only {
			width: auto;
			border: 1px solid black;
		}
	}

	.centered-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
</style>
