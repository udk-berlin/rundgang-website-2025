<script lang="ts">
	export let seed: number;
	export let scale = 1;
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 100 100"
	preserveAspectRatio="none"
	style="--scale: {scale}px"
>
	<rect
		x={scale}
		y={scale}
		width={100 - scale * 2}
		height={100 - scale * 2}
		rx="1.5"
		ry="1.5"
		filter="url(#scribble-border-{seed})"
		vector-effect="non-scaling-stroke"
		stroke-width="2px"
	/>
</svg>

<style lang="scss">
	svg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: calc(100% + var(--scale) * 2);
		height: calc(100% + var(--scale) * 2);
		z-index: 100;
		fill: transparent;
		stroke: $black;
		stroke-width: 0.3px;
		pointer-events: none;
	}
</style>
