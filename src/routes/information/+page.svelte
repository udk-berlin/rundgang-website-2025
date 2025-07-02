<script lang="ts">
	import { activeLanguage } from '$lib/stores/language';
	import { getUIText } from '$lib/utils/localization';
	import AccordionList from '../../components/general/accordion/AccordionList.svelte';

	const accordionData = [
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
		From the 18th to the 20th of July, the Berlin University of the Arts invites you to the Rundgang
		– Open Days. Workshops, studios and rehearsal rooms of the colleges of Fine Arts, Architecture, Media
		and Design, Music and Performing Arts as well as the Inter-University Centre for Dance Berlin, the
		Jazz Institute Berlin and the Berlin Career College open their doors at the end of the academic year.
		From painting, sculpture, and performance to design sketches, fashion shows, and film screenings
		to concerts, dance, and sound installations, students will show the results and processes of their
		artistic work. Everyone who would like to get to know the University as a place of encounter and
		discourse for the arts and sciences is invited to the Rundgang. In addition, a wide range of advisory
		services offers prospective students a concrete insight into the diverse range of courses offered
		by the Berlin University of the Arts.
	</div>
	<div class="info-container">
		<AccordionList items={accordionData}>
			<div slot="head" let:item>
				<h5>{item.title}</h5>
			</div>

			<div slot="details" let:item class="info-content">
				<p>{item.content}</p>
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
