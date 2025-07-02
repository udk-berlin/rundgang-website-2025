<!-- 
Die Animation funktioniert über den strokeDasharray und strokeDashoffset.

strokeDasharray definiert die Länge der Striche. (0.2 0.8) heisst 20% gefüllt, 80% leer.
strokeDashoffset ist animierbar.
-->

<script lang="ts">
	import { paths } from './paths.js';
	import { onMount } from 'svelte';

	let currentPath = paths[0];

	onMount(() => {
		shufflePath();
	});

	function shufflePath() {
		currentPath = paths[Math.floor(Math.random() * paths.length)];
	}

	function onAnimationEnd() {
		shufflePath();
	}
</script>

<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
	<!-- <ScribbleFilter {seed} {scale} /> -->
	<path
		d={currentPath}
		on:animationend={onAnimationEnd}
		pathLength="1"
		filter="url(#scribble-animation)"
	/>
</svg>

<style lang="scss">
	:global(.scribble-container) {
		position: relative;
	}

	svg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		z-index: 100;
		fill: transparent;
		stroke: $black;
		mix-blend-mode: luminosity;
		pointer-events: none;
	}

	path {
		stroke-dasharray: 0.2 0.8;
		stroke-dashoffset: 1;
		opacity: 0;
		stroke-width: 0.7px;
		stroke: black;
	}

	:global(.scribble-container:hover path) {
		animation: dash 1000ms ease-in-out;
	}

	@keyframes dash {
		0% {
			opacity: 0;
			stroke-dashoffset: -0.2;
		}
		99% {
			opacity: 1;
			stroke-dashoffset: 1;
		}
		100% {
			opacity: 0;
			stroke-dashoffset: 0;
		}
	}
</style>
