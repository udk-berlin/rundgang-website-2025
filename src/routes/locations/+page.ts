import { createProjectsService } from '../../lib/api';
import { base } from '$app/paths';

// Type definitions for location data
export interface LocationData {
	id: string;
	name: string;
	street: string;
	postcode: string;
	city: string;
	latitude: string;
	longitude: string;
	projectCount?: number;
}

export interface MapSettings {
	minZoom: number;
	maxZoom: number;
	minPitch: number;
	maxPitch: number;
	maxBounds: [number, number, number, number];
	zoomRange: [number, number];
	pitchRange: [number, number];
	boxZoom: boolean;
	doubleClickZoom: boolean;
	dragRotate: boolean;
	dragPan: boolean;
	keyboard: boolean;
	scrollZoom: boolean;
	touchZoomRotate: boolean;
	touchPitch: boolean;
}

export interface MarkerConfig {
	baseColor: string;
	selectedColor: string;
}

export const load = async ({ url, fetch }: { url: URL; fetch: typeof globalThis.fetch }) => {
	// Get language from URL params or default to EN
	const language = (url.searchParams.get('lang')?.toUpperCase() as 'DE' | 'EN') || 'EN';

	// Fetch location data from API
	const locationsResponse = await fetch(`/api/filters/locations`);
	if (!locationsResponse.ok) {
		throw new Error(`Failed to fetch locations: ${locationsResponse.status}`);
	}
	
	const apiLocations = await locationsResponse.json();
	
	// Transform API data to match LocationData interface
	const locations: LocationData[] = apiLocations.map((loc: any) => ({
		id: loc.normalizedKebabName || loc.name.toLowerCase().replace(/\s+/g, '-'),
		name: loc.name,
		street: loc.street,
		postcode: loc.postcode,
		city: loc.city,
		latitude: loc.latitude,
		longitude: loc.longitude,
		projectCount: loc.projectCount
	}));

	// Static map configuration - moved from component
	const mapSettings: MapSettings = {
		minZoom: 0,
		maxZoom: 18,
		minPitch: 0,
		maxPitch: 0,
		maxBounds: [13.28255847215965, 52.459218081013574, 13.503970277050087, 52.55751809030562] as [
			number,
			number,
			number,
			number
		],
		zoomRange: [0, 18] as [number, number],
		pitchRange: [0, 0] as [number, number],
		boxZoom: false,
		doubleClickZoom: false,
		dragRotate: false,
		dragPan: true,
		keyboard: false,
		scrollZoom: true,
		touchZoomRotate: true,
		touchPitch: false
	};

	// Static marker configuration
	const markerConfig: MarkerConfig = {
		baseColor: 'lila',
		selectedColor: 'pink'
	};

	// Pre-generate marker image paths
	const getMarkerFilename = (id: string, color: string) => `${id}_${color}`;

	const markerImages = Object.fromEntries(
		locations.map((loc) => [
			loc.id,
			{
				base: `${base}/locations/${markerConfig.baseColor}/${getMarkerFilename(loc.id, markerConfig.baseColor)}.webp`,
				selected: `${base}/locations/${markerConfig.selectedColor}/${getMarkerFilename(loc.id, markerConfig.selectedColor)}.webp`
			}
		])
	);

	// Sort locations alphabetically by name
	const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));

	try {
		// Load all projects with full data (needed for locations page display)
		const projectsService = createProjectsService(fetch);
		const allProjects = await projectsService.fetchAllProjects();

		return {
			allProjects: allProjects,
			totalProjects: allProjects.length,
			locations,
			sortedLocations,
			mapSettings,
			markerConfig,
			markerImages,
			language,
			prerendered: true
		};
	} catch (error) {
		// console.error('Failed to load projects for locations page:', error);

		return {
			allProjects: [],
			totalProjects: 0,
			locations,
			sortedLocations,
			mapSettings,
			markerConfig,
			markerImages,
			language,
			prerendered: false,
			error: 'Failed to load projects'
		};
	}
};
