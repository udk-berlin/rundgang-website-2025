// Timeline-specific types

import type { TimelineEventTime } from './kirby';

export interface TimelineEvent {
	day: 'friday' | 'saturday' | 'sunday';
	type: 'allday' | 'datetime' | 'closed' | 'none';
	times?: TimelineEventTime[];
}
