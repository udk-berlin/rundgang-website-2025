<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { activeLanguage } from '$lib/stores/language';
	import { getUIText } from '$lib/utils/localization';
	import Overlay from '../general/overlay/Overlay.svelte';
	import { closeFilter, filterStore, toggleFilterOption } from '$lib/stores/filter';

	export let isOpen = false;

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	function closeOverlay() {
		closeFilter();
		dispatch('close');
	}

	function handleFilterChange(category: string, value: string) {
		// Store faculty selections under 'contexts' since faculties are a type of context
		const filterCategory = category === 'faculties' ? 'contexts' : category;
		toggleFilterOption(filterCategory, value);
	}

	function clearAllFilters() {
		Object.keys($filterStore.selectedFilters).forEach((category) => {
			$filterStore.selectedFilters[category] = [];
		});
	}

	function isOptionSelected(category: string, value: string): boolean {
		// Check faculty selections under 'contexts' since that's where we store them
		const filterCategory = category === 'faculties' ? 'contexts' : category;
		return $filterStore.selectedFilters[filterCategory]?.includes(value) || false;
	}

	$: hasActiveFilters = Object.values($filterStore.selectedFilters).some(
		(filters) => filters.length > 0
	);

	$: filteredGroups = (() => {
		const { contexts, formats, locations } = $filterStore.data;
		return [...contexts, ...formats, ...locations];
	})();
</script>

<Overlay
	{isOpen}
	horizontal="left"
	vertical="center"
	height="full"
	staticRotation={2}
	on:close={closeOverlay}
>
	<div class="content">
		<div class="header">
			<h1>{getUIText('filter.title', $activeLanguage)}</h1>
			{#if hasActiveFilters}
				<button class="clear-all-button" on:click={clearAllFilters}>
					{getUIText('filter.clearSelection', $activeLanguage) || 'Clear all'}
				</button>
			{/if}
		</div>

		{#if $filterStore.isLoading}
			<div class="loading">{getUIText('filter.loading', $activeLanguage)}</div>
		{:else if filteredGroups.length === 0}
			<div class="no-filters">{getUIText('filter.noFilters', $activeLanguage)}</div>
		{:else}
			<!-- Regular filters for other pages -->
			<div class="filter-options">
				{#each filteredGroups as group}
					<div class="filter-group">
						<h3>{group.title}</h3>
						{#each group.options as option}
							{#if option.projectCount && option.projectCount > 0}
								<label class:selected={isOptionSelected(group.title.toLowerCase(), option.value)}>
									<input
										type="checkbox"
										checked={isOptionSelected(group.title.toLowerCase(), option.value)}
										on:change={() => handleFilterChange(group.title.toLowerCase(), option.value)}
									/>
									<span class="filter-text">{option.label}</span>
									<span class="dots"></span>
									{#if option.projectCount && option.projectCount > 0}
										<span class="filter-count">({option.projectCount})</span>
									{/if}
								</label>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Overlay>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 2rem;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 2rem;
		margin: 0 0 1.5rem 0;
	}

	h1 {
		margin: 0;
		font-size: $font-xlarge;
		font-weight: 400;
	}

	.clear-all-button {
		background: none;
		border: 1px solid $color_pink;
		border-radius: 4px;
		padding: 0.5rem 1rem;
		color: $color_pink;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s ease;
		margin-right: 2rem;
	}

	.clear-all-button:hover {
		background: $color_pink;
		color: white;
	}

	.loading,
	.no-filters {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		color: rgba($black, 0.6);
		font-size: $font-medium;
	}

	.filter-options {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	:global(.filter-group) {
		display: flex;
		flex-direction: column;
		gap: 0;

		:global(label) {
			display: flex;
			align-items: baseline;
			font-size: $font-medium;
			cursor: pointer;
			padding-bottom: 0.05rem;
			transition: color 0.15s ease;

			&:hover {
				color: $color_pink;
			}

			.filter-text {
				position: relative;
				transition: text-decoration 0.15s ease;
			}

			.filter-count {
				color: $color_olive;
				font-size: $font-size-project-count;
				margin-left: 2ch;
				font-variant-numeric: tabular-nums;
			}

			// Selected state: underlined text
			&.selected {
				.filter-text {
					text-decoration: underline;
					text-decoration-color: $color_pink;
					text-decoration-thickness: 1.5px;
					text-underline-offset: 2px;
				}
			}
		}
	}

	@include mobile-and-tablet {
		.content {
			padding: 1.5rem;
		}

		h1 {
			font-size: $font-large;
			margin-bottom: 1rem;
		}

		.clear-all-button {
			align-self: flex-start;
		}

		.loading,
		.no-filters {
			font-size: $font-small;
		}

		.filter-options {
			gap: 1rem;
		}
	}
</style>
