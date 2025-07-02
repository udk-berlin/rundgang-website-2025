<script lang="ts">
	export let seed: number;
	export let scale = 0;
	export let id = '';

	let animatedSeed = seed;
</script>

<!-- Define the filter once in a hidden SVG -->
<svg
	style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; overflow: hidden; visibility: hidden;"
	aria-hidden="true"
>
	<defs>
		<filter {id}>
			<feTurbulence
				type="turbulence"
				baseFrequency="0.05"
				numOctaves="0.500"
				seed={animatedSeed}
				result="turbulence"
			/>
			<feDisplacementMap
				in2="turbulence"
				in="SourceGraphic"
				{scale}
				xChannelSelector="R"
				yChannelSelector="G"
			/>
		</filter>
	</defs>
</svg>
