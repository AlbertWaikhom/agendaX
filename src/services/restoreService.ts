import { Database } from '../database/database';
import { UserRepository } from '../database/repositories/userRepository';
import { TaskRepository } from '../database/repositories/taskRepository';
import { EventRepository } from '../database/repositories/eventRepository';
import { ExpenseRepository } from '../database/repositories/expenseRepository';
import { UrlRepository } from '../database/repositories/urlRepository';
import { NotificationRepository } from '../database/repositories/notificationRepository';
import { SettingsRepository } from '../database/repositories/settingsRepository';
import { AttachmentRepository } from '../database/repositories/attachmentRepository';
import { WorkspaceData, TaskItem, EventItem, ExpenseItem, UrlItem } from '../types';

export interface RestoreResult {
  success: boolean;
  imported: {
    tasks: number;
    events: number;
    expenses: number;
    urls: number;
    notifications: number;
  };
  skippedDuplicates?: number;
  error?: string;
}

export const RestoreService = {
  /**
   * Merge imported data with existing SQLite data (skipping or adding unique items)
   */
  async mergeWorkspaceData(incoming: WorkspaceData): Promise<RestoreResult> {
    const counts = { tasks: 0, events: 0, expenses: 0, urls: 0, notifications: 0 };
    let skipped = 0;

    try {
      await Database.withTransactionAsync(async () => {
        // 1. Merge User (only if no existing user)
        const currentUser = await UserRepository.getUser();
        if (!currentUser && incoming.user) {
          await UserRepository.setUser(incoming.user);
        }

        // 2. Merge Tasks
        const existingTasks = await TaskRepository.getAllTasks();
        const existingTaskIds = new Set(existingTasks.map(t => t.id));
        const tasksToInsert: TaskItem[] = [];

        for (const task of incoming.tasks || []) {
          if (existingTaskIds.has(task.id)) {
            skipped++;
          } else {
            tasksToInsert.push(task);
            counts.tasks++;
          }
        }
        if (tasksToInsert.length > 0) {
          await TaskRepository.bulkInsertTasks(tasksToInsert);
        }

        // 3. Merge Events
        const existingEvents = await EventRepository.getAllEvents();
        const existingEventIds = new Set(existingEvents.map(e => e.id));
        const eventsToInsert: EventItem[] = [];

        for (const evt of incoming.events || []) {
          if (existingEventIds.has(evt.id)) {
            skipped++;
          } else {
            eventsToInsert.push(evt);
            counts.events++;
          }
        }
        if (eventsToInsert.length > 0) {
          await EventRepository.bulkInsertEvents(eventsToInsert);
        }

        // 4. Merge Expenses
        const existingExpenses = await ExpenseRepository.getAllExpenses();
        const existingExpenseIds = new Set(existingExpenses.map(e => e.id));
        const expensesToInsert: ExpenseItem[] = [];

        for (const exp of incoming.expenses || []) {
          if (existingExpenseIds.has(exp.id)) {
            skipped++;
          } else {
            expensesToInsert.push(exp);
            counts.expenses++;
          }
        }
        if (expensesToInsert.length > 0) {
          await ExpenseRepository.bulkInsertExpenses(expensesToInsert);
        }

        // 5. Merge URLs
        const existingUrls = await UrlRepository.getAllUrls();
        const existingUrlIds = new Set(existingUrls.map(u => u.id));
        const urlsToInsert: UrlItem[] = [];

        for (const u of incoming.urls || []) {
          if (existingUrlIds.has(u.id)) {
            skipped++;
          } else {
            urlsToInsert.push(u);
            counts.urls++;
          }
        }
        if (urlsToInsert.length > 0) {
          await UrlRepository.bulkInsertUrls(urlsToInsert);
        }

        // 6. Merge Notifications
        if (incoming.notifications && incoming.notifications.length > 0) {
          await NotificationRepository.bulkInsertNotifications(incoming.notifications);
          counts.notifications = incoming.notifications.length;
        }

        // 7. Merge Attachments if provided
        if (incoming.attachments && incoming.attachments.length > 0) {
          await AttachmentRepository.bulkInsertAttachments(incoming.attachments);
        }
      });

      return {
        success: true,
        imported: counts,
        skippedDuplicates: skipped,
      };
    } catch (e: any) {
      console.error('[RestoreService] Merge failed:', e);
      return {
        success: false,
        imported: counts,
        error: e?.message || 'Merge failed',
      };
    }
  },

  /**
   * Replace all SQLite workspace data atomically with backup data
   */
  async replaceWorkspaceData(incoming: WorkspaceData): Promise<RestoreResult> {
    const counts = {
      tasks: incoming.tasks?.length || 0,
      events: incoming.events?.length || 0,
      expenses: incoming.expenses?.length || 0,
      urls: incoming.urls?.length || 0,
      notifications: incoming.notifications?.length || 0,
    };

    try {
      await Database.withTransactionAsync(async () => {
        // Clear existing tables
        await UserRepository.setUser(null);
        await TaskRepository.clearAllTasks();
        await EventRepository.clearAllEvents();
        await ExpenseRepository.clearAllExpenses();
        await UrlRepository.clearAllUrls();
        await NotificationRepository.clearAllNotifications();

        // Insert new data
        if (incoming.user) {
          await UserRepository.setUser(incoming.user);
        }
        if (incoming.tasks?.length) {
          await TaskRepository.bulkInsertTasks(incoming.tasks);
        }
        if (incoming.events?.length) {
          await EventRepository.bulkInsertEvents(incoming.events);
        }
        if (incoming.expenses?.length) {
          await ExpenseRepository.bulkInsertExpenses(incoming.expenses);
        }
        if (incoming.urls?.length) {
          await UrlRepository.bulkInsertUrls(incoming.urls);
        }
        if (incoming.notifications?.length) {
          await NotificationRepository.bulkInsertNotifications(incoming.notifications);
        }
        if (incoming.settings) {
          await SettingsRepository.setAllSettings(incoming.settings);
        }
        if (incoming.attachments?.length) {
          await AttachmentRepository.bulkInsertAttachments(incoming.attachments);
        }
      });

      return {
        success: true,
        imported: counts,
      };
    } catch (e: any) {
      console.error('[RestoreService] Replace failed:', e);
      return {
        success: false,
        imported: { tasks: 0, events: 0, expenses: 0, urls: 0, notifications: 0 },
        error: e?.message || 'Replace restore failed',
      };
    }
  },
};
