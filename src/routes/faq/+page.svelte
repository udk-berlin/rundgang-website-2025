<script lang="ts">
	import { activeLanguage } from '$lib/stores/language';
	import { getUIText } from '$lib/utils/localization';
	import AccordionList from '../../components/general/accordion/AccordionList.svelte';
	import MobileViewToggle from '../../components/mobile/MobileViewToggle.svelte';
	import PaperContainer from '../../components/general/overlay/PaperContainer.svelte';
	import { page } from '$app/stores';

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

	// Function to extract accordion data from the API response
	function extractAccordionData(apiData: ApiResponse) {
		if (!apiData?.result?.length) return [];

		const pageData = apiData.result[0];
		if (!pageData?.content?.length) return [];

		// Create a copy of content array without the first element (which is the main content)
		// The content strucuture of the two language version differs, that is why, as a very basic fallback, we start the Accordion list at with or after the first item
		const accordionContent =
			pageData.content[0]?.type === 'text' ? pageData.content.slice(1) : pageData.content;

		// Transform the content blocks into accordion format
		// The accordionContent has alternating elements of type `heading` and type `text`. One pair of each makes up one Accordion item, where the heading is the title and the text is the content
		const accordionData = [];
		for (let i = 0; i < accordionContent.length; i += 2) {
			const titleContent = accordionContent[i].content;
			const titleText =
				typeof titleContent === 'string' ? titleContent : (titleContent as any)?.text || '';

			accordionData.push({
				id: `faq-${i / 2}`,
				title: accordionContent[i].content,
				content: accordionContent[i + 1].content || 'No content available.'
			});
		}
		return accordionData;
	}

	// Function to extract main text content
	function extractMainContent(apiData: ApiResponse): string {
		if (!apiData?.result?.length) return '';

		const pageData = apiData.result[0];
		if (!pageData?.content?.length) return '';

		// Look for main text content - assuming it's the first block or has specific structure
		const firstBlock = pageData.content[0];

		// The content strucuture of the two language version differs, that is why, as a very basic fallback, we return the English version on the German page aswell, as this is missing
		if (firstBlock?.type === 'text') {
			if (typeof firstBlock?.content === 'string') {
				return firstBlock.content;
			} else if (typeof firstBlock?.content === 'object' && firstBlock?.content) {
				return (firstBlock.content as any).text || '';
			}
			return firstBlock?.text || '';
		} else {
			return 'The Berlin University of the Arts invites you to the Rundgang – Open Days from 18 to 20 July 2025. Workshops, studios and rehearsal rooms of the colleges of Fine Arts, Architecture, Media and Design, Music and Performing Arts as well as the Jazz Institute Berlin and the Berlin Career College open their doors at the end of the academic year. From painting, sculpture, and performance to design sketches, fashion shows, and film screenings to concerts, dance, and sound installations, students will show the results and processes of their artistic work. Everyone who would like to get to know the University as a place of encounter and discourse for the arts and sciences is invited to the Rundgang - Open Days. In addition, a wide range of advisory services offers prospective students a concrete insight into the diverse range of courses offered by the Berlin University of the Arts.';
		}
	}

	// Reactive statement to get accordion data based on current language
	$: accordionData =
		$activeLanguage === 'DE'
			? extractAccordionData(data.deData)
			: extractAccordionData(data.enData);

	// Reactive statement to get main content based on current language
	$: mainContent =
		$activeLanguage === 'DE' ? extractMainContent(data.deData) : extractMainContent(data.enData);
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
	<MobileViewToggle
		titles={{
			left: getUIText('pages.information', $activeLanguage),
			right: 'FAQ'
		}}
		leftPanelRatio={0.5}
	>
		<div slot="left" class="about-container">
			<PaperContainer staticRotation={1.5} height="auto" padding="0" width="50%" vertical="top">
				<div class="about-content">
					<h1>
						{getUIText('pages.information', $activeLanguage)}
					</h1>
					<p>{@html mainContent}</p>
				</div>
			</PaperContainer>
		</div>

		<div slot="right" class="info-container">
			<AccordionList items={accordionData}>
				<div slot="head" let:item>
					<h5>{@html item.title.text}</h5>
				</div>

				<div slot="details" let:item class="info-content">
					<p>{@html item.content.text}</p>
				</div>
			</AccordionList>
		</div>
	</MobileViewToggle>
</main>

<style lang="scss">
	main {
		height: 100vh;
		overflow: hidden;
	}

	.about-container,
	.info-container {
		padding: $body-header-spacing $body-padding-h-desktop;
		height: 100%;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.about-content {
		padding: 2rem;
		text-align: left;

		:global(p) {
			margin-bottom: 1rem;
		}

		:global(p:last-of-type) {
			margin-bottom: 0;
		}

		@include mobile-only {
			width: 100vw;
		}
	}

	.info-content {
		text-align: left;

		:global(p) {
			margin-bottom: 1rem;
		}

		:global(p:last-of-type) {
			margin-bottom: 0;
		}
	}

	h5 {
		text-align: left;
		font-size: $font-large;
		font-weight: 700;
	}
</style>
