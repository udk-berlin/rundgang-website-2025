<script>
	import HeaderBlur from '../HeaderBlur.svelte';
	import { toggleMerkeliste, savedProjectsCount } from '$lib/stores/merkliste';
	import { activeLanguage } from '$lib/stores/language';
	import { getUIText } from '$lib/utils/localization';
	import MerkelisteOverlay from '../MerkelisteOverlay.svelte';
	import LanguageSwitcher from '../LanguageSwitcher.svelte';
	import Overlay from '../overlay/Overlay.svelte';

	import { page } from '$app/state';

	export let isMenuOpen;
	export let toggleMenu = () => {};

	function handleMerkelisteClick() {
		toggleMerkeliste();
	}
</script>

{#snippet menuItems()}
	<!-- <a href="/overview" class:active={page.url.pathname === '/overview'}
		>{getUIText('menu.overview', $activeLanguage)}</a
	> -->
	<a href="/locations" class:active={page.url.pathname === '/locations'}
		>{getUIText('menu.locations', $activeLanguage)}</a
	>
	<a href="/timeline" class:active={page.url.pathname === '/timeline'}
		>{getUIText('menu.timeline', $activeLanguage)}</a
	>
	<a href="/faq" class:active={page.url.pathname === '/faq'}
		>{getUIText('menu.faq', $activeLanguage)}</a
	>

	<div class="footer-menu">
		<a href="/imprint">
			{getUIText('menu.impressum', $activeLanguage)}
		</a>
		<a href="/contacts">
			{getUIText('menu.contacts', $activeLanguage)}
		</a>
	</div>

	<LanguageSwitcher />
	<button on:click={handleMerkelisteClick}>
		{getUIText('menu.merkliste', $activeLanguage)}
		<span class="count"> ({$savedProjectsCount}) </span>
	</button>
{/snippet}

<!-- Mobile: Show menu in overlay -->
<div class="mobile-menu">
	{#if $isMenuOpen}
		<Overlay
			isOpen={$isMenuOpen}
			horizontal="right"
			vertical="center"
			height="full"
			staticRotation={-1.5}
			on:close={toggleMenu}
			showCloseButton={false}
		>
			<header>
				<nav class:is-open={true}>
					{@render menuItems()}
				</nav>
				<!-- <HeaderBlur /> -->
			</header>
		</Overlay>
	{/if}
</div>

<!-- Desktop: Show menu directly -->
<div class="desktop-menu">
	<header>
		<nav>
			{@render menuItems()}
		</nav>
		<HeaderBlur />
	</header>
</div>

<MerkelisteOverlay />

<style lang="scss">
	.mobile-menu {
		position: fixed;
		z-index: 1000;

		@include desktop {
			display: none;
		}
	}

	.footer-menu {
		display: flex;
		flex-flow: column nowrap;
		align-items: flex-end;

		@include desktop {
			position: fixed;
			bottom: 5px;
			right: $body-padding-h-desktop;
			flex-flow: row nowrap;
			justify-content: space-between;
		}
	}

	.desktop-menu {
		@include mobile-and-tablet {
			display: none;
		}
	}

	@include mobile-and-tablet {
		:global(.mobile-menu .overlay) {
			:global(div.container.height-full) {
				height: fit-content !important;
				width: fit-content !important;
			}
		}
	}

	header {
		@include desktop {
			position: fixed; // on mobile Overlay component is positioned fixed
			top: 0;
			left: 0;
			right: 0;
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: $font-small;
			padding-top: 7px;
			z-index: 100;
		}

		@include mobile-and-tablet {
			width: 100%;
			display: flex;
			justify-content: flex-end;
			align-items: flex-end;
			font-size: $font-small;
			padding: 2rem;
			padding-left: 1.5rem;
			padding-bottom: 1.5rem;
			padding-top: 6rem;
			z-index: 100;
		}

		a,
		button {
			z-index: 100;
		}

		button {
			@include desktop {
				display: flex;
				flex-flow: row nowrap;
				gap: 0.5ch;
			}
		}
	}

	a {
		position: relative;
	}

	a::before {
		@include desktop {
			content: '';
			position: absolute;
			top: -10px;
			left: -10px;
			right: -10px;
			bottom: -10px;
			background-image: url('/highlighting/circled/1.png');
			background-size: 100% 100%;
			background-repeat: no-repeat;
			z-index: -1;
			// mask: conic-gradient(from -90deg, black 0deg, transparent 0deg);
			opacity: 0;
		}
	}

	a.active::before {
		opacity: 1;
		// animation: drawFrame 1.2s ease-out forwards;
	}

	@keyframes drawFrame {
		from {
			mask: conic-gradient(from -90deg, black 0deg, transparent 0deg);
		}
		to {
			mask: conic-gradient(from -90deg, black 360deg, transparent 360deg);
		}
	}

	.count {
		color: $black;
	}

	nav {
		display: flex;

		& {
			@include mobile-and-tablet {
				flex-direction: column;
				justify-content: flex-start;
				align-items: flex-end;
				z-index: 100;
				font-size: $font-large;
				// transform: translateX(100%);
				// transition: transform 0.15s ease-in-out;
			}
		}

		& {
			@include desktop {
				flex-direction: row;
				margin-left: 50%;
				width: 50%;
				justify-content: flex-end;

				a,
				button {
					text-transform: uppercase;
					margin-right: 2ch;
					color: $black;
					@include padding-h($body-padding-h-desktop);

					&:last-child {
						margin-right: 0;
					}
				}
			}
		}

		a.active {
			@include mobile-and-tablet {
				opacity: 1;
				text-decoration: underline;
			}
		}

		&.is-open {
			@include mobile-and-tablet {
				transform: translateX(0);
			}
		}
	}
</style>
