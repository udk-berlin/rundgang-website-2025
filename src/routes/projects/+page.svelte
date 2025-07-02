<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getUIText } from '$lib/utils/localization';
	import { activeLanguage } from '$lib/stores/language';

	onMount(() => {
		// Redirect /projects to the main page where all projects are displayed
		goto('/', { replaceState: true });
	});
</script>

<svelte:head>
	<title
		>{getUIText('pages.title_base', $activeLanguage)} - {getUIText(
			'pages.overview',
			$activeLanguage
		)}</title
	>
	<meta name="description" content="Rundgang 2025 - Graduate Exhibition" />
</svelte:head>

<!-- This page redirects to the main page where projects are displayed -->
