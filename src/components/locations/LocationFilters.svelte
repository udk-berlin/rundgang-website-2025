<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import PaperContainerTitle from '../general/overlay/PaperContainerTitle.svelte';
	import { activeLanguage } from '$lib/stores/language';
	import { getUIText } from '$lib/utils/localization';
	import type { Project } from '$lib/api';
	import type { EnrichedContextData } from '$lib/api/types/kirby';
	import AccordionList from '../general/accordion/AccordionList.svelte';
	import PaperContainer from '../general/overlay/PaperContainer.svelte';
	import LocationActionButtons from './LocationActionButtons.svelte';
	import { getLocalizedLabel } from '$lib/utils/localization';

	export let locations: Array<{
		id: string;
		name: string;
		street: string;
		postcode: string;
		city: string;
		latitude: string;
		longitude: string;
	}>;
	export let allProjects: Project[];
	export let selectedLocationFilters: string[];

	const dispatch = createEventDispatcher<{
		locationClick: { locationId: string; event: Event };
		showOnMap: { locationId: string; event: Event };
		showProjects: { locationId: string };
		clearFilters: void;
		toggleContexts: void;
	}>();

	// Helper function to check if a location is selected
	function isLocationSelected(locationId: string): boolean {
		return selectedLocationFilters.includes(locationId);
	}

	// Sort locations alphabetically by name for display in filter section
	$: sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));

	function handleLocationClick(locationId: string, event: Event) {
		dispatch('locationClick', { locationId, event });
	}

	function handleShowOnMap(locationId: string, event: Event) {
		dispatch('showOnMap', { locationId, event });
	}

	function handleShowProjects(locationId: string) {
		dispatch('showProjects', { locationId });
	}

	function handleClearFilters() {
		dispatch('clearFilters');
	}

	function handleToggleContexts() {
		dispatch('toggleContexts');
	}
</script>

<PaperContainer staticRotation={-1} padding="0" width="33%" height="100%" vertical="top">
	<div class="filter-content">
		<PaperContainerTitle>{getUIText('locations.title', $activeLanguage)}</PaperContainerTitle>
		<div class="location-filters">
			<AccordionList
				items={sortedLocations}
				showDivider={false}
				textAlign="left"
				contentAlign="left"
				noMargin={true}
				showLocationActions={false}
				showOpenStyling={true}
				on:showOnMap={({ detail }) => handleShowOnMap(detail.locationId, detail.event)}
				on:showProjects={({ detail }) => handleShowProjects(detail.locationId)}
			>
				<!-- Note, if problems arise in the future:
			 Before using the Accordion component, the click handler was attached to <button>, 
			 but then the Accordion would not open.  -->
				<!-- <Accordion
				showDivider={false}
				onclick={() => handleLocationClick(location.id, event)}
				noMargin={true}
			> -->
				<button
					slot="head"
					let:item
					class="location-filter"
					class:selected={isLocationSelected(item.id)}
					on:click={(event) => handleLocationClick(item.id, event)}
				>
					<span class="location-name">{item.name}</span>
					<span class="project-count">
						({allProjects.filter((p) => p.location?.id === item.id).length})
					</span>
				</button>
				<div slot="details" let:item>
					<p>{item.street}</p>
					<p>{item.postcode} {item.city}</p>
					<div class="button-container">
						<LocationActionButtons
							text={getUIText('locations.accordion.showProjects', $activeLanguage)}
							variant="primary"
							on:click={() => handleShowProjects(item.id)}
						/>
						<LocationActionButtons
							text={getUIText('locations.locationActionButtons.showContexts', $activeLanguage)}
							variant="secondary"
							on:click={handleToggleContexts}
						/>
					</div>
				</div>
				<!-- </Accordion> -->
			</AccordionList>
		</div>

		<div class="bottom-buttons">
			{#if selectedLocationFilters.length > 0}
				<button class="clear-all-button" on:click={handleClearFilters}>
					{getUIText('locations.clearSelection', $activeLanguage)}
				</button>
			{/if}
		</div>
	</div>
</PaperContainer>

<style lang="scss">
	.filter-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 2rem 5%;
		padding-left: 0;
		gap: 1rem;
		overflow-y: auto;

		@include desktop {
			padding: 2rem 10%;
		}

		@include mobile-only {
			padding: 1.5rem;
			padding-left: 0;
		}
	}

	.location-filters {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	.location-filter {
		font-size: 0.9rem;
		cursor: pointer;
		padding: 0.25rem 0;
		transition: color 0.15s ease;
		color: #333;
		background: none;
		border: none;
		outline: none;
		width: 100%;
		text-align: left;
	}

	.location-filter:hover {
		color: $color_pink;
	}

	.location-name {
		position: relative;
		font-size: $font-medium;
		font-weight: normal;
		transition: text-decoration 0.15s ease;
		flex: 1;
	}

	.project-count {
		color: $color_olive;
		font-size: $font-size-project-count;
		font-variant-numeric: tabular-nums;
		margin-left: 0.5ch;
	}

	/* Selected state: underlined text */
	.location-filter.selected {
		color: $color_pink;
	}

	.location-filter.selected .location-name {
		font-weight: bold;
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
		margin-top: 0.5rem;
	}

	.clear-all-button:hover {
		background: $color_pink;
		color: white;
	}

	.bottom-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.button-container {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		margin-top: 0.35rem;
	}
</style>
