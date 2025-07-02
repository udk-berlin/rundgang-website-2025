<script lang="ts">
	import { getUIText } from '$lib/utils/localization';
	import { activeLanguage } from '$lib/stores/language';

	let scrollY: number;

	$: rotation = Math.min(scrollY / 50 - 1.4, 1.4);
	$: translateY = -scrollY / 5;
</script>

<svelte:window bind:scrollY />

<div class="announcement-container" style="--rotation: {rotation}deg; --translateY: {translateY}px">
	<!-- <div class="announcement-container"> -->
	<div class="announcement-content">
		<p>{getUIText('announcement.content', $activeLanguage)}</p>
	</div>
</div>

<style lang="scss">
	.announcement-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.announcement-content {
		width: 80vw;
		background: white;
		border: 1px solid black;
		border-radius: $border-radius;
		box-shadow: $paper-shadow-large;
		transform: translateY(var(--translateY)) rotate(var(--rotation));

		@include desktop {
			width: 25vw;
		}
	}

	p {
		padding: 1rem 2ch;
		font-size: $font-medium;

		@include desktop {
			// font-size: $font-small;
			padding: 2rem 4ch;
		}
	}
</style>
