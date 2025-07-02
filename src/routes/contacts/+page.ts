// make request to /static-pages/faq

interface ApiResponse {
	result: Array<{
		title: string;
		modified: string;
		url: string;
		content: Array<{
			title?: string;
			text?: string;
			content?: string;
		}>;
	}>;
}

interface PageData {
	enData: ApiResponse;
	deData: ApiResponse;
}

export const load = async ({ fetch }): Promise<PageData> => {
	const response = await fetch(`/api/static-pages/kontakt`);

	if (!response.ok) {
		throw new Error('Failed to fetch FAQ data');
	}

	const { enData, deData } = await response.json();

	return {
		enData: enData,
		deData: deData
	};
};
