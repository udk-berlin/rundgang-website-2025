<script lang="ts">
	import { activeLanguage } from '../../lib/stores/language';
	import { getUIText } from '../../lib/utils/localization';

	function setLanguage(lang: 'DE' | 'EN') {
		console.log(`LanguageSwitcher: Switching language to: ${lang}`);
		activeLanguage.set(lang);
		console.log(`LanguageSwitcher: Language store updated to: ${lang}`);
	}
</script>

<div>
	<button
		class:active={$activeLanguage === 'DE'}
		onclick={() => setLanguage('DE')}
		aria-label={getUIText('menu.switchToGerman', $activeLanguage)}
		aria-pressed={$activeLanguage === 'DE'}
	>
		DE
	</button>
	<button
		class:active={$activeLanguage === 'EN'}
		onclick={() => setLanguage('EN')}
		aria-label={getUIText('menu.switchToEnglish', $activeLanguage)}
		aria-pressed={$activeLanguage === 'EN'}
	>
		EN
	</button>
</div>

<style>
	div {
		position: relative;
		z-index: 100;
		display: flex;
		flex-direction: row;
		gap: 1ch;
		height: auto;
	}

	button {
		cursor: pointer;
		opacity: 0.5;
		transition: opacity 0.2s ease-in-out;
		align-self: start;
	}

	button.active {
		color: black;
		opacity: 1;
	}

	button:hover:not(.active) {
		opacity: 0.5;
	}
</style>
