import { writable } from 'svelte/store';
import type { FilterData } from '../api/services';
import type { EnrichedLocationData } from '../api/types/kirby';

export interface FilterState {
	isOpen: boolean;
	data: FilterData;
	isLoading: boolean;
	selectedFilters: Record<string, string[]>; // category -> selected values
	// Time filtering for timeline page
	timeFilters: {
		friday: string[];
		saturday: string[];
		sunday: string[];
	};
	// Accordion state for timeline
	timeAccordionOpen: 'friday' | 'saturday' | 'sunday' | null;
	// Timeline-specific data
	timeline: {
		availableLocations: EnrichedLocationData[];
		selectedLocations: string[];
		timeRanges: {
			friday: [number, number][];
			saturday: [number, number][];
			sunday: [number, number][];
		};
	};
}

export const initialState: FilterState = {
	isOpen: false,
	data: {
		contexts: [],
		locations: [],
		formats: []
	},
	isLoading: false,
	selectedFilters: {},
	timeFilters: {
		friday: [],
		saturday: [],
		sunday: []
	},
	timeAccordionOpen: null,
	timeline: {
		availableLocations: [],
		selectedLocations: [],
		timeRanges: {
			friday: [],
			saturday: [],
			sunday: []
		}
	}
};

export function resetFilterStore() {
	// set selectedFilters to empty object
	filterStore.update((state) => ({
		...state,
		selectedFilters: {}
	}));
}

export const filterStore = writable<FilterState>(initialState);

export function openFilter() {
	filterStore.update((state) => ({
		...state,
		isOpen: true
	}));
}

export function closeFilter() {
	filterStore.update((state) => ({
		...state,
		isOpen: false
	}));
}

export function toggleFilter() {
	filterStore.update((state) => ({
		...state,
		isOpen: !state.isOpen
	}));
}

export function setFilterData(data: FilterData) {
	filterStore.update((state) => ({
		...state,
		data,
		isLoading: false
	}));
}

export function setFilterLoading(isLoading: boolean) {
	filterStore.update((state) => ({
		...state,
		isLoading
	}));
}

export function toggleFilterOption(category: string, value: string) {
	filterStore.update((state) => {
		const currentSelected = state.selectedFilters[category] || [];
		const isSelected = currentSelected.includes(value);

		const newSelected = isSelected
			? currentSelected.filter((v) => v !== value)
			: [...currentSelected, value];

		return {
			...state,
			selectedFilters: {
				...state.selectedFilters,
				[category]: newSelected
			}
		};
	});
}

export function toggleTimeFilter(day: 'friday' | 'saturday' | 'sunday', timeSlot: string) {
	filterStore.update((state) => {
		const currentSelected = state.timeFilters[day] || [];
		const isSelected = currentSelected.includes(timeSlot);

		const newSelected = isSelected
			? currentSelected.filter((v) => v !== timeSlot)
			: [...currentSelected, timeSlot];

		return {
			...state,
			timeFilters: {
				...state.timeFilters,
				[day]: newSelected
			}
		};
	});
}

export function toggleTimeAccordion(day: 'friday' | 'saturday' | 'sunday') {
	filterStore.update((state) => ({
		...state,
		timeAccordionOpen: state.timeAccordionOpen === day ? null : day
	}));
}

export function clearAllFilters() {
	filterStore.update((state) => ({
		...state,
		selectedFilters: {},
		timeFilters: {
			friday: [],
			saturday: [],
			sunday: []
		}
	}));
}

export function clearFilterCategory(category: string) {
	filterStore.update((state) => {
		const newSelectedFilters = { ...state.selectedFilters };
		delete newSelectedFilters[category];

		return {
			...state,
			selectedFilters: newSelectedFilters
		};
	});
}

export function clearTimeFilters() {
	filterStore.update((state) => ({
		...state,
		timeFilters: {
			friday: [],
			saturday: [],
			sunday: []
		}
	}));
}

// Timeline-specific functions
export function setTimelineData(
	availableLocations: EnrichedLocationData[],
	selectedLocations: string[],
	timeRanges: {
		friday: [number, number][];
		saturday: [number, number][];
		sunday: [number, number][];
	}
) {
	filterStore.update((state) => ({
		...state,
		timeline: {
			availableLocations,
			selectedLocations,
			timeRanges
		}
	}));
}

export function toggleTimelineLocation(locationId: string) {
	filterStore.update((state) => {
		const currentSelected = state.timeline.selectedLocations;
		const isSelected = currentSelected.includes(locationId);

		const newSelected = isSelected
			? currentSelected.filter((id) => id !== locationId)
			: [...currentSelected, locationId];

		return {
			...state,
			timeline: {
				...state.timeline,
				selectedLocations: newSelected
			}
		};
	});
}

export function setTimelineTimeRanges(
	day: 'friday' | 'saturday' | 'sunday',
	ranges: [number, number][]
) {
	filterStore.update((state) => ({
		...state,
		timeline: {
			...state.timeline,
			timeRanges: {
				...state.timeline.timeRanges,
				[day]: ranges
			}
		}
	}));
}

export function clearTimelineFilters() {
	filterStore.update((state) => ({
		...state,
		timeline: {
			...state.timeline,
			selectedLocations: [],
			timeRanges: {
				friday: [],
				saturday: [],
				sunday: []
			}
		}
	}));
}
