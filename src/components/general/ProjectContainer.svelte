<script lang="ts">
	import FruitCard from './FruitCard.svelte';
	import ProjectCard from './ProjectCard.svelte';
	import SkeletonCard from './SkeletonCard.svelte';
	import { overlayStore } from '$lib/stores/overlay';
	import { filterStore } from '$lib/stores/filter';
	import { activeLanguage } from '$lib/stores/language';
	import { filterProjects } from '$lib/utils';
	import type { Project } from '$lib/api/types/index';
	import { projectsService } from '$lib/api';

	import { writable, derived, get } from 'svelte/store';
	import Masonry from 'svelte-bricks';

	let width = $state(0);
	let height = $state(0);

	// Accept projects as a prop
	const {
		projects = [],
		skeletonCount = 0,
		variant = 'full',
		disableFiltering = false
	} = $props<{
		variant?: 'full' | 'half';
		projects: Project[];
		skeletonCount?: number;
		disableFiltering?: boolean;
	}>();

	let [minColWidth, gap] = [variant === 'half' ? 220 : 260, 20];

	// Initialize the projects store with the prop value
	const projectsStore = writable<Project[]>(projects);

	// Update projects when prop changes
	$effect(() => {
		// Always update the store when projects prop changes, regardless of length
		// This ensures language changes are properly reflected
		projectsStore.set(projects);
	});

	const rawFiltered = derived([projectsStore, filterStore], ([$projects, $filterStore]) => {
		// Skip filtering if disabled (e.g., on timeline page where filtering is handled by parent)
		if (disableFiltering) {
			return $projects;
		}
		return filterProjects($projects, $filterStore.selectedFilters);
	});

	const filteredProjects = writable<Project[]>([]);

	let currentFilterKey = '';

	rawFiltered.subscribe((newList) => {
		const key = JSON.stringify(get(filterStore).selectedFilters);
		filteredProjects.update((prev) => {
			if (key !== currentFilterKey) {
				// Filter changed - apply new filter and shuffle
				currentFilterKey = key;
				const shuffled = shuffleOnce(newList);
				return shuffled;
			}

			// Same filter - just append new items to preserve layout
			const existingIds = new Set(prev.map((p) => p.id));
			const newItems = newList.filter((p) => !existingIds.has(p.id));

			// For progressive loading: append new items in order (no shuffling)
			// This prevents existing items from moving when new ones are added
			const result = [...prev, ...newItems];
			return result;
		});
	});

	function shuffleOnce(array: Project[]): Project[] {
		const shuffled = [...array];
		// Use Date.now() + Math.random() to ensure different order on each reload
		let seed = Date.now() + Math.random() * 1000000;
		for (let i = shuffled.length - 1; i > 0; i--) {
			seed = (seed * 9301 + 49297) % 233280;
			const j = Math.floor((seed / 233280) * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	function seededChance(id: string): number {
		let seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
		return (Math.sin(seed) + 1) / 2; // returns 0–1
	}

	async function handleProjectClick(project: Project) {
		try {
			const fullProject = await projectsService.fetchById(project.id, $activeLanguage);
			if (fullProject) {
				overlayStore.set({ isOpen: true, project: fullProject });
			} else {
				// console.error('Failed to load full project data');
				const fallbackProject: Project = {
					...project,
					images:
						project.titleImage &&
						project.titleImage.length > 0 &&
						project.titleImage[0]?.originalUrl
							? project.titleImage
							: undefined,
					content: undefined
				};
				overlayStore.set({ isOpen: true, project: fallbackProject });
			}
		} catch (error) {
			// console.error('Error loading project:', error);
		}
	}

	// Column calculation based on viewport width and variant
	function calcCols(masonryWidth: number) {
		const effectiveWidth = variant === 'half' ? masonryWidth * 2 : masonryWidth;

		// For half variant (used in sidebar), ensure at least 2 columns on desktop
		if (variant === 'half') {
			if (effectiveWidth < 768) return 1;
			if (effectiveWidth < 1920) return 2;
			return 3;
		}

		// Full width variant
		if (effectiveWidth < 768) return 1;
		if (effectiveWidth < 1024) return 2;
		if (effectiveWidth < 1440) return 3;
		if (effectiveWidth < 1920) return variant === 'half' ? 2 : 4;
		return variant === 'half' ? 3 : 6;
	}

	// Simple approach: show skeletons or real projects
	let showSkeletons = $state(true);

	// Update skeleton visibility when projects load
	$effect(() => {
		const shouldShowSkeletons = $filteredProjects.length === 0 && skeletonCount > 0;
		// console.log('Skeleton visibility check:', {
		// 	filteredProjectsLength: $filteredProjects.length,
		// 	skeletonCount,
		// 	shouldShowSkeletons
		// });
		showSkeletons = shouldShowSkeletons;
	});

	// Create skeleton items for display
	const skeletonItems = Array.from({ length: skeletonCount }, (_, i) => ({
		type: 'skeleton',
		id: `skeleton-${i}`
	}));
</script>

<div class="masonry-container" class:half-width={variant === 'half'}>
	{#if showSkeletons}
		<!-- Show skeletons while loading -->
		<Masonry
			items={skeletonItems}
			{gap}
			{calcCols}
			bind:masonryWidth={width}
			bind:masonryHeight={height}
			animate={true}
			duration={200}
		>
			{#snippet children({ item })}
				{#key item.id}
					<SkeletonCard />
				{/key}
			{/snippet}
		</Masonry>
	{:else}
		<!-- Show real projects -->
		<Masonry
			items={$filteredProjects}
			{gap}
			{calcCols}
			bind:masonryWidth={width}
			bind:masonryHeight={height}
			animate={true}
			duration={200}
		>
			{#snippet children({ item })}
				{#key item.id}
					<ProjectCard project={item} on:click={() => handleProjectClick(item)} />
					{#if seededChance(item.id) < 0.05}
						<FruitCard />
					{/if}
				{/key}
			{/snippet}
		</Masonry>
	{/if}
</div>

<style lang="scss">
	.masonry-container {
		width: 100%;
		min-height: min-content;

		&.half-width {
			width: 50%;
			max-width: 50%;
		}
	}

	:global(div.masonry) {
		width: 100%;
		padding: 0 1rem;
		min-height: min-content;
		height: auto;
	}

	:global(div.masonry div.col) {
		width: 100%;
		height: 100%;
	}
</style>
