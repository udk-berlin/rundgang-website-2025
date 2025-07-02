<script lang="ts">
	import Menu from '../components/general/menu/Menu.svelte';
	import MenuToggleButton from '../components/general/menu/MenuToggleButton.svelte';
	import '../main.css';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { initializeFilters } from '../lib/services/filterInit';
	import { initializeApp } from '../lib/stores/app';
	import ScribbleFilter from '../components/scribble/ScribbleFilter.svelte';
	import ProjectSingle from '../components/general/ProjectSingle.svelte';
	import { overlayStore, closeProjectOverlay } from '../lib/stores/overlay';
	import { resetFilterStore } from '../lib/stores/filter';
	import { closeMerkeliste } from '../lib/stores/merkliste';
	import { lockscroll } from '@svelte-put/lockscroll';
	import { page } from '$app/stores';

	const isMenuOpen = writable(false);

	let showTitle = $page.url.pathname !== '/';
	let scrollY: number;

	$: showTitle = $page.url.pathname !== '/' || scrollY > 100;

	function toggleMenu(): void {
		isMenuOpen.update((open) => !open);
		console.log('Menu is open: ', $isMenuOpen);
	}

	function handleCloseOverlay() {
		closeProjectOverlay();
	}

	onMount(() => {
		// Initialize filter data when the app starts
		initializeFilters();

		// Initialize project cache in the background
		// initializeApp();
	});

	// Close menu and all overlays before any navigation
	beforeNavigate(() => {
		if ($isMenuOpen) {
			isMenuOpen.set(false);
		}
		// Close project overlay
		if ($overlayStore.isOpen) {
			closeProjectOverlay();
		}
		// Close merkeliste overlay
		closeMerkeliste();
		// empty filter store
		resetFilterStore();
	});
</script>

<svelte:head>
	<title>UdK Berlin - Rundgang 2025</title>
</svelte:head>

<svelte:body use:lockscroll={$overlayStore.isOpen} />
<svelte:window bind:scrollY />

<MenuToggleButton isMenuOpen={$isMenuOpen} {toggleMenu} />

<Menu {isMenuOpen} {toggleMenu} />
<a href="/" class:hidden={!showTitle}>UdK Berlin - Rundgang 2025</a>
<slot />

<!-- Global Project Overlay -->
{#if $overlayStore.isOpen && $overlayStore.project}
	<!-- {console.log('Passing project: ', $overlayStore.project)} -->
	<!-- {console.log('Project type: ', typeof $overlayStore.project)} -->
	<ProjectSingle
		project={$overlayStore.project}
		isOpen={$overlayStore.isOpen}
		on:close={handleCloseOverlay}
	/>
{/if}

<!-- <ScribbleFilter seed={99} scale={10.7} id="scribble-animation" />
<ScribbleFilter seed={1} scale={0.7} id="scribble-border-1" />
<ScribbleFilter seed={2} scale={0.4} id="scribble-border-2" />
<ScribbleFilter seed={3} scale={0.2} id="scribble-border-3" />
<ScribbleFilter seed={4} scale={0.4} id="scribble-border-4" />
<ScribbleFilter seed={5} scale={0.3} id="scribble-border-5" /> -->

<style lang="scss">
	a {
		position: fixed;
		top: 14px;
		left: 10px;
		z-index: 100;
		font-weight: bold;
		opacity: 1;
		transition: opacity 0.2s ease-in-out;

		&.hidden {
			opacity: 0;
			pointer-events: none;
		}
	}

	:global(h1) {
		@include desktop {
			text-align: left;
			font-size: 4rem;
			margin: 4rem 0 2rem 0;
		}
	}
</style>
