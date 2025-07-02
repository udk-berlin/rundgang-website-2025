<script lang="ts">
	import { activeLanguage } from '$lib/stores/language';
	import { getUIText } from '$lib/utils/localization';
	import AccordionList from '../../components/general/accordion/AccordionList.svelte';
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

	$: console.log(data);

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
		return accordionContent.map((block, index) => ({
			id: `faq-${index}`,
			title: block.title || `FAQ Item ${index + 1}`,
			content: block.text || block.content || 'No content available.'
		}));
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

	// Fallback accordion data in case API data is not available
	const fallbackAccordionData = [
		{
			id: 'accessibility',
			title: 'Accessibility',
			content: 'Content about accessibility information goes here.'
		},
		{
			id: 'admission',
			title: 'Admission',
			content: 'Content about admission information goes here.'
		},
		{
			id: 'arrival',
			title: 'Arrival',
			content: 'Content about arrival information goes here.'
		},
		{
			id: 'awareness',
			title: 'Awareness',
			content: 'Content about awareness information goes here.'
		},
		{
			id: 'fire-protection',
			title: 'Fire protection, evacuation, escape routes',
			content: 'Content about fire protection, evacuation, and escape routes goes here.'
		},
		{
			id: 'food-beverages',
			title: 'Food & Beverages',
			content: 'Content about food and beverages goes here.'
		},
		{
			id: 'further-information',
			title: 'Further Information',
			content: 'Content about further information goes here.'
		},
		{
			id: 'lost-found',
			title: 'Lost & Found',
			content: 'Content about lost and found goes here.'
		},
		{
			id: 'opening-event',
			title: 'Opening Event',
			content: 'Content about the opening event goes here.'
		},
		{
			id: 'opening-hours',
			title: 'Opening hours',
			content: 'Content about opening hours goes here.'
		},
		{
			id: 'payment',
			title: 'Payment',
			content: 'Content about payment information goes here.'
		},
		{
			id: 'press-communication',
			title: 'Press and Communication',
			content: 'Content about press and communication goes here.'
		},
		{
			id: 'programm',
			title: 'Programm',
			content: 'Content about the program goes here.'
		},
		{
			id: 'recycling',
			title: 'Recycling',
			content: 'Content about recycling information goes here.'
		},
		{
			id: 'registration',
			title: 'Registration',
			content: 'Content about registration goes here.'
		},
		{
			id: 'reservierung',
			title: 'Reservierung',
			content: 'Content about reservations goes here.'
		},
		{
			id: 'safety',
			title: 'Safety',
			content: 'Content about safety information goes here.'
		},
		{
			id: 'wristbands',
			title: 'Wristbands',
			content: 'Content about wristbands goes here.'
		}
	];

	const fallbackMainContent = `From the 18th to the 20th of July, the Berlin University of the Arts invites you to the Rundgang
		– Open Days. Workshops, studios and rehearsal rooms of the colleges of Fine Arts, Architecture, Media
		and Design, Music and Performing Arts as well as the Inter-University Centre for Dance Berlin, the
		Jazz Institute Berlin and the Berlin Career College open their doors at the end of the academic year.
		From painting, sculpture, and performance to design sketches, fashion shows, and film screenings
		to concerts, dance, and sound installations, students will show the results and processes of their
		artistic work. Everyone who would like to get to know the University as a place of encounter and
		discourse for the arts and sciences is invited to the Rundgang. In addition, a wide range of advisory
		services offers prospective students a concrete insight into the diverse range of courses offered
		by the Berlin University of the Arts.`;

	// Use fallback data if no data is available
	$: finalAccordionData = accordionData.length > 0 ? accordionData : fallbackAccordionData;
	$: finalMainContent = mainContent || fallbackMainContent;
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
	<div class="about-container">
		<h1>
			{getUIText('pages.information', $activeLanguage)}
		</h1>
		<p>{@html finalMainContent}</p>
	</div>
	<div class="info-container">
		<AccordionList items={finalAccordionData}>
			<div slot="head" let:item>
				<h5>{item.title}</h5>
			</div>

			<div slot="details" let:item class="info-content">
				<p>{@html item.content.text}</p>
			</div>
		</AccordionList>
	</div>
</main>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: $body-header-spacing $body-padding-h-desktop;

		& > div {
			width: 100%;

			@include desktop {
				width: 50%;
			}
		}

		@include desktop {
			flex-direction: row;
			flex-wrap: nowrap;
		}
	}

	.info-content {
		text-align: left;
	}

	h5 {
		text-align: left;
		font-size: $font-large;
		font-weight: 700;
	}
</style>
