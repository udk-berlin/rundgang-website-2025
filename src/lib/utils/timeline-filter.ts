// Timeline filtering utilities

export interface TimelineDay {
	id: 'friday' | 'saturday' | 'sunday';
	de: string;
	en: string;
	fromTime: Date;
	toTime: Date;
}

export const ALL_TIMELINE_DAYS: TimelineDay[] = [
	{
		id: 'friday',
		de: 'Freitag',
		en: 'Friday',
		fromTime: new Date(2025, 0, 1, 16, 0), // 14:00
		toTime: new Date(2025, 0, 1, 24, 0) // 22:00
	},
	{
		id: 'saturday',
		de: 'Samstag',
		en: 'Saturday',
		fromTime: new Date(2025, 0, 1, 11, 0), // 10:00
		toTime: new Date(2025, 0, 1, 22, 0) // 22:00
	},
	{
		id: 'sunday',
		de: 'Sonntag',
		en: 'Sunday',
		fromTime: new Date(2025, 0, 1, 10, 0), // 10:00
		toTime: new Date(2025, 0, 1, 21, 0) // 18:00
	}
];

export interface TimelineFilters {
	selectedLocations: string[];
	timeRanges: {
		friday: [number, number][];
		saturday: [number, number][];
		sunday: [number, number][];
	};
}

export const initialTimelineFilters: TimelineFilters = {
	selectedLocations: [],
	timeRanges: {
		friday: [],
		saturday: [],
		sunday: []
	}
};
