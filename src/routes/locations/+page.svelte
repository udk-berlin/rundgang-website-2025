<script lang="ts">
	import { goto } from '$app/navigation';
	import ProjectContainer from '../../components/general/ProjectContainer.svelte';
	import PaperContainer from '../../components/general/overlay/PaperContainer.svelte';
	import PaperContainerTitle from '../../components/general/overlay/PaperContainerTitle.svelte';
	import type { Project } from '$lib/api';
	import { activeLanguage } from '$lib/stores/language';
	import { filterStore, toggleFilterOption, clearFilterCategory } from '$lib/stores/filter';
	import { getUIText } from '$lib/utils/localization';

	import type { EnrichedContextData } from '$lib/api/types/kirby';
	import type { LocationData, MapSettings, MarkerConfig } from './+page';

	// Data from load function - now includes static configuration
	export let data: {
		allProjects: Project[];
		locations: LocationData[];
		sortedLocations: LocationData[];
		mapSettings: MapSettings;
		markerConfig: MarkerConfig;
		markerImages: Record<string, { base: string; selected: string }>;
		language: 'DE' | 'EN';
		error?: string;
	};
	import MobileViewToggle from '../../components/mobile/MobileViewToggle.svelte';
	import LocationFilters from '../../components/locations/LocationFilters.svelte';
	import LocationContexts from '../../components/locations/LocationContexts.svelte';
	import MapContainer from '../../components/locations/MapContainer.svelte';
	import Overlay from '../../components/general/overlay/Overlay.svelte';

	// Extract static data from load function (moved from component for better performance)
	const { locations, sortedLocations, mapSettings, markerConfig, markerImages } = data;

	// Projects state following the pattern from overview page
	let allProjects: Project[] = data.allProjects;
	// Error handling for data from load function
	let error: string | null = data.error || null;

	let mapContainer: any;
	// Add reference to MobileViewToggle component
	let mobileViewToggle: any;

	// Overlay state for showing location projects
	let isLocationOverlayOpen = false;
	let overlayProjects: Project[] = [];
	let overlayLocationName = '';

	// Context visibility toggle state
	let showContexts = false;

	// Get selected location filters from filter store
	$: selectedLocationFilters = $filterStore.selectedFilters.locations || [];

	// Get the currently selected location object
	$: selectedLocation =
		selectedLocationFilters.length > 0
			? locations.find((loc) => loc.id === selectedLocationFilters[0])
			: null;

	// Filter projects by location only (no context filtering on locations page)
	$: filteredProjects =
		selectedLocationFilters.length > 0
			? allProjects.filter(
					(project) => project.location && selectedLocationFilters.includes(project.location.id)
				)
			: allProjects;

	// Extract unique faculties, contexts, and formats from projects at selected locations
	$: availableFaculties = extractUniqueFaculties(filteredProjects);
	$: availableContexts = extractUniqueContexts(filteredProjects);
	$: availableFormats = extractUniqueFormats(filteredProjects);

	// Helper functions remain in component as they need to be reactive to filtered data
	// Helper function to extract unique faculties with counts
	function extractUniqueFaculties(projects: Project[]): Array<{ faculty: any; count: number }> {
		const facultyMap = new Map<string, { faculty: any; count: number }>();

		projects.forEach((project) => {
			if (project.contexts) {
				project.contexts.forEach((context) => {
					if (context.faculties) {
						context.faculties.forEach((faculty) => {
							const existing = facultyMap.get(faculty.id);
							if (existing) {
								existing.count++;
							} else {
								facultyMap.set(faculty.id, {
									faculty: faculty,
									count: 1
								});
							}
						});
					}
				});
			}
		});

		// Sort by name
		return Array.from(facultyMap.values()).sort((a, b) =>
			a.faculty.name.localeCompare(b.faculty.name)
		);
	}

	// Helper function to extract unique contexts with counts
	function extractUniqueContexts(
		projects: Project[]
	): Array<{ context: EnrichedContextData; count: number }> {
		const contextMap = new Map<string, { context: EnrichedContextData; count: number }>();

		projects.forEach((project) => {
			if (project.contexts) {
				project.contexts.forEach((context) => {
					const existing = contextMap.get(context.id);
					if (existing) {
						existing.count++;
					} else {
						contextMap.set(context.id, {
							context: context,
							count: 1
						});
					}
				});
			}
		});

		// Sort by name
		return Array.from(contextMap.values()).sort((a, b) =>
			a.context.name.localeCompare(b.context.name)
		);
	}

	// Helper function to extract unique formats with counts
	function extractUniqueFormats(projects: Project[]): Array<{ format: any; count: number }> {
		const formatMap = new Map<string, { format: any; count: number }>();

		projects.forEach((project) => {
			if (project.formats) {
				project.formats.forEach((format) => {
					const existing = formatMap.get(format.key);
					if (existing) {
						existing.count++;
					} else {
						formatMap.set(format.key, {
							format: format,
							count: 1
						});
					}
				});
			}
		});

		// Sort by name (using de or en)
		return Array.from(formatMap.values()).sort((a, b) =>
			(a.format.de || a.format.en).localeCompare(b.format.de || b.format.en)
		);
	}

	// Projects are now loaded via the +page.ts load function

	// Handle location click from list - select location but don't switch views
	function handleLocationClick(locationId: string, event: Event) {
		// If clicking the same location, deselect it
		if (selectedLocationFilters.includes(locationId)) {
			clearFilterCategory('locations');
		} else {
			// Clear all locations and select only the clicked one
			clearFilterCategory('locations');
			toggleFilterOption('locations', locationId);
		}
	}

	// Handle "Show on Map" button click - select location and switch to map view
	function handleShowOnMap(locationId: string, event: Event) {
		// Always clear all locations and select only the clicked one
		clearFilterCategory('locations');
		toggleFilterOption('locations', locationId);

		// Always switch to map view on mobile
		if (mobileViewToggle) {
			mobileViewToggle.setRightPanel();
		}
	}

	// Handle "Show Projects" button click - open the projects overlay for this location
	function handleShowProjects(locationId: string) {
		openLocationOverlay(locationId);
	}

	// Handle context click - navigate to overview with context filter
	function handleContextClick(contextId: string) {
		// Clear current filters first
		clearFilterCategory('locations');
		clearFilterCategory('contexts');

		// Navigate to overview with the context filter applied
		goto('/overview').then(() => {
			// Apply the context filter after navigation
			toggleFilterOption('contexts', contextId);
		});
	}

	// Handle toggle contexts from LocationFilters
	function handleToggleContexts() {
		showContexts = !showContexts;
	}

	// Handle close contexts
	function handleCloseContexts() {
		showContexts = false;
	}

	// Handle opening location projects overlay
	function openLocationOverlay(locationId: string) {
		const location = locations.find((loc) => loc.id === locationId);
		const locationProjects = allProjects.filter((p) => p.location?.id === locationId);

		if (location && locationProjects.length > 0) {
			overlayLocationName = location.name;
			overlayProjects = locationProjects;
			isLocationOverlayOpen = true;
		}
	}

	// Handle closing location projects overlay
	function closeLocationOverlay() {
		isLocationOverlayOpen = false;
		overlayProjects = [];
		overlayLocationName = '';
	}
</script>

<svelte:head>
	<title
		>{getUIText('pages.title_base', $activeLanguage)} - {getUIText(
			'pages.locations',
			$activeLanguage
		)}</title
	>
</svelte:head>

<main>
	<MobileViewToggle
		bind:this={mobileViewToggle}
		leftPanelRatio={0.33}
		initialView="left"
		titles={{
			left: getUIText('locations.mobileViewToggle.left', $activeLanguage),
			right: getUIText('locations.mobileViewToggle.right', $activeLanguage)
		}}
	>
		<div class="filter-container" slot="left">
			<LocationFilters
				{locations}
				{allProjects}
				{selectedLocationFilters}
				on:locationClick={({ detail }) => handleLocationClick(detail.locationId, detail.event)}
				on:showOnMap={({ detail }) => handleShowOnMap(detail.locationId, detail.event)}
				on:showProjects={({ detail }) => handleShowProjects(detail.locationId)}
				on:clearFilters={() => clearFilterCategory('locations')}
				on:toggleContexts={handleToggleContexts}
			/>
			<!-- Location Contexts -->
			{#if showContexts && selectedLocationFilters.length > 0}
				<LocationContexts
					{availableFaculties}
					{availableContexts}
					on:contextClick={(e) => handleContextClick(e.detail.contextId)}
					on:close={handleCloseContexts}
				/>
			{/if}
		</div>
		<MapContainer
			slot="right"
			bind:this={mapContainer}
			{locations}
			{mapSettings}
			{selectedLocationFilters}
			{allProjects}
			{openLocationOverlay}
			{handleToggleContexts}
		/>

		<!-- Project Container with filtering indicator -->
		<div class="projects-sidebar" class:hidden={selectedLocationFilters.length === 0}>
			<PaperContainer staticRotation={2} padding="0" width="100%" height="100%">
				<div class="project-container-wrapper">
					{#if selectedLocationFilters.length > 0 && filteredProjects.length === 0}
						<div class="no-projects-message">
							<p>{getUIText('locations.noProjectsMessage', $activeLanguage)}</p>
						</div>
					{:else}
						<ProjectContainer projects={filteredProjects} variant="half" skeletonCount={6} />
					{/if}
				</div>
			</PaperContainer>
		</div>
	</MobileViewToggle>

	<!-- Location Projects Overlay -->
	<Overlay
		isOpen={isLocationOverlayOpen}
		on:close={closeLocationOverlay}
		staticRotation={0.5}
		vertical="bottom"
		horizontal="right"
	>
		<div class="overlay-content">
			<ProjectContainer projects={overlayProjects} />
		</div>
	</Overlay>
</main>

<style lang="scss">
	@use '../../variables.scss' as *;
	main {
		display: block;
		height: 100vh;
		position: relative;
	}

	.layout-container {
		display: flex;
		height: 100vh;
		gap: 2rem;
		padding: 2rem 0; /* Remove left and right padding since sidebars are positioned fixed */
		padding-left: 22vw; /* Add left padding to make space for fixed filter container */
	}

	.filter-container {
		flex: 0 0 20vw;
		height: 100%;
		width: 100%;

		@include desktop {
			min-width: 220px;
			width: 20vw;
			position: fixed;
			left: 0;
			top: 5%;
			bottom: 0;
			z-index: 100;
		}

		@include mobile-only {
			:global(.paper-container) {
				width: 100vw;
				height: fit-content;
				max-height: fit-content;
				margin: 0;
				left: -2rem;
				bottom: -4rem;
				padding: 0.5rem;
				padding-left: 4rem;
			}
		}
	}

	.centered-content {
		@include mobile-only {
			width: 100vw;
		}
	}

	/* Projects Sidebar */
	:global(.overlay-content) {
		margin-right: 4rem;
		padding-top: 3rem;

		@include mobile-only {
			width: 80vw;
			height: fit-content;
			margin-right: 0;
		}
	}

	.projects-sidebar {
		flex: 0 0 40vw;
		min-width: 420px; /* Optimized for 2 columns with minimal space */
		width: 40vw;
		height: 100%;
		position: fixed;
		right: -2rem;
		top: 0;
		bottom: 0;
		padding-right: 2rem; /* Add right padding since container doesn't have it */
		transform: translateX(0);
		transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.projects-sidebar.hidden {
		transform: translateX(100%);
	}

	.projects-sidebar :global(.paper-container) {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.project-container-wrapper {
		flex: 1;
		overflow-y: auto;
		padding: 0;
		max-width: 100%;
		min-width: 600px; /* Optimized for exactly 2 columns */
	}

	.project-container-wrapper :global(.masonry-container) {
		max-width: 100%;
		min-width: 400px;
		padding: 0 0.5rem; /* Reduced padding */
	}

	.project-container-wrapper :global(div.masonry) {
		max-width: 100%;
		min-width: 390px; /* Minimum for 2 columns: 390*2=780px effective width */
		padding: 0;
	}

	.projects-sidebar :global(.project-container) {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	/* No projects message */
	.no-projects-message {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 2rem;
		text-align: center;
	}

	.no-projects-message p {
		font-size: 1rem;
		color: #666;
		line-height: 1.5;
		margin: 0;
		max-width: 300px;
	}

	/* Location Overlay Styles */
	.overlay-content {
		padding: 2rem;
		max-width: 90vw;
		max-height: 90vh;
		overflow-y: auto;

		h2 {
			margin: 0 0 2rem 0;
			font-size: 2rem;
			color: $color_pink;
		}
	}
</style>
