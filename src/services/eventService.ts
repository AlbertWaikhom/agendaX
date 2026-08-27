import { EventItem, EventRepeat } from '../types';
import { generateUniqueId, getTodayDateString } from '../utils';

export type EventFilter = 'all' | 'this_week' | 'today' | 'upcoming';

export const EventService = {
  createEvent(params: {
    name: string;
    description?: string;
    date: string;
    startTime: string;
    endTime?: string;
    location?: string;
    url?: string;
    reminderEnabled?: boolean;
    reminderTime?: string;
    repeat?: EventRepeat;
    color?: string;
    notificationId?: string;
    imageUri?: string;
  }): EventItem {
    const now = new Date().toISOString();
    return {
      id: generateUniqueId('event'),
      name: params.name.trim(),
      description: params.description?.trim() || '',
      date: params.date || getTodayDateString(),
      startTime: params.startTime || '10:00',
      endTime: params.endTime || '',
      location: params.location?.trim() || '',
      url: params.url?.trim() || '',
      reminderEnabled: !!params.reminderEnabled,
      reminderTime: params.reminderTime || 'none',
      repeat: params.repeat || 'none',
      color: params.color || '#6366F1',
      notificationId: params.notificationId,
      imageUri: params.imageUri,
      createdAt: now,
      updatedAt: now,
    };
  },

  getEventsForDate(events: EventItem[], dateStr: string): EventItem[] {
    return events.filter(e => e.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  getNextUpcomingEvent(events: EventItem[]): EventItem | null {
    const today = getTodayDateString();
    const sorted = [...events]
      .filter(e => e.date >= today)
      .sort((a, b) => {
        const dtA = `${a.date} ${a.startTime}`;
        const dtB = `${b.date} ${b.startTime}`;
        return dtA.localeCompare(dtB);
      });

    return sorted.length > 0 ? sorted[0] : null;
  },

  filterEvents(events: EventItem[], filter: EventFilter, searchQuery: string = ''): EventItem[] {
    const today = getTodayDateString();
    let filtered = [...events];

    if (filter === 'today') {
      filtered = filtered.filter(e => e.date === today);
    } else if (filter === 'upcoming') {
      filtered = filtered.filter(e => e.date >= today);
    } else if (filter === 'this_week') {
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      filtered = filtered.filter(e => e.date >= today && e.date <= nextWeekStr);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q)) ||
          (e.location && e.location.toLowerCase().includes(q))
      );
    }

    // Sort chronologically
    return filtered.sort((a, b) => {
      const dtA = `${a.date} ${a.startTime}`;
      const dtB = `${b.date} ${b.startTime}`;
      return dtA.localeCompare(dtB);
    });
  },

  /**
   * Returns a map of dates having events for calendar marking
   */
  getEventDatesMap(events: EventItem[]): Record<string, boolean> {
    const map: Record<string, boolean> = {};
    for (const e of events) {
      map[e.date] = true;
    }
    return map;
  },
};
