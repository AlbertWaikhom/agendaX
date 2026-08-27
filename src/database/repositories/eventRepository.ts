import { Database } from '../database';
import { EventItem } from '../../types';

export const EventRepository = {
  async getAllEvents(): Promise<EventItem[]> {
    const db = await Database.getDatabaseAsync();
    const rows = await db.getAllAsync<any>(
      `SELECT id, name, description, date, start_time, end_time, location, url,
              reminder_enabled, reminder_time, repeat, color, notification_id,
              image_uri, created_at, updated_at
       FROM events ORDER BY date ASC, start_time ASC;`
    );

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || undefined,
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time || undefined,
      location: r.location || undefined,
      url: r.url || undefined,
      reminderEnabled: Boolean(r.reminder_enabled),
      reminderTime: r.reminder_time || undefined,
      repeat: r.repeat as any,
      color: r.color,
      notificationId: r.notification_id || undefined,
      imageUri: r.image_uri || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at || undefined,
    }));
  },

  async insertEvent(event: EventItem): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `INSERT INTO events (
         id, name, description, date, start_time, end_time, location, url,
         reminder_enabled, reminder_time, repeat, color, notification_id,
         image_uri, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        event.id,
        event.name,
        event.description || null,
        event.date,
        event.startTime,
        event.endTime || null,
        event.location || null,
        event.url || null,
        event.reminderEnabled ? 1 : 0,
        event.reminderTime || null,
        event.repeat,
        event.color,
        event.notificationId || null,
        event.imageUri || null,
        event.createdAt,
        event.updatedAt || null,
      ]
    );
  },

  async updateEvent(event: EventItem): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `UPDATE events SET
         name = ?, description = ?, date = ?, start_time = ?, end_time = ?,
         location = ?, url = ?, reminder_enabled = ?, reminder_time = ?,
         repeat = ?, color = ?, notification_id = ?, image_uri = ?, updated_at = ?
       WHERE id = ?;`,
      [
        event.name,
        event.description || null,
        event.date,
        event.startTime,
        event.endTime || null,
        event.location || null,
        event.url || null,
        event.reminderEnabled ? 1 : 0,
        event.reminderTime || null,
        event.repeat,
        event.color,
        event.notificationId || null,
        event.imageUri || null,
        event.updatedAt || null,
        event.id,
      ]
    );
  },

  async deleteEvent(id: string): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM events WHERE id = ?;', [id]);
  },

  async bulkInsertEvents(events: EventItem[]): Promise<void> {
    if (events.length === 0) return;
    const db = await Database.getDatabaseAsync();
    for (const e of events) {
      await db.runAsync(
        `INSERT OR REPLACE INTO events (
           id, name, description, date, start_time, end_time, location, url,
           reminder_enabled, reminder_time, repeat, color, notification_id,
           image_uri, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          e.id,
          e.name,
          e.description || null,
          e.date,
          e.startTime,
          e.endTime || null,
          e.location || null,
          e.url || null,
          e.reminderEnabled ? 1 : 0,
          e.reminderTime || null,
          e.repeat,
          e.color,
          e.notificationId || null,
          e.imageUri || null,
          e.createdAt,
          e.updatedAt || null,
        ]
      );
    }
  },

  async clearAllEvents(): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM events;');
  },

  async countEvents(): Promise<number> {
    const db = await Database.getDatabaseAsync();
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM events;');
    return result?.count || 0;
  },
};
