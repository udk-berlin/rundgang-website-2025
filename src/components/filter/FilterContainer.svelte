<script lang="ts">
	import FilterButton from './FilterButton.svelte';
	import Filter from './Filter.svelte';
	import { filterStore, closeFilter } from '../../lib/stores/filter';

	function handleCloseFilter() {
		closeFilter();
	}
</script>

<FilterButton />

{#if $filterStore.isOpen}
	<Filter isOpen={$filterStore.isOpen} on:close={handleCloseFilter} />
{/if}
