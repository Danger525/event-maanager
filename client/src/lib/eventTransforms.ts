import type { Event } from '@/types/event';
import type { ApiEvent } from '@/types/api';

export const toEventCardEvent = (event: ApiEvent): Event => ({
  ...event,
  id: event._id,
  registered: event.registeredCount,
});

