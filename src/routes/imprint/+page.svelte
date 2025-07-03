<script lang="ts">
	import { activeLanguage } from '$lib/stores/language';
	import { getUIText } from '$lib/utils/localization';
	import PaperContainer from '../../components/general/overlay/PaperContainer.svelte';

	interface ApiResponse {
		result: Array<{
			title: string;
			modified: string;
			url: string;
			content: Array<{
				title?: string;
				text?: string;
				content?: string;
				type?: string;
			}>;
		}>;
	}

	interface PageData {
		enData: ApiResponse;
		deData: ApiResponse;
	}

	export let data: PageData;

	$: console.log(data);

	// Function to extract the first two content elements
	function extractContentElements(apiData: ApiResponse) {
		if (!apiData?.result?.length) return { heading: '', content: '' };

		const pageData = apiData.result[0];
		if (!pageData?.content?.length) return { heading: '', content: '' };

		const firstElement = pageData.content[0];
		const secondElement = pageData.content[1];

		// Extract heading (first element)
		let heading = '';
		if (firstElement?.type === 'heading') {
			if (typeof firstElement?.content === 'string') {
				heading = firstElement.content;
			} else if (typeof firstElement?.content === 'object' && firstElement?.content) {
				heading = (firstElement.content as any).text || '';
			}
		}

		// Extract content (second element)
		let content = '';
		if (secondElement) {
			if (typeof secondElement?.content === 'string') {
				content = secondElement.content;
			} else if (typeof secondElement?.content === 'object' && secondElement?.content) {
				content = (secondElement.content as any).text || '';
			}
		}

		return { heading, content };
	}

	// Reactive statement to get content based on current language
	$: contentData =
		$activeLanguage === 'DE'
			? extractContentElements(data.deData)
			: extractContentElements(data.enData);
</script>

<svelte:head>
	<title
		>{getUIText('pages.title_base', $activeLanguage)} - {getUIText(
			'pages.information',
			$activeLanguage
		)}</title
	>
</svelte:head>

<main>
	<PaperContainer fixed={false} staticRotation={1} paddingLeft="6rem">
		<div class="content-container">
			<h1>{@html contentData.heading}</h1>
			<div class="content-text">
				{@html contentData.content}
			</div>
		</div>
	</PaperContainer>
</main>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: $body-header-spacing $body-padding-h-desktop;
	}

	.content-container {
		width: 100%;

		@include desktop {
			width: 50%;
		}
	}

	.content-text {
		margin-top: 2rem;
		text-align: left;

		:global(p) {
			margin-bottom: 1rem;
		}

		:global(p:last-of-type) {
			margin-bottom: 0;
		}
	}

	h1 {
		text-align: left;
		font-size: $font-xlarge;
		font-weight: 700;
	}
</style>
