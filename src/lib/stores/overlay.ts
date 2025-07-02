import { writable } from 'svelte/store';
import type { Project } from '../api/types/projects';
import { goto } from '$app/navigation';

interface ProjectOverlayState {
	isOpen: boolean;
	project: Project | null;
}

const initialState: ProjectOverlayState = {
	isOpen: false,
	project: null
};

export const overlayStore = writable<ProjectOverlayState>(initialState);

export function openProjectOverlay(project: Project) {
	overlayStore.set({
		isOpen: true,
		project
	});
	// navigate to projects/[project.id] and add to the url
	goto(`/projects/${project.id}`);
}

export function closeProjectOverlay() {
	overlayStore.set({
		isOpen: false,
		project: null
	});
}

// Re-export the Project type for convenience
export type { Project };
