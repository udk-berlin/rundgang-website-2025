<script>
	export let isMenuOpen = false;
	export let toggleMenu = () => {};
</script>

<button
	class="nav__toggle"
	class:is-open={isMenuOpen}
	type="button"
	aria-controls="nav__menu"
	aria-expanded={isMenuOpen}
	on:click={toggleMenu}
>
	<span class="visually-hidden">Menu</span>
	<span class="nav__burger" aria-hidden="true">
		<span class="line line-1"></span>
		<span class="line line-2"></span>
		<span class="line line-3"></span>
	</span>
</button>

<style lang="scss">
	button {
		display: block;
		position: fixed;
		top: $body-padding-h-mobile;
		right: $body-padding-h-mobile;
		z-index: 1001;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;

		@include desktop {
			display: none;
		}
	}

	.nav__burger {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 24px;
		height: 18px;
		position: relative;
	}

	.line {
		display: block;
		height: 2px;
		width: 100%;
		background-color: currentColor;
		border-radius: 1px;
		transition: all 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6);
		transform-origin: center;
		position: absolute;
	}

	.line-1 {
		top: 0;
	}

	.line-2 {
		top: 50%;
		transform: translateY(-50%);
	}

	.line-3 {
		bottom: 0;
	}

	// When menu is open, transform into X
	.is-open {
		.line-1 {
			top: 50%;
			transform: translateY(-50%) rotate(45deg);
		}

		.line-2 {
			opacity: 0;
			transform: translateY(-50%) scale(0);
		}

		.line-3 {
			bottom: 50%;
			transform: translateY(50%) rotate(-45deg);
		}
	}
</style>
