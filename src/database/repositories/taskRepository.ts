import { Database } from '../database';
import { TaskItem } from '../../types';

export const TaskRepository = {
  async getAllTasks(): Promise<TaskItem[]> {
    const db = await Database.getDatabaseAsync();
    const rows = await db.getAllAsync<any>(
      `SELECT id, title, description, category, priority, due_date, due_time, url,
              reminder_enabled, reminder_time, notification_id, completed, completed_at,
              created_at, updated_at
       FROM tasks ORDER BY created_at DESC;`
    );

    return rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description || undefined,
      category: r.category,
      priority: r.priority,
      dueDate: r.due_date,
      dueTime: r.due_time || undefined,
      url: r.url || undefined,
      reminderEnabled: Boolean(r.reminder_enabled),
      reminderTime: r.reminder_time || undefined,
      notificationId: r.notification_id || undefined,
      completed: Boolean(r.completed),
      completedAt: r.completed_at || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async insertTask(task: TaskItem): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `INSERT INTO tasks (
         id, title, description, category, priority, due_date, due_time, url,
         reminder_enabled, reminder_time, notification_id, completed, completed_at,
         created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        task.id,
        task.title,
        task.description || null,
        task.category,
        task.priority,
        task.dueDate,
        task.dueTime || null,
        task.url || null,
        task.reminderEnabled ? 1 : 0,
        task.reminderTime || null,
        task.notificationId || null,
        task.completed ? 1 : 0,
        task.completedAt || null,
        task.createdAt,
        task.updatedAt,
      ]
    );
  },

  async updateTask(task: TaskItem): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync(
      `UPDATE tasks SET
         title = ?, description = ?, category = ?, priority = ?, due_date = ?, due_time = ?, url = ?,
         reminder_enabled = ?, reminder_time = ?, notification_id = ?, completed = ?, completed_at = ?,
         updated_at = ?
       WHERE id = ?;`,
      [
        task.title,
        task.description || null,
        task.category,
        task.priority,
        task.dueDate,
        task.dueTime || null,
        task.url || null,
        task.reminderEnabled ? 1 : 0,
        task.reminderTime || null,
        task.notificationId || null,
        task.completed ? 1 : 0,
        task.completedAt || null,
        task.updatedAt,
        task.id,
      ]
    );
  },

  async deleteTask(id: string): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM tasks WHERE id = ?;', [id]);
  },

  async bulkInsertTasks(tasks: TaskItem[]): Promise<void> {
    if (tasks.length === 0) return;
    const db = await Database.getDatabaseAsync();
    for (const task of tasks) {
      await db.runAsync(
        `INSERT OR REPLACE INTO tasks (
           id, title, description, category, priority, due_date, due_time, url,
           reminder_enabled, reminder_time, notification_id, completed, completed_at,
           created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          task.id,
          task.title,
          task.description || null,
          task.category,
          task.priority,
          task.dueDate,
          task.dueTime || null,
          task.url || null,
          task.reminderEnabled ? 1 : 0,
          task.reminderTime || null,
          task.notificationId || null,
          task.completed ? 1 : 0,
          task.completedAt || null,
          task.createdAt,
          task.updatedAt,
        ]
      );
    }
  },

  async clearAllTasks(): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM tasks;');
  },

  async countTasks(): Promise<number> {
    const db = await Database.getDatabaseAsync();
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks;');
    return result?.count || 0;
  },
};
