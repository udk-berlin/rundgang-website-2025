<span class="underlined">
	<slot />
</span>

<style lang="scss">
	.underlined {
		position: relative;
		display: inline-block;
		white-space: nowrap;
		mix-blend-mode: multiply;
	}

	.underlined::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 10px;
		background: url('/highlighting/underline/underline-1.png');
		background-repeat: no-repeat;
		background-size: 100% auto;
	}
</style>
