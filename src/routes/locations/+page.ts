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

	// Static location data - moved from component
	const locations: LocationData[] = [
		{
			id: 'hardenbergstrasse',
			name: 'Hardenbergstraße 33',
			street: 'Hardenbergstraße 33',
			postcode: '10623',
			city: 'Berlin',
			latitude: '52.509653',
			longitude: '13.3271929'
		},
		{
			id: 'bundesallee',
			name: 'Bundesallee 1-12',
			street: 'Bundesallee 1-12',
			postcode: '10719',
			city: 'Berlin',
			latitude: '52.4981932',
			longitude: '13.3274551'
		},
		{
			id: 'jazz-institut_berlin',
			name: 'Jazz-Institut Berlin',
			street: 'Einsteinufer 43-53',
			postcode: '10587',
			city: 'Berlin',
			latitude: '52.5169628',
			longitude: '13.3181485'
		},
		{
			id: 'fasanenstrasse',
			name: 'Fasanenstraße 1b',
			street: 'Fasanenstraße 1b',
			postcode: '10623',
			city: 'Berlin',
			latitude: '52.5093475',
			longitude: '13.3276388'
		},
		{
			id: 'unit_theater',
			name: 'UNI.T - Theater der UdK Berlin',
			street: 'Fasanenstraße 1b',
			postcode: '10623',
			city: 'Berlin',
			latitude: '52.5093475',
			longitude: '13.3276388'
		},
		{
			id: 'konzertsaal',
			name: 'Konzertsaal',
			street: 'Hardenbergstraße, Fasanenstraße 33 (Ecke)',
			postcode: '10623',
			city: 'Berlin',
			latitude: '52.5092561',
			longitude: '13.3275879'
		},
		{
			id: 'lietzenburger_strasse',
			name: 'Lietzenburger Straße 45',
			street: 'Lietzenburger Straße 45',
			postcode: '10777',
			city: 'Berlin',
			latitude: '52.4997893',
			longitude: '13.3314795'
		},
		{
			id: 'medienhaus',
			name: 'Medienhaus',
			street: 'Grunewaldstraße 2-5',
			postcode: '10823',
			city: 'Berlin',
			latitude: '52.4908577',
			longitude: '13.357244'
		},
		{
			id: 'strasse_des_17_juni',
			name: 'Straße des 17. Juni',
			street: 'Straße des 17. Juni 118',
			postcode: '10623',
			city: 'Berlin',
			latitude: '52.5138075',
			longitude: '13.3241008'
		}
	];

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
		const allProjects = await projectsService.fetchAllProjects(language);

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
