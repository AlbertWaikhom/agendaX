import { Database } from '../database';
import { NotificationRecord } from '../../types';

export const NotificationRepository = {
  async getAllNotifications(): Promise<NotificationRecord[]> {
    const db = await Database.getDatabaseAsync();
    const rows = await db.getAllAsync<any>(
      `SELECT id, title, message, type, reference_id, read, timestamp
       FROM notifications ORDER BY timestamp DESC;`
    );

    return rows.map(r => ({
      id: r.id,
      title: r.title,
      message: r.message,
      type: r.type as any,
      referenceId: r.reference_id || undefined,
      read: Boolean(r.read),
      timestamp: r.timestamp,
    }));
  },

  async insertNotification(n: NotificationRecord): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `INSERT INTO notifications (id, title, message, type, reference_id, read, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        n.id,
        n.title,
        n.message,
        n.type,
        n.referenceId || null,
        n.read ? 1 : 0,
        n.timestamp,
      ]
    );
  },

  async markAsRead(id: string): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('UPDATE notifications SET read = 1 WHERE id = ?;', [id]);
  },

  async markAllAsRead(): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('UPDATE notifications SET read = 1;');
  },

  async deleteNotification(id: string): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM notifications WHERE id = ?;', [id]);
  },

  async clearAllNotifications(): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM notifications;');
  },

  async bulkInsertNotifications(list: NotificationRecord[]): Promise<void> {
    if (list.length === 0) return;
    const db = await Database.getDatabaseAsync();
    for (const n of list) {
      await db.runAsync(
        `INSERT OR REPLACE INTO notifications (id, title, message, type, reference_id, read, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          n.id,
          n.title,
          n.message,
          n.type,
          n.referenceId || null,
          n.read ? 1 : 0,
          n.timestamp,
        ]
      );
    }
  },
};
