<script lang="ts">
	import { getUIText } from '$lib/utils/localization';
	import { activeLanguage } from '$lib/stores/language';
</script>

<div class="announcement-container">
	<div class="announcement-content">
		<p>{@html getUIText('announcement.content', $activeLanguage)}</p>
	</div>
</div>

<style lang="scss">
	.announcement-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.announcement-content {
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		text-wrap: balance;
		width: 80vw;
		background: white;
		border: 1px solid black;
		border-radius: $border-radius;
		box-shadow: $paper-shadow-large;
		will-change: transform;
		animation: scroll-float 20s ease-in-out infinite;
		@include desktop {
			width: 25vw;
		}
	}

	@keyframes scroll-float {
		0%,
		100% {
			transform: translateY(-10px) rotate(-1.4deg);
		}
		50% {
			transform: translateY(10px) rotate(1.4deg);
		}
	}

	p {
		padding: 1rem 2ch;
		font-size: $font-medium;

		:global(span) {
			font-weight: bold;
			background-color: $color_day_friday;
			padding: 0.2rem 0.3rem;
		}

		@include desktop {
			// font-size: $font-small;
			padding: 2rem 4ch;
		}
	}
</style>
