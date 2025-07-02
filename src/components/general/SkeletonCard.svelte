<script lang="ts">
	import { getRandomRotation } from '$lib/utils';
	import ScribbleBorder from '../scribble/ScribbleBorder.svelte';

	// Each skeleton gets its own rotation for visual variety
	const rotation = getRandomRotation();
	const scribbleSeed = Math.floor(Math.random() * 5) + 1;
</script>

<div class="skeleton-card scribble-container" style="--rotation: {rotation}deg">
	<!-- <ScribbleBorder seed={scribbleSeed} scale={0.7} /> -->

	<!-- Image placeholder -->
	<div class="skeleton-image">
		<div class="skeleton-shimmer"></div>
	</div>

	<!-- Content placeholders -->
	<div class="skeleton-content">
		<!-- Format/location row -->
		<div class="skeleton-row">
			<div class="skeleton-text skeleton-format"></div>
			<div class="skeleton-text skeleton-location"></div>
		</div>

		<!-- Title -->
		<div class="skeleton-text skeleton-title"></div>

		<!-- Artist -->
		<div class="skeleton-text skeleton-artist"></div>

		<!-- Schedule placeholder -->
		<div class="skeleton-schedule">
			<div class="skeleton-text skeleton-schedule-item"></div>
			<div class="skeleton-text skeleton-schedule-item short"></div>
		</div>
	</div>

	<!-- Save button placeholder -->
	<div class="skeleton-save-button"></div>
</div>

<style lang="scss">
	.skeleton-card {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		gap: 0.5rem;
		width: 100%;
		padding: 1rem;
		background-color: $white;
		border-radius: $border-radius;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		transform: rotate(var(--rotation));
		min-height: 300px; // Minimum height to prevent layout shift
	}

	.skeleton-image {
		width: 100%;
		padding-top: 75%; // Default aspect ratio
		position: relative;
		border: 1px solid #e0e0e0;
		background-color: #f5f5f5;
		overflow: hidden;
	}

	.skeleton-shimmer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.6) 50%,
			transparent 100%
		);
		animation: shimmer 1.5s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.skeleton-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex-grow: 1;
	}

	.skeleton-row {
		display: flex;
		gap: 1rem;
		justify-content: space-between;
	}

	.skeleton-text {
		background-color: #e0e0e0;
		border-radius: 4px;
		animation: pulse 1.5s ease-in-out infinite alternate;
	}

	@keyframes pulse {
		0% {
			opacity: 0.6;
		}
		100% {
			opacity: 0.8;
		}
	}

	.skeleton-format {
		height: 16px;
		width: 60px;
	}

	.skeleton-location {
		height: 16px;
		width: 80px;
	}

	.skeleton-title {
		height: 20px;
		width: 85%;
		margin-bottom: 0.25rem;
	}

	.skeleton-artist {
		height: 16px;
		width: 70%;
	}

	.skeleton-schedule {
		margin-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.skeleton-schedule-item {
		height: 14px;
		width: 90%;

		&.short {
			width: 60%;
		}
	}

	.skeleton-save-button {
		position: absolute;
		bottom: 0.25rem;
		right: 0.25rem;
		width: 2rem;
		height: 2rem;
		background-color: #e0e0e0;
		border-radius: $border-radius;
		animation: pulse 1.5s ease-in-out infinite alternate;
	}
</style>
