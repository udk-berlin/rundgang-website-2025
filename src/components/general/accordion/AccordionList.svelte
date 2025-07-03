<script lang="ts">
	import Accordion from './Accordion.svelte';

	export let items: any[] = [];
	export let showDivider: boolean = true;
	export let showDividerTop: boolean = false;
	export let textAlign: 'left' | 'right' = 'left';
	export let contentAlign: 'left' | 'right' = 'left';
	export let noMargin: boolean = false;
	export let showLocationActions: boolean = false;
	export let showOpenStyling: boolean = false;

	let openItemId: string | null = null;

	function handleItemToggle(itemId: string) {
		openItemId = openItemId === itemId ? null : itemId;
	}
</script>

<div class="accordion-list">
	{#each items as item}
		<Accordion
			open={openItemId === item.id}
			{showDivider}
			{showDividerTop}
			{textAlign}
			{contentAlign}
			{noMargin}
			{item}
			{showLocationActions}
			{showOpenStyling}
			onclick={() => handleItemToggle(item.id)}
			on:locationClick
			on:showOnMap
			on:showProjects
		>
			<div slot="head">
				<slot name="head" {item}></slot>
			</div>
			<div slot="details">
				<slot name="details" {item}></slot>
			</div>
		</Accordion>
	{/each}
</div>

<style>
	.accordion-list {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
</style>
