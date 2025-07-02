<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let text: string;
	export let variant: 'primary' | 'secondary' = 'primary';
	export let mobileOnly: boolean = false;

	const dispatch = createEventDispatcher<{
		click: void;
	}>();

	function handleClick() {
		dispatch('click');
	}
</script>

<button
	class="action-button"
	class:primary={variant === 'primary'}
	class:secondary={variant === 'secondary'}
	class:mobile-only={mobileOnly}
	on:click={handleClick}
>
	{text}
</button>

<style lang="scss">
	.action-button {
		width: 100%;
		padding: 0.5rem;
		border-radius: 4px;
		background: none;
		font-size: 0.75rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid;
	}

	.action-button.primary {
		border-color: $color_pink;
		color: $color_pink;
	}

	.action-button.primary:hover {
		background: $color_pink;
		color: white;
	}

	.action-button.secondary {
		border-color: $color_olive;
		color: $color_olive;
	}

	.action-button.secondary:hover {
		background: $color_olive;
		color: white;
	}

	.action-button.mobile-only {
		@media (max-width: 768px) {
			display: block;
		}

		@media (min-width: 769px) {
			display: none;
		}
	}
</style>
