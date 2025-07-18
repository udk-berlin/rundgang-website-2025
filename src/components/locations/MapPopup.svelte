<script lang="ts">
	import { Popup } from 'svelte-maplibre-gl';
	import { base } from '$app/paths';
	import { clearFilterCategory, toggleFilterOption } from '$lib/stores/filter';
	import { getUIText } from '$lib/utils/localization';
	import { activeLanguage } from '$lib/stores/language';
	import CloseButton from '../general/overlay/CloseButton.svelte';
	import LocationActionButtons from './LocationActionButtons.svelte';
	import { getLocalizedLabel } from '$lib/utils/localization';

	export let lnglat: { lng: number; lat: number };
	export let location: {
		id: string;
		name: string;
		street: string;
		postcode: string;
		city: string;
		projectCount?: number;
	};
	export let onShowProjects: (locationId: string) => void;
	export let onToggleContexts: () => void;
	const marker_selected_color = 'pink';

	$: projectCount = location.projectCount || 0;

	// For now, disable contexts in popup since we don't have project data
	$: availableContexts = [];

	function handleShowProjects() {
		if (projectCount > 0) {
			onShowProjects(location.id);
		}
	}

	function handleToggleContexts() {
		onToggleContexts();
	}
</script>

<Popup {lnglat} closeButton={false} closeOnClick={false} offset={[0, -30]} anchor="bottom">
	<div class="popup-content">
		<div class="popup-header">
			<h3>{location.name}</h3>
			<CloseButton
				onClick={() => {
					clearFilterCategory('locations');
				}}
			/>
		</div>
		<div class="popup-body">
			<div class="popup-info">
				<p>{location.street}</p>
				<p>{location.postcode} {location.city}</p>
			</div>
			<div class="popup-image">
				<img
					src={`${base}/locations/${marker_selected_color}/${location.id}_${marker_selected_color}.webp`}
					alt={location.name}
				/>
			</div>
		</div>
		<div class="button-container">
			<LocationActionButtons
				text={getUIText('locations.showProjectsButton', $activeLanguage, {
					count: projectCount
				})}
				variant="primary"
				disabled={projectCount === 0}
				on:click={handleShowProjects}
			/>
			<!-- <LocationActionButtons
				text={getUIText('locations.locationActionButtons.showContexts', $activeLanguage)}
				variant="secondary"
				disabled={availableContexts.length === 0}
				on:click={handleToggleContexts}
			/> -->
		</div>
	</div>
</Popup>

<style lang="scss">
	.popup-content {
		padding: $overlay-padding;

		h3 {
			font-size: 1rem;
			font-weight: 600;
			margin: 0 0 0.5rem 0;
			color: $color_pink;
		}

		p {
			font-size: 0.875rem;
			margin: 0;
			line-height: 1.4;
			color: #333;
		}
	}

	.popup-body {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.popup-info {
		display: flex;
		flex-direction: column;

		p:first-child {
			min-width: 9rem;
		}
	}

	.popup-image {
		height: 3rem;
		width: auto;
	}

	:global(.action-button) {
		margin-top: 0.5rem;
	}

	.button-container {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		margin-top: 0.35rem;
	}

	/* Location Overlay Styles */
	.overlay-content {
		padding: 2rem;
		max-width: 90vw;
		max-height: 90vh;
		overflow-y: auto;
	}
</style>
