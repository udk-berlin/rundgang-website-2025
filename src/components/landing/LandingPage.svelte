<script lang="ts">
	import { base } from '$app/paths';
	import { onMount, createEventDispatcher } from 'svelte';
	import Logo from './Logo.svelte';
	import FruitCard from '../general/FruitCard.svelte';
	import { getUIText } from '../../lib/utils/localization';
	import { activeLanguage } from '../../lib/stores/language';
	import Announcement from './Announcement.svelte';

	const dispatch = createEventDispatcher();

	// Dispatch content ready event when all essential content has loaded
	onMount(() => {
		// Allow a brief moment for any initial rendering/animations
		const timer = setTimeout(() => {
			dispatch('contentReady');
		}, 100); // Small delay to ensure UI is stable

		return () => clearTimeout(timer);
	});

	// Function to get random arrow number
	function getRandomArrow() {
		const arrowTypes = ['arrow'];
		const type = arrowTypes[Math.floor(Math.random() * arrowTypes.length)];
		const number = Math.floor(Math.random() * 5) + 1;
		return `${type}_${number}`;
	}
</script>

<section class="landing-page">
	<Announcement />
	<div class="content">
		<div class="text-container">
			<div class="logo-container">
				<Logo scale={1} />
			</div>
			<div class="navigation">
				<a href="/locations">
					<img src="{base}/icons/arrows/arrow_6.png" alt="arrow" class="nav-arrow" />
					{getUIText('menu.locations', $activeLanguage)}
				</a>
				<a href="/timeline">
					<img src="{base}/icons/arrows/arrow_6.png" alt="arrow" class="nav-arrow" />
					{getUIText('menu.timeline', $activeLanguage)}
				</a>
				<a href="/faq">
					<img src="{base}/icons/arrows/arrow_6.png" alt="arrow" class="nav-arrow" />
					{getUIText('menu.faq', $activeLanguage)}
				</a>
			</div>
		</div>
		<div class="fruit-card-container">
			<FruitCard animation="click" />
		</div>
	</div>
</section>

<style lang="scss">
	.landing-page {
		height: 80%;
		width: 100%;
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		background-color: $white;
		transition: opacity 0.3s ease-out;
		margin-top: 5vh;

		&.hidden {
			opacity: 0;
			pointer-events: none;
		}
	}

	.content {
		width: 80%;
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10rem;
		align-items: start;
	}

	.text-container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
	}

	.logo-container {
		display: flex;
		align-self: center;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.navigation {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		font-size: $font-large;
		padding-top: 4rem;

		a {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			text-decoration: none;
			color: inherit;
			font-size: $font-large;

			&:hover {
				.nav-arrow {
					transform: translateX(5px);
				}
			}
		}

		.nav-arrow {
			width: 3rem;
			height: auto;
			transition: transform 0.2s ease;
		}
	}

	.fruit-card-container {
		height: 100%;
		max-height: 70vh;

		:global(.video-item) {
			height: inherit;
			max-height: inherit;
		}

		:global(.video-item video) {
			max-height: inherit;
			object-fit: contain;
		}
	}

	@include mobile-and-tablet {
		.logo-container {
			transform: scale(1);
			padding-top: 1rem;
			padding-bottom: 1rem;
		}
		.content {
			display: grid;
			grid-template-columns: 1fr;
			gap: 2rem;
			align-items: start;
		}
		.navigation {
			padding-top: 0;
		}
	}
</style>
