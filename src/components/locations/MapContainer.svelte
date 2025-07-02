<script lang="ts">
	import { MapLibre, Marker } from 'svelte-maplibre-gl';
	import MapPopup from './MapPopup.svelte';
	import type { Project } from '$lib/api';
	import { filterStore, toggleFilterOption, clearFilterCategory } from '$lib/stores/filter';
	import { createEventDispatcher } from 'svelte';

	import type { LocationData, MapSettings } from '../../routes/locations/+page';

	export let locations: LocationData[];
	export let mapSettings: MapSettings;
	export let selectedLocationFilters: string[];
	export let allProjects: Project[];
	export let openLocationOverlay: (locationId: string) => void;
	export let handleToggleContexts: () => void;

	const dispatch = createEventDispatcher();

	let map: any; // MapLibre component instance
	let hoveredLocationId: string | null = null;

	// Reactive selected location ID
	$: selectedLocationId = selectedLocationFilters.length === 1 ? selectedLocationFilters[0] : null;

	// Bindable center and zoom variables
	export let center: [number, number] = [13.3271929, 52.5096514];
	export let zoom: number = 12;

	// Handle map click (not on markers) to clear all filters
	function handleMapClick() {
		if (selectedLocationFilters.length > 0) {
			clearFilterCategory('locations');
		}
	}

	// Handle location click from marker - select only one location at a time
	function handleMarkerClick(locationId: string, event: Event) {
		// Prevent event bubbling up to map click handler
		event.stopPropagation();

		// If clicking the same location, deselect it
		if (selectedLocationFilters.includes(locationId)) {
			clearFilterCategory('locations');
		} else {
			// Clear all locations and select only the clicked one
			clearFilterCategory('locations');
			toggleFilterOption('locations', locationId);
		}
	}

	// Helper function to check if a location is selected
	function isLocationSelected(locationId: string): boolean {
		return selectedLocationFilters.includes(locationId);
	}

	// Add map click handler when map is ready
	$: if (map && map.loaded && map.loaded()) {
		map.on('click', handleMapClick);
	}

	// Function to update center and zoom with easeTo animation
	function updateMapView(newCenter: [number, number], newZoom: number) {
		if (map && map.loaded && map.loaded()) {
			map.easeTo({
				center: newCenter,
				zoom: newZoom,
				duration: 1000
			});
			// Update bound variables
			center = newCenter;
			zoom = newZoom;
		}
	}

	// Center map on selected location - considers filter selection (single location only)
	$: if (map && map.loaded && map.loaded() && selectedLocationFilters.length > 0) {
		const selectedLocations = locations.filter((loc) => selectedLocationFilters.includes(loc.id));

		// Calculate offset to center in visible map area (accounting for sidebar overlay)
		const calculateOffsetCenter = (originalCenter: [number, number]): [number, number] => {
			return originalCenter;
		};

		if (selectedLocations.length === 1) {
			// Single location - center and zoom in
			const location = selectedLocations[0];
			const originalCenter: [number, number] = [
				parseFloat(location.longitude),
				parseFloat(location.latitude)
			];
			const offsetCenter = calculateOffsetCenter(originalCenter);

			updateMapView(offsetCenter, 14);
		} else if (selectedLocations.length > 1) {
			// Multiple locations - calculate average center
			const avgLng =
				selectedLocations.reduce((sum, loc) => sum + parseFloat(loc.longitude), 0) /
				selectedLocations.length;
			const avgLat =
				selectedLocations.reduce((sum, loc) => sum + parseFloat(loc.latitude), 0) /
				selectedLocations.length;

			const originalCenter: [number, number] = [avgLng, avgLat];
			const offsetCenter = calculateOffsetCenter(originalCenter);

			updateMapView(offsetCenter, 13);
		}
	} else if (map && map.loaded && map.loaded() && selectedLocationFilters.length === 0) {
		// Return to overview when no location is selected
		updateMapView([13.3271929, 52.5096514], 12);
	}
</script>

<!-- Map Container -->
<div class="map-container">
	<MapLibre
		bind:this={map}
		class="map"
		{center}
		{zoom}
		style="https://osm.udk-berlin.de/styles/toner/style.json"
		{...mapSettings}
	>
		{#each locations as location (location.id)}
			{@const lnglat = {
				lng: parseFloat(location.longitude),
				lat: parseFloat(location.latitude)
			}}
			<Marker {lnglat}>
				{#snippet content()}
					<button
						class="marker-wrapper"
						aria-label="Select location {location.name || location.id}"
						on:click={(e) => handleMarkerClick(location.id, e)}
						on:mouseenter={() => (hoveredLocationId = location.id)}
						on:mouseleave={() => (hoveredLocationId = null)}
					>
						<div
							class="location-marker"
							class:selected={isLocationSelected(location.id)}
							class:hovered={hoveredLocationId === location.id}
						></div>
					</button>
				{/snippet}
			</Marker>

			{#if selectedLocationId === location.id}
				<MapPopup
					{lnglat}
					{location}
					{allProjects}
					onShowProjects={openLocationOverlay}
					onToggleContexts={handleToggleContexts}
				/>
			{/if}
		{/each}
	</MapLibre>
</div>

<style lang="scss">
	/* Map Styles */
	.map-container {
		flex: 1;
		height: 100%;
		position: relative;
		clip-path: polygon(
			21% 2%,
			0% 24%,
			0% 48%,
			5% 80%,
			16% 93%,
			31% 98%,
			48% 95%,
			69% 92%,
			85% 93%,
			97% 89%,
			100% 72%,
			100% 46%,
			98% 41%,
			91% 28%,
			73% 11%,
			46% 0%
		);
	}

	:global(.map) {
		height: 100%;
		width: 100%;
	}

	/* Location Dot Markers */
	.location-marker {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: $color_purple;
		border: 2px solid white;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

		&.selected,
		&.hovered {
			background-color: $color_pink;
			transform: scale(1.1);
			box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
		}
	}

	.marker-wrapper {
		width: fit-content;
		height: fit-content;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: transform 0.2s ease;
		background: none;
		border: none;
		padding: 0;

		&:hover {
			transform: scale(1.2);
		}
	}

	.marker-image {
		width: 8rem;
		height: 6rem;
		object-fit: contain;
		transition: opacity 0.2s ease;

		@include mobile-only {
			width: 6rem;
			height: 4rem;
		}
	}

	/* Make sure popup appears above markers */
	:global(.maplibregl-popup) {
		z-index: 2;
		width: fit-content;
		height: fit-content;
	}

	:global(.maplibregl-popup-tip) {
		display: none;
	}

	:global(.maplibregl-popup-content) {
		border-radius: $border-radius;
		border: 1px solid black;
		padding: 0.5rem;
	}
</style>
