<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect to projects page when accessing a project URL directly
		// The overlay will be handled by the main projects page
		goto('/projects');
	});
</script>

<!-- This page redirects to /projects and the overlay will handle the project display -->
