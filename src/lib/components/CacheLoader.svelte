<script lang="ts">
	import { onMount } from 'svelte';
	import { cacheReady, initializeApp } from '../stores/app';

	let loading = true;
	let error = false;

	onMount(async () => {
		try {
			await initializeApp();
			loading = false;
		} catch (err) {
			// console.error('Failed to initialize cache:', err);
			error = true;
			loading = false;
		}
	});
</script>

{#if loading}
	<div class="cache-loader">
		<p>Loading projects...</p>
	</div>
{:else if error}
	<div class="cache-error">
		<p>Failed to load project data. Some features may be limited.</p>
	</div>
{/if}

<style>
	.cache-loader,
	.cache-error {
		position: fixed;
		top: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 12px;
		z-index: 9999;
	}

	.cache-error {
		background: rgba(220, 53, 69, 0.9);
	}
</style>
