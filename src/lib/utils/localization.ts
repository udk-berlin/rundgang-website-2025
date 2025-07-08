/**
 * Localization utilities for handling multilingual content
 */

export type Language = 'DE' | 'EN';

/**
 * Get localized label from an object with de/en properties
 */
export function getLocalizedLabel(
	item: { de?: string; en?: string } | string,
	language: Language
): string {
	if (typeof item === 'string') {
		return item;
	}

	if (!item) {
		return '';
	}

	// Return the requested language or fallback to the other language or empty string
	const result = language === 'DE' ? item.de || item.en || '' : item.en || item.de || '';

	// Debug logging to see what's being returned
	// console.log(`getLocalizedLabel: language=${language}, item=`, item, `result=${result}`);

	return result;
}

export function getLocalizedRundgangDateString(language: Language): string {
	const dateString = {
		de: '18. - 20. Juli 2025',
		en: '18 - 20 July 2025'
	};
	return getLocalizedLabel(dateString, language);
}

/**
 * Get localized day name
 */
export function getLocalizedDayName(
	day: 'friday' | 'saturday' | 'sunday',
	language: Language
): string {
	const dayNames = {
		friday: { de: 'Freitag', en: 'Friday' },
		saturday: { de: 'Samstag', en: 'Saturday' },
		sunday: { de: 'Sonntag', en: 'Sunday' }
	};

	return getLocalizedLabel(dayNames[day], language);
}

/**
 * Get localized day abbreviation
 */
export function getLocalizedDayAbbreviation(
	day: 'friday' | 'saturday' | 'sunday',
	language: Language
): string {
	const dayAbbreviations = {
		friday: { de: 'FR', en: 'FRI' },
		saturday: { de: 'SA', en: 'SAT' },
		sunday: { de: 'SO', en: 'SUN' }
	};

	return getLocalizedLabel(dayAbbreviations[day], language);
}

/**
 * Get localized format labels from an array of format objects
 */
export function getLocalizedFormats(
	formats: Array<{ key: string; de?: string; en?: string }>,
	language: Language
): string[] {
	return formats.map((format) => getLocalizedLabel(format, language));
}

/**
 * UI Text translations for components
 */
export const UI_TEXTS = {
	// Menu component
	menu: {
		overview: { de: 'Übersicht', en: 'Overview' },
		locations: { de: 'Orte', en: 'Locations' },
		timeline: { de: 'Zeitplan', en: 'Timeline' },
		faq: { de: 'FAQ', en: 'FAQ' },
		impressum: { de: 'Impressum', en: 'Imprint' },
		contacts: { de: 'Kontakte', en: 'Contacts' },
		merkliste: { de: 'Merkliste', en: 'Bookmarks' },
		switchToGerman: { de: 'Zu Deutsch wechseln', en: 'Switch to German' },
		switchToEnglish: { de: 'Zu Englisch wechseln', en: 'Switch to English' }
	},

	announcement: {
		content: {
			de: 'Der Rundgang startet <span>Freitag, 18. Juli um 16 Uhr</span>',
			en: 'The Rundgang starts on <span>Friday, 18th July at 4pm</span>'
		}
	},

	languageSwitcher: {
		de: {
			de: 'Beachten Sie, dass einige Projekte nur auf Deutsch oder Englisch verfügbar sind.',
			en: 'Note that some projects are only available in German or English.'
		}
	},

	// Filter component
	filter: {
		title: { de: 'Filter', en: 'Filter' },
		loading: { de: 'Filter werden geladen...', en: 'Loading filters...' },
		noFilters: { de: 'Keine Filter verfügbar', en: 'No filters available' },
		clearSelection: { de: 'Auswahl löschen', en: 'Clear Selection' },
		clearAll: { de: 'Alle Filter entfernen', en: 'Clear All Filters' },
		locations: { de: 'Orte', en: 'Locations' },
		timeSlots: { de: 'Zeitfenster auswählen', en: 'Select Time Slots' },
		clear: { de: 'Entfernen', en: 'Clear' }
	},

	// Merkliste component
	merkliste: {
		title: { de: 'Merkliste', en: 'Bookmarks' },
		empty: { de: 'Noch keine Projekte gespeichert', en: 'No projects saved yet' },
		addToMerkliste: { de: 'Zur Merkliste hinzufügen', en: 'Add to Bookmarks' },
		removeFromMerkliste: { de: 'Von Merkliste entfernen', en: 'Remove from Bookmarks' }
	},

	// Timeline component
	timeline: {
		heading: { de: 'Zeitplan - Projekte nach Standort', en: 'Timeline - Projects by Location' },
		selectTimeRanges: {
			de: 'Zeitfenster für {day} auswählen',
			en: 'Select time slots for {day}'
		},
		removeRange: {
			de: 'Zeitfenster {start}:00 - {end}:00 entfernen',
			en: 'Remove time slot {start}:00 - {end}:00'
		},
		mobileViewToggle: {
			left: { de: 'Zeitfenster', en: 'Time Slots' },
			right: { de: 'Programm', en: 'Program' }
		},
		summary: {
			projects: {
				plural: { de: 'Projekte', en: 'projects' },
				singular: { de: 'Projekt', en: 'project' }
			},
			foundFor: { de: 'eingetragen für', en: 'found for' },
			in: { de: 'an', en: 'in' },
			locations: {
				plural: { de: 'Standorten', en: 'locations' },
				singular: { de: 'Standort', en: 'location' }
			},
			and: { de: 'und', en: 'and' }
		},
		// New localized strings for timeline page
		loadingProjects: { de: 'Projekte werden geladen...', en: 'Loading projects...' },
		errorLoadingProjects: {
			de: 'Fehler beim Laden der Projekte: {error}',
			en: 'Error loading projects: {error}'
		},
		retry: { de: 'Erneut versuchen', en: 'Retry' },
		noProjectsWithLocations: {
			de: 'Keine Projekte für die ausgewählten Zeiten gefunden',
			en: 'No projects found for the selected time slots'
		},
		noMatchingProjects: {
			de: 'Keine Projekte entsprechen den aktuellen Filtern',
			en: 'No projects match the current filters'
		},
		clearFiltersToSeeAll: {
			de: 'Filter löschen, um alle Projekte zu sehen',
			en: 'Clear filters to see all projects'
		},
		projectCount: {
			singular: { de: 'Projekt', en: 'project' },
			plural: { de: 'Projekte', en: 'projects' }
		},
		locationCount: {
			singular: { de: 'Standort', en: 'location' },
			plural: { de: 'Standorte', en: 'locations' }
		},
		showingFiltered: {
			de: 'Zeige {filtered} von {total} Projekten auf {locations} {locationType}',
			en: 'Showing {filtered} of {total} projects across {locations} {locationType}'
		},
		showingAll: {
			de: 'Zeige {total} Projekte auf {locations} {locationType}',
			en: 'Showing {total} projects across {locations} {locationType}'
		},
		projectsWithoutLocation: {
			de: '{count} Projekte ohne Standortdaten werden nicht angezeigt',
			en: '{count} projects without location data are not shown'
		},
		error: { de: 'Fehler: {error}', en: 'Error: {error}' }
	},

	// Locations page component
	locations: {
		title: { de: 'Standorte auswählen', en: 'Select Locations' },
		contextsHeading: { de: 'Kontexte', en: 'Contexts' },
		facultiesHeading: { de: 'Fakultäten', en: 'Faculties' },
		coursesHeading: { de: 'Kurse', en: 'Courses' },
		classesHeading: { de: 'Veranstaltungsformen', en: 'Classes' },
		clearSelection: { de: 'Auswahl löschen', en: 'Clear Selection' },
		clearContexts: { de: 'Kontexte löschen', en: 'Clear Contexts' },
		filteredBy: { de: 'Gefiltert nach', en: 'Filtered by' },
		locationSingular: { de: 'Standort', en: 'location' },
		locationPlural: { de: 'Standorte', en: 'locations' },
		contextSingular: { de: 'Kontext', en: 'context' },
		contextPlural: { de: 'Kontexte', en: 'contexts' },
		and: { de: 'und', en: 'and' },
		showing: { de: 'Zeige', en: 'Showing' },
		projectSingular: { de: 'Projekt', en: 'project' },
		projectPlural: { de: 'Projekte', en: 'projects' },
		allLocations: { de: 'Alle Standorte', en: 'All Locations' },
		noProjectsMessage: {
			de: 'Für diesen Standort wurden noch keine Projekte veröffentlicht.',
			en: 'No projects have been published for this location yet.'
		},
		navigateToOverview: {
			de: 'Zur Übersicht wechseln und nach diesem Kontext filtern',
			en: 'Go to overview and filter by this context'
		},
		showProjectsButton: {
			de: 'Projekte zeigen ({count})',
			en: 'Show Projects ({count})'
		},
		mobileViewToggle: {
			left: { de: 'Ortsliste', en: 'Location List' },
			right: { de: 'Karte', en: 'Map' }
		},
		accordion: {
			showOnMap: { de: 'Auf Karte zeigen', en: 'Show on Map' },
			showProjects: { de: 'Projekte zeigen', en: 'Show Projects' }
		},
		locationActionButtons: {
			showOnMap: { de: 'Auf Karte zeigen', en: 'Show on Map' },
			showProjects: { de: 'Projekte zeigen', en: 'Show Projects' },
			showContexts: { de: 'Kontexte zeigen', en: 'Show Contexts' }
		}
	},

	// Page titles
	pages: {
		information: { de: 'Informationen', en: 'Information' },
		overview: { de: 'Projektübersicht', en: 'Projects Overview' },
		timeline: { de: 'Zeitplan', en: 'Timeline' },
		locations: { de: 'Orte', en: 'Locations' },
		title_base: { de: 'UdK Berlin Rundgang 2025', en: 'UdK Berlin Rundgang 2025' }
	}
} as const;

/**
 * Get localized UI text
 */
export function getUIText(
	path: string,
	language: Language,
	variables?: Record<string, string | number>
): string {
	const keys = path.split('.');
	let current: typeof UI_TEXTS | { de?: string; en?: string } | undefined = UI_TEXTS;

	for (const key of keys) {
		current = (current as Record<string, unknown>)?.[key] as typeof current;
		if (!current) {
			console.warn(`Missing UI text for path: ${path}`);
			return path; // Return the path as fallback
		}
	}

	let text = getLocalizedLabel(current as { de?: string; en?: string }, language);

	// Replace variables if provided
	if (variables) {
		for (const [key, value] of Object.entries(variables)) {
			text = text.replace(`{${key}}`, String(value));
		}
	}

	return text;
}
