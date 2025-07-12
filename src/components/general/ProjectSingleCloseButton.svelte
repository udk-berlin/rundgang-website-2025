<script lang="ts">
	import { getUIText } from '$lib/utils/localization';
	import { activeLanguage } from '$lib/stores/language';

	let { onClose }: { onClose: () => void } = $props();
</script>

<!-- Close button (sticky positioned, stays 2rem from top) -->
<button
	class="close-button"
	onclick={onClose}
	aria-label={getUIText('projectSingle.close', $activeLanguage)}
>
	<img
		src="/icons/close-btn/close-11.png"
		alt="Close"
		width="24"
		height="24"
		style="filter: invert(1);"
	/>
</button>

<style lang="scss">
	.close-button {
		position: fixed;
		top: -4rem;
		right: 1rem;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background-color: $color_pink;
		color: white;
		border: none;
		cursor: pointer;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: $box-shadow;
		transition: transform 0.2s ease-in-out;

		&:hover {
			transform: scale(1.1);
		}

		@include desktop {
			right: -4rem;
		}

		img {
			width: 1.5rem;
			height: 1.5rem;
		}
	}
</style>
