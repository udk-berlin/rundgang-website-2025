// Migration: Use new API layer
import { filtersService } from '../api/services';
import { setFilterData, setFilterLoading } from '../stores/filter';

let isInitialized = false;

export async function initializeFilters(): Promise<void> {
	// Prevent multiple initializations
	if (isInitialized) {
		return;
	}

	isInitialized = true;

	try {
		setFilterLoading(true);

		const filterData = await filtersService.fetchAll();
		setFilterData(filterData);

		// console.log('Filter data initialized successfully');
	} catch (error) {
		// console.error('Failed to initialize filter data:', error);
		setFilterLoading(false);
	}
}
