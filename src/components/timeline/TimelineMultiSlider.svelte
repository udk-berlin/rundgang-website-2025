<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { activeLanguage } from '$lib/stores/language';
	import { getLocalizedDayName, getUIText } from '$lib/utils/localization';
	import { ALL_TIMELINE_DAYS, type TimelineDay } from '$lib/utils/timeline-filter';
	import { fade } from 'svelte/transition';

	export let day: 'friday' | 'saturday' | 'sunday';
	export let selectedRanges: [number, number][] = [];

	const dispatch = createEventDispatcher<{
		change: { day: 'friday' | 'saturday' | 'sunday'; ranges: [number, number][] };
	}>();

	// Get day configuration
	$: dayConfig = ALL_TIMELINE_DAYS.find((d) => d.id === day);
	$: minHour = dayConfig?.fromTime.getHours() || 10;
	$: maxHour = dayConfig?.toTime.getHours() || 24;

	// Generate hour marks - always show 10-24 hours
	$: hours = Array.from({ length: 15 }, (_, i) => 10 + i);

	// Get day-specific color
	$: dayColor = day === 'friday' ? '#ffff33' : day === 'saturday' ? '#685b6f' : '#93996d'; // sunday

	$: markerColor = day === 'friday' ? 'yellow' : day === 'saturday' ? 'purple' : 'olive';
	$: style = `
		--day-color: ${dayColor}; 
		--marker-main: url('/highlighting/textmarker/${markerColor}/textmarker.png');
		--marker-left: url('/highlighting/textmarker/${markerColor}/left-end.png');
		--marker-right: url('/highlighting/textmarker/${markerColor}/right-end.png');
	`;

	let isDragging = false;
	let dragStartHour: number | null = null;
	let dragEndHour: number | null = null;
	let currentDragRange: [number, number] | null = null;
	let hoveredHour: number | null = null;

	function isValidHour(hour: number): boolean {
		return hour >= minHour && hour <= maxHour;
	}

	function handleMouseMove(event: MouseEvent) {
		const container = event.currentTarget as HTMLElement;
		const hour = getHourFromPosition(event, container);
		hoveredHour = hour;
		if (isDragging) {
			updateDrag(event);
		}
	}

	function handleMouseLeave() {
		hoveredHour = null;
	}

	function getHourFromPosition(event: MouseEvent | TouchEvent, container: HTMLElement): number {
		const rect = container.getBoundingClientRect();

		// Handle both mouse and touch events
		let clientX: number;
		if ('touches' in event) {
			// Touch event
			clientX = event.touches[0]?.clientX || (event as any).changedTouches[0]?.clientX || 0;
		} else {
			// Mouse event
			clientX = event.clientX;
		}

		const x = clientX - rect.left;
		const totalWidth = rect.width;
		const hourWidth = totalWidth / 15; // Always 15 hours (10-24)
		const hourIndex = Math.floor(x / hourWidth);
		return Math.max(10, Math.min(24, 10 + hourIndex));
	}

	function startDrag(event: MouseEvent | TouchEvent) {
		const container = event.currentTarget as HTMLElement;
		const hour = getHourFromPosition(event, container);

		// Prevent drag start on invalid hours
		if (!isValidHour(hour)) {
			return;
		}

		isDragging = true;
		dragStartHour = hour;
		dragEndHour = hour;
		currentDragRange = [hour, hour + 1];

		// Prevent default behavior (scrolling on mobile, text selection)
		event.preventDefault();
	}

	function updateDrag(event: MouseEvent | TouchEvent) {
		if (!isDragging || dragStartHour === null) return;

		const container = document.querySelector('.slider-track') as HTMLElement;
		if (!container) return;

		const hour = getHourFromPosition(event, container);

		// Constrain drag to valid hours only
		const constrainedHour = Math.max(minHour, Math.min(maxHour, hour));
		dragEndHour = constrainedHour;

		const start = Math.min(dragStartHour, constrainedHour);
		const end = Math.max(dragStartHour, constrainedHour) + 1;
		currentDragRange = [start, Math.min(end, maxHour + 1)];
	}

	function endDrag() {
		if (!isDragging || !currentDragRange) return;

		isDragging = false;

		// Check if this range overlaps with existing ranges
		const [newStart, newEnd] = currentDragRange;
		let updatedRanges = [...selectedRanges];

		// Remove overlapping ranges and merge
		updatedRanges = updatedRanges.filter(([start, end]) => {
			return !(newStart < end && newEnd > start); // No overlap
		});

		// Add the new range
		updatedRanges.push(currentDragRange);

		// Sort and merge adjacent ranges
		updatedRanges.sort((a, b) => a[0] - b[0]);
		const mergedRanges: [number, number][] = [];

		for (const range of updatedRanges) {
			const lastRange = mergedRanges[mergedRanges.length - 1];
			if (lastRange && lastRange[1] >= range[0]) {
				// Merge with previous range
				lastRange[1] = Math.max(lastRange[1], range[1]);
			} else {
				mergedRanges.push(range);
			}
		}

		dispatch('change', { day, ranges: mergedRanges });

		dragStartHour = null;
		dragEndHour = null;
		currentDragRange = null;
	}

	function removeRange(rangeToRemove: [number, number]) {
		const updatedRanges = selectedRanges.filter(
			(range) => !(range[0] === rangeToRemove[0] && range[1] === rangeToRemove[1])
		);
		dispatch('change', { day, ranges: updatedRanges });
	}

	function clearAll() {
		dispatch('change', { day, ranges: [] });
	}

	function isHourInRange(hour: number): boolean {
		return selectedRanges.some(([start, end]) => hour >= start && hour < end);
	}

	function isHourInDragRange(hour: number): boolean {
		if (!currentDragRange) return false;
		const [start, end] = currentDragRange;
		return hour >= start && hour < end;
	}

	// Handle global mouse and touch events for dragging
	$: if (typeof window !== 'undefined') {
		const handleGlobalMouseMove = (e: MouseEvent) => updateDrag(e);
		const handleGlobalMouseUp = () => endDrag();
		const handleGlobalTouchMove = (e: TouchEvent) => updateDrag(e);
		const handleGlobalTouchEnd = () => endDrag();

		if (isDragging) {
			// Mouse events
			window.addEventListener('mousemove', handleGlobalMouseMove);
			window.addEventListener('mouseup', handleGlobalMouseUp);

			// Touch events
			window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
			window.addEventListener('touchend', handleGlobalTouchEnd);
		}

		// Cleanup function
		const cleanup = () => {
			window.removeEventListener('mousemove', handleGlobalMouseMove);
			window.removeEventListener('mouseup', handleGlobalMouseUp);
			window.removeEventListener('touchmove', handleGlobalTouchMove);
			window.removeEventListener('touchend', handleGlobalTouchEnd);
		};

		// Return cleanup function (this runs when component is destroyed or isDragging changes)
		if (!isDragging) {
			cleanup();
		}
	}
</script>

<svelte:window
	on:mousemove={updateDrag}
	on:mouseup={endDrag}
	on:touchmove={updateDrag}
	on:touchend={endDrag}
/>

<div class="timeline-multislider" {style}>
	<div class="day-header">
		<h3 class={day}>{getLocalizedDayName(day, $activeLanguage)}</h3>
		{#if selectedRanges.length > 0}
			<button class="clear-button" on:click={clearAll}
				>{getUIText('filter.clear', $activeLanguage)}</button
			>
		{/if}
	</div>

	<div class="slider-container">
		<div
			class="slider-track"
			class:cursor-crosshair={hoveredHour !== null && isValidHour(hoveredHour)}
			class:cursor-not-allowed={hoveredHour !== null && !isValidHour(hoveredHour)}
			on:mousedown={startDrag}
			on:touchstart={startDrag}
			on:mousemove={handleMouseMove}
			on:mouseleave={handleMouseLeave}
			role="slider"
			tabindex="0"
			aria-valuenow={selectedRanges.length}
			aria-label={getUIText('timeline.selectTimeRanges', $activeLanguage, {
				day: getLocalizedDayName(day, $activeLanguage)
			})}
		>
			<!-- Hour markers -->
			{#each hours as hour}
				<div
					class="hour-marker"
					class:selected={isHourInRange(hour)}
					class:dragging={isHourInDragRange(hour)}
					class:invalid={!isValidHour(hour)}
				>
					<span
						class="hour-label"
						class:friday={day === 'friday'}
						class:saturday={day === 'saturday'}
						class:sunday={day === 'sunday'}
						class:invalid={!isValidHour(hour)}>{hour}</span
					>
				</div>
			{/each}

			<!-- Selected ranges overlay -->
			{#each selectedRanges as [start, end]}
				<div
					class="range-overlay"
					style="left: {((start - 10) / 15) * 100}%; width: {((end - start) / 15) * 100}%;"
					on:click={() => removeRange([start, end])}
					on:keydown={(e) => e.key === 'Enter' && removeRange([start, end])}
					role="button"
					tabindex="0"
					title={getUIText('timeline.removeRange', $activeLanguage, { start, end })}
				></div>
			{/each}

			<!-- Current drag range -->
			{#if currentDragRange}
				{@const [start, end] = currentDragRange}
				<div
					class="drag-overlay"
					transition:fade={{ duration: 300 }}
					style="left: {((start - 10) / 15) * 100}%; width: {((end - start) / 15) * 100}%;"
				></div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.timeline-multislider {
		margin-bottom: 1.5rem;
	}

	.day-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 0.5rem;

		@include desktop {
			align-items: center;
		}

		h3 {
			margin: 0;
			font-size: 1.25rem; // specific font size but everything else looks weird here
			font-weight: normal;
			padding-top: 0.5rem; // to prevent layout shift when clear button appears (because that is larger)

			@include desktop {
				padding-top: 0;
				font-weight: normal;
				font-size: $font-large;
			}
		}

		.clear-button {
			background: none;
			border: 1px solid rgba($black, 0.3);
			border-radius: 4px;
			padding: 0.25rem 0.5rem;
			font-size: $font-small;
			cursor: pointer;
			transition: all 0.15s ease;

			&:hover {
				background: rgba($black, 0.1);
			}
		}
	}

	.slider-container {
		position: relative;
		border: 1px solid rgba($black, 0.25);
		border-radius: $border-radius;
	}

	.slider-track {
		display: flex;
		height: 2rem;
		background: rgba($black, 0.03);
		border-radius: 4px;
		cursor: crosshair;
		position: relative;
		user-select: none;
		overflow: hidden;
		touch-action: none;

		&.cursor-crosshair {
			cursor: crosshair;
		}

		&.cursor-not-allowed {
			cursor: not-allowed;
		}
	}

	.hour-marker {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border-right: 1px solid rgba($black, 0.25);
		transition: background-color 0.15s ease;
		font-variant-numeric: tabular-nums;
		position: relative;
		z-index: 2;

		&:first-of-type {
			border-left: 1px solid rgba($black, 0.25);
		}

		&.invalid {
			background-color: $grey_medium;
			opacity: 0.2;
			border-color: rgba($black, 0.8);
		}

		&.selected {
			background-color: transparent;
			.friday {
				color: black;
			}
			.saturday {
				color: $white;
			}
			.sunday {
				color: $white;
			}
		}

		&.dragging {
			background-color: transparent;
		}

		.hour-label {
			font-size: $font-small;
			font-weight: bold;
			color: rgba($black, 0.6);
			pointer-events: none;
			transition: color 0.15s ease;

			&.invalid {
				display: none;
			}
		}
	}

	.range-overlay {
		position: absolute;
		top: 0;
		height: 100%;
		background-color: transparent;
		background-image: var(--marker-main);
		background-size: 100% 100%;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
		opacity: 0.9;
		z-index: 1;

		&:hover {
			opacity: 1;
		}

		&::before,
		&::after {
			position: absolute;
			content: '';
			display: block;
			top: 0;
			width: 2rem;
			height: 100%;
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
		}

		&::before {
			left: -1rem;
			top: -0.2rem;
			background-image: var(--marker-left);
		}

		&::after {
			right: -1rem;
			background-image: var(--marker-right);
		}
	}

	.drag-overlay {
		position: absolute;
		top: 0;
		height: 100%;
		background-color: transparent;
		border: 2px solid var(--day-color);
		border-radius: 4px;
		pointer-events: none;
	}

	.hour-labels {
		position: relative;
		height: 1.2rem;
		margin-top: 0.25rem;
		padding: 0 0.25rem;
		font-variant-numeric: tabular-nums;
	}

	.hour-tick {
		position: absolute;
		transform: translateX(-50%);
		font-size: $font-small;
		color: rgba($black, 0.6);
		white-space: nowrap;
	}

	.selected-ranges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.range-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: rgba($color_pink, 0.2);
		border: 1px solid rgba($color_pink, 0.5);
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		font-size: $font-small;

		button {
			background: none;
			border: none;
			cursor: pointer;
			font-weight: bold;
			padding: 0;
			line-height: 1;
			min-width: 16px;
			min-height: 16px;

			&:hover {
				color: $color_pink;
			}
		}
	}

	@include mobile-and-tablet {
		.slider-track {
			height: 2rem;
			cursor: default;
		}

		.hour-marker .hour-label {
			font-size: $font-small;
		}

		.range-tag {
			font-size: $font-small;
			padding: 0.375rem 0.625rem;

			button {
				min-width: 20px;
				min-height: 20px;
				padding: 0.125rem;
			}
		}

		.range-overlay {
			cursor: default;
			height: 110%;

			&::before,
			&::after {
				height: 100%;
			}
		}

		.clear-button {
			min-height: 32px;
			padding: 0.375rem 0.75rem;
		}
	}
</style>
