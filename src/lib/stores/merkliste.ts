import { writable, derived, readable } from 'svelte/store';
import { AppStorage } from '../utils/app-storage';
import { projectsService } from '../api';
import { activeLanguage } from './language';
import type { Project } from '../api/types/projects';

interface MerkelisteState {
	isOpen: boolean;
	savedProjects: string[];
}

interface MerkelisteProjectsState {
	projects: Project[];
	loading: boolean;
	error: string | null;
}

interface CachedData {
	data: string[];
	timestamp: number;
}

const STORAGE_KEY = 'rg-25-merkliste';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

async function getStoredProjects(): Promise<string[]> {
	if (typeof window === 'undefined') return [];

	try {
		const stored = await AppStorage.getItem(STORAGE_KEY);
		if (!stored) return [];

		const cachedData: CachedData = JSON.parse(stored);
		const now = Date.now();

		if (now - cachedData.timestamp > CACHE_DURATION) {
			await AppStorage.removeItem(STORAGE_KEY);
			return [];
		}

		return cachedData.data || [];
	} catch (error) {
		// console.error('Error loading Merkeliste from AppStorage:', error);
		await AppStorage.removeItem(STORAGE_KEY).catch(() => {
			// Ignore errors when trying to remove invalid data
		});
		return [];
	}
}

const initialState: MerkelisteState = {
	isOpen: false,
	savedProjects: []
};

export const merkelisteStore = writable<MerkelisteState>(initialState);

// Initialize with stored data if in browser
if (typeof window !== 'undefined') {
	getStoredProjects()
		.then((savedProjects) => {
			merkelisteStore.update((state) => ({
				...state,
				savedProjects
			}));
		})
		.catch((error) => {
			// console.error('Failed to initialize merkliste from storage:', error);
		});
}

export const savedProjectsCount = derived(merkelisteStore, ($store) => {
	return $store?.savedProjects?.length || 0;
});

// Derived store that automatically fetches full project data
export const merkelisteProjects = derived(
	[merkelisteStore, activeLanguage],
	([$merkeliste, $language], set) => {
		const projectIds = $merkeliste?.savedProjects || [];

		// Set initial loading state
		set({
			projects: [],
			loading: projectIds.length > 0,
			error: null
		} as MerkelisteProjectsState);

		// If no projects, return empty state
		if (projectIds.length === 0) {
			set({
				projects: [],
				loading: false,
				error: null
			} as MerkelisteProjectsState);
			return;
		}

		// Fetch projects
		Promise.all(
			projectIds.map(async (id) => {
				try {
					return await projectsService.fetchById(id, $language);
				} catch (err) {
					// console.warn(`Failed to load project with id ${id}:`, err);
					return null;
				}
			})
		)
			.then((loadedProjects) => {
				const validProjects: Project[] = loadedProjects.filter(
					(project): project is Project => project !== null
				);
				set({
					projects: validProjects,
					loading: false,
					error:
						validProjects.length === 0 && projectIds.length > 0
							? ('No saved projects could be loaded' as string)
							: null
				} as MerkelisteProjectsState);
			})
			.catch((error) => {
				// console.error('Failed to load merkliste projects:', error);
				set({
					projects: [],
					loading: false,
					error: 'Failed to load saved projects'
				} as MerkelisteProjectsState);
			});
	},
	{
		projects: [],
		loading: false,
		error: null
	} as MerkelisteProjectsState
);

if (typeof window !== 'undefined') {
	merkelisteStore.subscribe((state) => {
		if (!state) return;

		const cachedData: CachedData = {
			data: state.savedProjects || [],
			timestamp: Date.now()
		};

		AppStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData)).catch((error) => {
			// console.error('Failed to save merkliste to storage:', error);
		});
	});
}

export function openMerkeliste() {
	merkelisteStore.update((state) => ({
		...state,
		isOpen: true
	}));
}

export function closeMerkeliste() {
	merkelisteStore.update((state) => ({
		...state,
		isOpen: false
	}));
}

export function toggleMerkeliste() {
	merkelisteStore.update((state) => ({
		...state,
		isOpen: !state.isOpen
	}));
}

export function addToMerkeliste(projectId: string) {
	merkelisteStore.update((state) => {
		if (!state || state.savedProjects.includes(projectId)) {
			return state;
		}
		return {
			...state,
			savedProjects: [...state.savedProjects, projectId]
		};
	});
}

export function removeFromMerkeliste(projectId: string) {
	merkelisteStore.update((state) => {
		if (!state) return state;
		console.log('State:', state);
		return {
			...state,
			savedProjects: state.savedProjects.filter((id) => id !== projectId)
		};
	});
}

// Debug function to clear Merkeliste cache (for development/testing)
export async function clearMerkelisteCache() {
	if (typeof window !== 'undefined') {
		try {
			await AppStorage.removeItem(STORAGE_KEY);
			merkelisteStore.set({
				isOpen: false,
				savedProjects: []
			});
		} catch (error) {
			// console.error('Failed to clear merkliste cache:', error);
		}
	}
}
