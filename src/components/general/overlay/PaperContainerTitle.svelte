<h3><slot /></h3>

<style lang="scss">
	h3 {
		margin: 0 0 3rem 0;
		font-size: $font-large;
		font-weight: normal;
		color: rgba($black, 0.8);
		line-height: 1.2;

		@include desktop {
			font-weight: bold;
			font-size: $font-xlarge;
		}
	}
</style>
