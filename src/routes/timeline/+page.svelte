<script lang="ts">
	import TimelineFilter from '../../components/timeline/TimelineFilter.svelte';
	import ProjectContainer from '../../components/general/ProjectContainer.svelte';
	import AccordionList from '../../components/general/accordion/AccordionList.svelte';
	import { projectsService, type Project } from '$lib/api';

	import { activeLanguage } from '$lib/stores/language';
	import {
		filterStore,
		setTimelineData,
		clearTimelineFilters,
		setTimelineTimeRanges
	} from '$lib/stores/filter';
	import type { EnrichedLocationData } from '$lib/api/types/kirby';
	import MobileViewToggle from '../../components/mobile/MobileViewToggle.svelte';
	import PaperContainer from '../../components/general/overlay/PaperContainer.svelte';
	import { onMount } from 'svelte';
	import { getUIText } from '$lib/utils/localization';
	import TimelineList from '../../components/timeline/TimelineList.svelte';
	// Define the page data interface
	interface PageData {
		allProjects: Project[];
		availableLocations: EnrichedLocationData[];
		totalProjects: number;
		language: 'DE' | 'EN';
		prerendered: boolean;
		error?: string;
	}

	export let data: PageData;

	// Initialize state from loaded data
	let allProjects: Project[] = data.allProjects;
	let availableLocations: EnrichedLocationData[] = data.availableLocations;
	let loading = false;
	let error: string | null = data.error || null;

	// Projects grouped by location (after filtering)
	let filteredProjectsByLocation: Map<
		string,
		{
			location: EnrichedLocationData;
			projects: Project[];
		}
	> = new Map();

	// Track accordion states for location sections
	let accordionStates: Record<string, boolean> = {};

	// Track current language for change detection
	let currentLanguage: 'DE' | 'EN' = data.language;

	function extractAvailableLocations() {
		const locationMap = new Map<string, EnrichedLocationData>();

		allProjects.forEach((project) => {
			if (project.location) {
				locationMap.set(project.location.id, project.location);
			}
		});

		availableLocations = Array.from(locationMap.values()).sort((a, b) =>
			a.name.localeCompare(b.name)
		);
		console.log(`Found ${availableLocations.length} unique locations`);

		// Update the store with available locations
		setTimelineData(
			availableLocations,
			$filterStore.timeline.selectedLocations,
			$filterStore.timeline.timeRanges
		);
	}

	function filterAndGroupProjects() {
		const locationMap = new Map<
			string,
			{
				location: EnrichedLocationData;
				projects: Project[];
			}
		>();

		// Filter projects based on current filters
		const filteredProjects = allProjects.filter((project) => {
			// Always include projects with locations if no filters are active
			if (!hasActiveFilters() && project.location) {
				return true;
			}

			// Start with true, then apply filters as AND conditions
			let includeProject = true;

			// Location filter - only apply if location filters are selected
			if ($filterStore.timeline.selectedLocations.length > 0) {
				includeProject =
					includeProject &&
					!!project.location &&
					$filterStore.timeline.selectedLocations.includes(project.location.id);
			}

			// Time filter - only apply if time filters are selected
			if (hasActiveTimeFilters()) {
				includeProject = includeProject && matchesTimeFilter(project);
			}

			// Must have a location to be displayed on timeline page
			includeProject = includeProject && project.location !== undefined;

			return includeProject;
		});

		// Group filtered projects by location
		filteredProjects.forEach((project) => {
			if (project.location) {
				const locationKey = project.location.id;

				if (!locationMap.has(locationKey)) {
					locationMap.set(locationKey, {
						location: project.location,
						projects: []
					});
				}

				// Check if project is already in this location group to avoid duplicates
				const locationGroup = locationMap.get(locationKey)!;
				const alreadyExists = locationGroup.projects.some(
					(existingProject) => existingProject.id === project.id
				);

				if (!alreadyExists) {
					locationGroup.projects.push(project);
				}
			}
		});

		// Sort locations by name
		const sortedEntries = Array.from(locationMap.entries()).sort((a, b) =>
			a[1].location.name.localeCompare(b[1].location.name)
		);

		filteredProjectsByLocation = new Map(sortedEntries);

		// console.log(
		// 	`Filtered to ${filteredProjectsByLocation.size} locations with ${filteredProjects.length} filtered projects`
		// );
	}

	function hasActiveFilters(): boolean {
		return $filterStore.timeline.selectedLocations.length > 0 || hasActiveTimeFilters();
	}

	function hasActiveTimeFilters(): boolean {
		return (
			$filterStore.timeline.timeRanges.friday.length > 0 ||
			$filterStore.timeline.timeRanges.saturday.length > 0 ||
			$filterStore.timeline.timeRanges.sunday.length > 0
		);
	}

	function matchesTimeFilter(project: Project): boolean {
		// If project has no schedule, don't show it when time filters are active
		if (!project.schedule) {
			return false;
		}

		// Check if project has events in any of the selected time ranges
		let matches = false;

		// Check each day's time ranges
		(['friday', 'saturday', 'sunday'] as const).forEach((day) => {
			const dayRanges = $filterStore.timeline.timeRanges[day];
			const dayEvents = project.schedule[day];

			// If there are no filters for this day, skip
			if (!dayRanges || dayRanges.length === 0) return;

			// If there are no events for this day, skip
			if (!dayEvents || dayEvents.length === 0) return;

			// Check if any event overlaps with any selected time range
			dayEvents.forEach((event: { fromDate: string; toDate: string }) => {
				const eventStart = new Date(event.fromDate);
				const eventEnd = new Date(event.toDate);

				dayRanges.forEach(([rangeStartHour, rangeEndHour]) => {
					// Convert range hours to times on the same day as the event
					const rangeStart = new Date(eventStart);
					rangeStart.setHours(rangeStartHour, 0, 0, 0);

					const rangeEnd = new Date(eventStart);
					rangeEnd.setHours(rangeEndHour, 0, 0, 0);

					// Check for overlap: event starts before range ends AND event ends after range starts
					if (eventStart < rangeEnd && eventEnd > rangeStart) {
						matches = true;
					}
				});
			});
		});

		return matches;
	}

	// Switch language by loading fresh data
	async function switchLanguageInstantly(newLanguage: 'DE' | 'EN') {
		return loadAllProjects(newLanguage);
	}

	// Load all projects from API (fallback when cache is not available)
	async function loadAllProjects(language: 'DE' | 'EN') {
		try {
			loading = true;
			error = null;

			// console.log(`Timeline: Loading projects for language ${language}`);

			const allProjectsData = await projectsService.fetchAllProjects(language);

			// Filter projects with locations
			const projectsWithLocations = allProjectsData.filter((project) => project.location);

			// Extract locations
			const locationMap = new Map<string, EnrichedLocationData>();
			projectsWithLocations.forEach((project) => {
				if (project.location) {
					locationMap.set(project.location.id, project.location);
				}
			});
			const newAvailableLocations = Array.from(locationMap.values()).sort((a, b) =>
				a.name.localeCompare(b.name)
			);

			allProjects = projectsWithLocations;
			availableLocations = newAvailableLocations;
			currentLanguage = language;

			// console.log(`Timeline: Loaded ${allProjects.length} projects with locations for ${language}`);

			// Update the store with available locations
			setTimelineData(
				availableLocations,
				$filterStore.timeline.selectedLocations,
				$filterStore.timeline.timeRanges
			);

			filterAndGroupProjects();
		} catch (err) {
			// console.error('Failed to load projects:', err);
			error = err instanceof Error ? err.message : 'Failed to load projects';
		} finally {
			loading = false;
		}
	}

	// Reactive statement to trigger filtering when store changes
	$: if (allProjects.length > 0) {
		// Trigger when any filter values change
		$filterStore.timeline.selectedLocations;
		$filterStore.timeline.timeRanges;
		filterAndGroupProjects();
	}

	// Convert map to array for easier iteration in template
	$: locationGroups = Array.from(filteredProjectsByLocation.values());
	$: totalFilteredProjects = locationGroups.reduce((sum, group) => sum + group.projects.length, 0);

	// Convert location groups to accordion items
	$: accordionItems = locationGroups.map(({ location, projects }) => ({
		id: location.id,
		location,
		projects
	}));

	// Reactive computation for filter status - make dependencies explicit
	$: hasFiltersActive =
		$filterStore.timeline.selectedLocations.length > 0 ||
		$filterStore.timeline.timeRanges.friday.length > 0 ||
		$filterStore.timeline.timeRanges.saturday.length > 0 ||
		$filterStore.timeline.timeRanges.sunday.length > 0;

	// Initialize on mount
	onMount(() => {
		// console.log('Timeline component mounted');

		// Initialize the store with loaded data
		setTimelineData(
			availableLocations,
			$filterStore.timeline.selectedLocations,
			$filterStore.timeline.timeRanges
		);

		// Initial filtering
		filterAndGroupProjects();

		currentLanguage = $activeLanguage;
	});

	// Reactive statement to handle language changes
	$: {
		if (typeof window !== 'undefined') {
			if ($activeLanguage !== currentLanguage) {
				// Use instant switching if both languages are cached, otherwise load from API
				switchLanguageInstantly($activeLanguage);
			}
		}
	}

	function handleTimeRangeChange(
		event: CustomEvent<{ day: 'friday' | 'saturday' | 'sunday'; ranges: [number, number][] }>
	) {
		setTimelineTimeRanges(event.detail.day, event.detail.ranges);
	}

	function handleClearAll() {
		clearTimelineFilters();
	}
</script>

<svelte:head>
	<title
		>{getUIText('pages.title_base', $activeLanguage)} - {getUIText(
			'pages.timeline',
			$activeLanguage
		)}</title
	>
	<meta name="description" content="Rundgang 2025 - Graduate Exhibition" />
</svelte:head>

<main>
	<MobileViewToggle
		leftPanelRatio={0.33}
		titles={{
			left: getUIText('timeline.mobileViewToggle.left', $activeLanguage),
			right: getUIText('timeline.mobileViewToggle.right', $activeLanguage)
		}}
	>
		<div class="filter-container" slot="left">
			<PaperContainer staticRotation={1.5} height="auto" padding="0" width="33%" vertical="top">
				<TimelineFilter></TimelineFilter>
			</PaperContainer>
		</div>
		<div class="projects-container" slot="right">
			<TimelineList
				{allProjects}
				{availableLocations}
				{loading}
				{error}
				{locationGroups}
				{accordionItems}
				{totalFilteredProjects}
				{data}
				{hasFiltersActive}
				{loadAllProjects}
				selectedRanges={$filterStore.timeline.timeRanges}
			/>
		</div>
	</MobileViewToggle>
</main>

<style lang="scss">
	main {
		min-height: 100vh;
		width: 100%;
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
				height: auto;
				margin: 0;
				left: -2rem;
				bottom: 5rem; // to be visible above toggle button
				padding: 0.5rem;
				padding-left: 4rem;
			}
		}
	}

	.loading-state,
	.error-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		text-align: center;
		gap: 1rem;

		p {
			font-size: $font-large;
			color: rgba($black, 0.7);
		}
	}

	.no-results {
		text-align: center;
		padding: 3rem 1rem;
		color: rgba($black, 0.6);

		p {
			font-size: $font-medium;
			margin-bottom: 1rem;
		}

		button {
			background: none;
			border: 1px solid $color_pink;
			border-radius: 4px;
			padding: 0.75rem 1.5rem;
			color: $color_pink;
			cursor: pointer;
			font-size: $font-small;
			transition: all 0.2s ease;

			&:hover {
				background: $color_pink;
				color: white;
			}
		}
	}

	.timeline-projects-container {
		max-width: 100%;
		width: 100%;
		margin: 5rem auto;
	}

	// Custom styles for location headers when used with Accordion component
	.location-info {
		display: flex;
		width: 100%;
		text-align: right;
		flex-direction: column-reverse;
		align-items: flex-end;

		@include desktop {
			flex-flow: row nowrap;
			justify-content: flex-end;
			align-items: baseline;
			gap: 2ch;
		}

		h2 {
			font-size: $font-large;
			transition: color 0.2s ease;
		}

		:global(.accordion) & h2 {
			color: inherit;
		}

		:global(.accordion.open) & h2 {
			color: $color_pink;
		}

		&:hover {
			h2 {
				color: $color_pink;
			}
		}

		.project-count {
			font-size: $font-medium;
			color: rgba($black, 0.6);
		}
	}

	.projects-container {
		width: 100%;
		padding: 1rem;

		:global(div.masonry) {
			padding: 0 !important;
		}
	}

	.summary-stats {
		position: fixed;
		bottom: 20px;
		right: 20px;
		font-family: 'Courier', monospace;
		text-align: right;
		background: rgba($black, 0.02);
		border-radius: $border-radius;

		p {
			font-size: $font-small;
			color: rgba($black, 0.6);
			margin-bottom: 0.5rem;

			&:last-child {
				margin-bottom: 0;
			}

			&.note {
				font-style: italic;
				color: rgba($black, 0.5);
			}
		}
	}

	.error-message {
		text-align: center;
		margin: 2rem 0;

		p {
			color: #d32f2f;
			font-size: $font-medium;
		}

		button {
			padding: 0.5rem 1rem;
			border: 1px solid #d32f2f;
			border-radius: $border-radius;
			background: white;
			color: #d32f2f;
			cursor: pointer;
			font-size: $font-small;
			margin-top: 0.5rem;
			transition: all 0.2s ease;

			&:hover {
				background: #d32f2f;
				color: white;
			}
		}
	}
</style>
