<script lang="ts">
	export let scale = 1;
	export let class_ = '';
	import { getLocalizedRundgangDateString } from '$lib/utils/localization';
	import { activeLanguage } from '$lib/stores/language';

	// Define base dimensions that will scale with viewBox
	const baseWidth = 400;
	const baseHeight = 100;
	const titleSize = 80;
	const subtitleSize = 40;
</script>

<div class="logo {class_}" style="--scale: {scale};">
	<svg
		width={baseWidth * scale}
		height={baseHeight * scale}
		viewBox="0 0 {baseWidth} {baseHeight}"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<text
			x={baseWidth * 0.85}
			y={baseHeight * 0.3}
			text-anchor="end"
			class="title"
			style="font-size: {titleSize}px"
		>
			Rundgang
		</text>
		<text
			x={baseWidth * 0.85}
			y={baseHeight * 0.6}
			text-anchor="end"
			class="subtitle"
			style="font-size: {subtitleSize}px"
		>
			{getLocalizedRundgangDateString($activeLanguage)}
		</text>
	</svg>
</div>

<style lang="scss">
	.logo {
		width: fit-content;
		height: fit-content;
	}

	svg {
		display: block;
		overflow: visible;
	}

	:global(svg text) {
		fill: black;
		font-family: inherit;
		font-weight: bold;
	}

	:global(svg .subtitle) {
		transform: translate(106px, 30px);
	}
</style>
