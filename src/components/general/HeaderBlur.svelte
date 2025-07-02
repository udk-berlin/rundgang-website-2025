<div class="header_shadow"></div>
<div class="header_blur">
	<div></div>
	<div></div>
	<div></div>
	<div></div>
	<div></div>
	<div></div>
</div>

<style lang="scss">
	@include mobile-and-tablet {
		.header_blur,
		.header_shadow {
			display: none;
		}
	}

	.header_shadow {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100%;
		background: linear-gradient(180deg, rgba($white, 0.16), transparent);
		pointer-events: none;
	}

	.header_blur {
		position: absolute;
		z-index: 5;
		inset: 0 0 auto 0;
		height: 200%;
		width: 100%;
		pointer-events: none;

		&::before {
			content: '';
			z-index: 1;
			position: absolute;
			inset: 0;
			-webkit-backdrop-filter: blur(0.125px);
			backdrop-filter: blur(0.125px);
			-webkit-mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 0,
				rgba(0, 0, 0, 1) 12.5%,
				rgba(0, 0, 0, 1) 25%,
				rgba(0, 0, 0, 0) 37.5%
			);
			mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 0,
				rgba(0, 0, 0, 1) 12.5%,
				rgba(0, 0, 0, 1) 25%,
				rgba(0, 0, 0, 0) 37.5%
			);
		}

		&:after,
		&:before,
		& > div {
			position: absolute;
			inset: 0;
		}

		& > div:first-of-type {
			z-index: 2;
			-webkit-backdrop-filter: blur(0.5px);
			backdrop-filter: blur(0.5px);
			-webkit-mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 12.5%,
				rgba(0, 0, 0, 1) 25%,
				rgba(0, 0, 0, 1) 37.5%,
				rgba(0, 0, 0, 0) 50%
			);
			mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 12.5%,
				rgba(0, 0, 0, 1) 25%,
				rgba(0, 0, 0, 1) 37.5%,
				rgba(0, 0, 0, 0) 50%
			);
		}
		& > div:nth-of-type(2) {
			z-index: 3;
			-webkit-backdrop-filter: blur(1px);
			backdrop-filter: blur(1px);
			-webkit-mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 25%,
				rgba(0, 0, 0, 1) 37.5%,
				rgba(0, 0, 0, 1) 50%,
				rgba(0, 0, 0, 0) 62.5%
			);
			mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 25%,
				rgba(0, 0, 0, 1) 37.5%,
				rgba(0, 0, 0, 1) 50%,
				rgba(0, 0, 0, 0) 62.5%
			);
		}
		& > div:nth-of-type(3) {
			z-index: 4;
			-webkit-backdrop-filter: blur(1.5px);
			backdrop-filter: blur(1.5px);
			-webkit-mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 37.5%,
				rgba(0, 0, 0, 1) 50%,
				rgba(0, 0, 0, 1) 62.5%,
				rgba(0, 0, 0, 0) 75%
			);
			mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 37.5%,
				rgba(0, 0, 0, 1) 50%,
				rgba(0, 0, 0, 1) 62.5%,
				rgba(0, 0, 0, 0) 75%
			);
		}
		& > div:nth-of-type(4) {
			z-index: 5;
			-webkit-backdrop-filter: blur(2px);
			backdrop-filter: blur(2px);
			-webkit-mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 50%,
				rgba(0, 0, 0, 1) 62.5%,
				rgba(0, 0, 0, 1) 75%,
				rgba(0, 0, 0, 0) 87.5%
			);
			mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 50%,
				rgba(0, 0, 0, 1) 62.5%,
				rgba(0, 0, 0, 1) 75%,
				rgba(0, 0, 0, 0) 87.5%
			);
		}
		& > div:nth-of-type(5) {
			z-index: 6;
			-webkit-backdrop-filter: blur(2.5px);
			backdrop-filter: blur(2.5px);
			-webkit-mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 62.5%,
				rgba(0, 0, 0, 1) 75%,
				rgba(0, 0, 0, 1) 87.5%,
				rgba(0, 0, 0, 0)
			);
			mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 62.5%,
				rgba(0, 0, 0, 1) 75%,
				rgba(0, 0, 0, 1) 87.5%,
				rgba(0, 0, 0, 0)
			);
		}
		& > div:nth-of-type(6) {
			z-index: 7;
			-webkit-backdrop-filter: blur(3px);
			backdrop-filter: blur(3px);
			-webkit-mask: linear-gradient(
				0deg,
				rgba(0, 0, 0, 0) 75%,
				rgba(0, 0, 0, 1) 87.5%,
				rgba(0, 0, 0, 1)
			);
			mask: linear-gradient(0deg, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 1) 87.5%, rgba(0, 0, 0, 1));
		}

		&:after {
			content: '';
			z-index: 8;
			-webkit-backdrop-filter: blur(8px);
			backdrop-filter: blur(8px);
			-webkit-mask: linear-gradient(0deg, rgba(0, 0, 0, 0) 87.5%, rgba(0, 0, 0, 1));
			mask: linear-gradient(0deg, rgba(0, 0, 0, 0) 87.5%, rgba(0, 0, 0, 1));
		}
	}
</style>
