<script lang="ts">
	import { toggleFilter } from '$lib/stores/filter';

	function handleClick() {
		toggleFilter();
	}
</script>

<button class="filter-button" on:click={handleClick} aria-label="Toggle filter">
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M3 4.5H21V6H3V4.5ZM6 10.5H18V12H6V10.5ZM9 16.5H15V18H9V16.5Z" fill="currentColor" />
	</svg>
	<span>Filter</span>
</button>

<style lang="scss">
	.filter-button {
		position: fixed;
		bottom: 2rem;
		left: 2rem;
		z-index: 98;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background-color: $white;
		border: 1px solid $black;
		border-radius: $border-radius;
		box-shadow: $box-shadow;
		font-size: $font-medium;
		cursor: pointer;
		transition: all 0.2s ease;
		transform: rotate(1deg);

		&:hover {
			background-color: $color_pink;
			color: $white;
			transform: rotate(1deg) translateY(-2px);
			box-shadow: 0 4px 12px rgba($black, 0.15);
		}

		&:active {
			transform: rotate(1deg) translateY(0);
		}

		svg {
			width: 16px;
			height: 16px;
		}

		span {
			font-weight: 400;
			text-transform: uppercase;
			font-size: $font-small;
			letter-spacing: 0.5px;
		}
	}

	@include mobile-and-tablet {
		.filter-button {
			bottom: 1rem;
			left: 1rem;
			padding: 0.5rem 0.75rem;

			span {
				display: none;
			}

			svg {
				width: 18px;
				height: 18px;
			}
		}
	}
</style>
