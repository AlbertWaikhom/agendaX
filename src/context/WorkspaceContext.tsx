import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  WorkspaceData,
  LocalUser,
  TaskItem,
  EventItem,
  ExpenseItem,
  UrlItem,
  NoteItem,
  NotificationRecord,
  AppSettings,
  AttachmentItem,
  AttachmentParentType,
} from '../types';
import { defaultSettings } from '../storage/asyncStorage';
import { Database } from '../database/database';
import { UserRepository } from '../database/repositories/userRepository';
import { TaskRepository } from '../database/repositories/taskRepository';
import { EventRepository } from '../database/repositories/eventRepository';
import { ExpenseRepository } from '../database/repositories/expenseRepository';
import { UrlRepository } from '../database/repositories/urlRepository';
import { NoteRepository } from '../database/repositories/noteRepository';
import { NotificationRepository } from '../database/repositories/notificationRepository';
import { SettingsRepository } from '../database/repositories/settingsRepository';
import { AttachmentRepository } from '../database/repositories/attachmentRepository';
import { LegacyMigrationService } from '../services/legacyMigrationService';
import { RestoreService, RestoreResult } from '../services/restoreService';
import { UserService } from '../services/userService';
import { TaskService } from '../services/taskService';
import { EventService } from '../services/eventService';
import { UrlService } from '../services/urlService';
import { NoteService } from '../services/noteService';
import { NotificationService } from '../services/notificationService';
import { BackupService } from '../services/backupService';
import { MediaStorage } from '../storage/mediaStorage';
import { FileStorage } from '../storage/fileStorage';
import { PermissionService } from '../services/permissionService';
import { generateId, getTodayDateString } from '../utils';

interface WorkspaceContextValue {
  isLoading: boolean;
  user: LocalUser | null;
  tasks: TaskItem[];
  events: EventItem[];
  expenses: ExpenseItem[];
  urls: UrlItem[];
  notifications: NotificationRecord[];
  settings: AppSettings;
  unreadNotificationsCount: number;
  initializeUser: (name: string) => Promise<boolean>;
  updateUser: (name: string) => Promise<boolean>;
  updateUserAvatar: (avatarUri: string) => Promise<boolean>;
  removeUserAvatar: () => Promise<boolean>;
  triggerTestNotification: (soundId?: string, soundTitle?: string) => Promise<boolean>;
  addTask: (params: Parameters<typeof TaskService.createTask>[0]) => Promise<TaskItem>;
  updateTask: (task: TaskItem) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTask: (id: string) => Promise<boolean>;
  addEvent: (params: Parameters<typeof EventService.createEvent>[0]) => Promise<EventItem>;
  updateEvent: (event: EventItem) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  addExpense: (params: {
    title: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod?: string;
    notes?: string;
    transactionId?: string;
    receiptUri?: string;
  }) => Promise<ExpenseItem>;
  updateExpense: (expense: ExpenseItem) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  addUrl: (params: { title: string; url: string; category?: string; note?: string; previewImageUri?: string }) => Promise<{ success: boolean; error?: string }>;
  addUrls: (items: Array<{ title: string; url: string; category?: string; note?: string }>) => Promise<{ success: boolean; count: number; error?: string }>;
  updateUrl: (id: string, params: { title: string; url: string; category?: string; note?: string; previewImageUri?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteUrl: (id: string) => Promise<boolean>;
  notes: NoteItem[];
  addNote: (params: Parameters<typeof NoteService.createNote>[0]) => Promise<NoteItem>;
  updateNote: (note: NoteItem) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  togglePinNote: (id: string) => Promise<boolean>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addAttachment: (params: {
    parentType: AttachmentParentType;
    parentId: string;
    sourceUri: string;
    originalFileName: string;
    mimeType: string;
    fileSize?: number;
  }) => Promise<AttachmentItem>;
  deleteAttachment: (attachment: AttachmentItem) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  exportData: () => Promise<{ success: boolean; message?: string; error?: string }>;
  exportZipData: () => Promise<{ success: boolean; message?: string; error?: string }>;
  importMergeData: (data: WorkspaceData) => Promise<RestoreResult>;
  importReplaceData: (data: WorkspaceData) => Promise<RestoreResult>;
  clearWorkspace: () => Promise<boolean>;
  reloadWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await FileStorage.ensureDirectoriesAsync();
      await Database.initDatabaseAsync();
      await LegacyMigrationService.runAutoMigration();
      const [u, t, ev, exp, uList, nList, notifs, s] = await Promise.all([
        UserRepository.getUser(),
        TaskRepository.getAllTasks(),
        EventRepository.getAllEvents(),
        ExpenseRepository.getAllExpenses(),
        UrlRepository.getAllUrls(),
        NoteRepository.getAllNotes(),
        NotificationRepository.getAllNotifications(),
        SettingsRepository.getSettings(),
      ]);

      setUser(u);
      setTasks(t);
      setEvents(ev);
      setExpenses(exp);
      setUrls(uList);
      setNotes(nList);
      setNotifications(notifs);
      setSettings(s || defaultSettings);

      // Proactively request initial app permissions (Notifications, Media Storage)
      PermissionService.requestInitialPermissionsAsync().catch(() => {});
    } catch (e) {
      console.error('[WorkspaceContext] Failed to load SQLite workspace:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Checkpoint SQLite WAL journal to database file whenever app is sent to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        Database.checkpointAsync().catch(() => {});
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);

  const initializeUser = async (name: string): Promise<boolean> => {
    try {
      const newUser = UserService.createLocalUser(name);
      const welcomeNotif = NotificationService.createRecord({
        title: 'Welcome to AgendaX! 🚀',
        message: `Your private local workspace (${newUser.id}) has been created with offline SQLite database.`,
        type: 'system',
      });

      await UserRepository.setUser(newUser);
      await NotificationRepository.insertNotification(welcomeNotif);
      await SettingsRepository.setAllSettings(defaultSettings);

      setUser(newUser);
      setTasks([]);
      setEvents([]);
      setExpenses([]);
      setUrls([]);
      setNotes([]);
      setNotifications([welcomeNotif]);
      setSettings(defaultSettings);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Init user failed:', e);
      return false;
    }
  };

  const updateUser = async (name: string): Promise<boolean> => {
    if (!user) return false;
    const updatedUser: LocalUser = { ...user, name: name.trim() || user.name };
    await UserRepository.updateUser(updatedUser);
    setUser(updatedUser);
    return true;
  };

  const updateUserAvatar = async (avatarUri: string): Promise<boolean> => {
    if (!user) return false;
    const updatedUser: LocalUser = { ...user, avatarUri };
    await UserRepository.updateUser(updatedUser);
    setUser(updatedUser);
    return true;
  };

  const removeUserAvatar = async (): Promise<boolean> => {
    if (!user) return false;
    const updatedUser: LocalUser = { ...user, avatarUri: undefined };
    await UserRepository.updateUser(updatedUser);
    setUser(updatedUser);
    return true;
  };

  const triggerTestNotification = async (soundId: string = 'default', soundTitle?: string): Promise<boolean> => {
    return NotificationService.triggerTestReminder(soundId, soundTitle);
  };
  const addTask = async (params: Parameters<typeof TaskService.createTask>[0]): Promise<TaskItem> => {
    try {
      // Create task item immediately
      const newTask = TaskService.createTask(params);

      // Instant optimistic state update (0ms UI latency)
      setTasks(prev => [newTask, ...prev]);

      // Persist to SQLite
      await TaskRepository.insertTask(newTask);

      // Schedule notification reminder asynchronously in background if enabled
      if (params.reminderEnabled && settings.notificationsEnabled) {
        (async () => {
          try {
            const notificationId = await NotificationService.scheduleReminder({
              title: `Task Reminder: ${params.title}`,
              body: `Due at ${params.dueTime || 'today'} (${params.category || 'General'})`,
              date: params.dueDate || '',
              time: params.dueTime,
              reminderTime: params.reminderTime,
              type: 'task',
              referenceId: newTask.id,
              sound: settings.reminderSound || 'default',
            });
            if (notificationId) {
              const withNotif = { ...newTask, notificationId };
              await TaskRepository.updateTask(withNotif);
              setTasks(prev => prev.map(t => (t.id === newTask.id ? withNotif : t)));
            }
          } catch (notifErr) {
            console.warn('[WorkspaceContext] Background reminder scheduling warning:', notifErr);
          }
        })();
      }

      return newTask;
    } catch (e) {
      console.error('[WorkspaceContext] Add task error:', e);
      throw e;
    }
  };

  const updateTask = async (task: TaskItem): Promise<boolean> => {
    try {
      let notifId = task.notificationId;
      if (task.reminderEnabled && settings.notificationsEnabled) {
        if (notifId) {
          await NotificationService.cancelReminder(notifId);
        }
        notifId = await NotificationService.scheduleReminder({
          title: `Task Reminder: ${task.title}`,
          body: `Due at ${task.dueTime || 'today'}`,
          date: task.dueDate,
          time: task.dueTime,
          reminderTime: task.reminderTime,
          type: 'task',
          referenceId: task.id,
          sound: settings.reminderSound || 'default',
        });
      } else if (notifId) {
        await NotificationService.cancelReminder(notifId);
        notifId = undefined;
      }

      const finalTask = { ...task, notificationId: notifId, updatedAt: new Date().toISOString() };
      // Instant optimistic state update
      setTasks(prev => prev.map(t => (t.id === task.id ? finalTask : t)));
      await TaskRepository.updateTask(finalTask);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Update task error:', e);
      return false;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const target = tasks.find(t => t.id === id);
      // Instant optimistic state update
      setTasks(prev => prev.filter(t => t.id !== id));
      if (target?.notificationId) {
        await NotificationService.cancelReminder(target.notificationId);
      }
      await MediaStorage.deleteAttachmentsForParent('task', id);
      await TaskRepository.deleteTask(id);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Delete task error:', e);
      return false;
    }
  };

  const toggleTask = async (id: string): Promise<boolean> => {
    try {
      let updatedTask: TaskItem | null = null;

      // Immediate optimistic state update
      setTasks(prev => {
        const target = prev.find(t => t.id === id);
        if (!target) return prev;
        const isNowCompleted = !target.completed;
        updatedTask = {
          ...target,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
        return prev.map(t => (t.id === id ? updatedTask! : t));
      });

      if (!updatedTask) return false;

      // Persist to SQLite
      await TaskRepository.updateTask(updatedTask);

      // If marked completed, cancel pending reminder notification
      const taskObj = updatedTask as TaskItem;
      if (taskObj.completed) {
        if (taskObj.notificationId) {
          await NotificationService.cancelReminder(taskObj.notificationId);
        }
      } else if (taskObj.reminderEnabled && settings.notificationsEnabled) {
        // If uncompleted and reminder was enabled, reschedule in background
        (async () => {
          try {
            const notifId = await NotificationService.scheduleReminder({
              title: `Task Reminder: ${taskObj.title}`,
              body: `Due at ${taskObj.dueTime || 'today'}`,
              date: taskObj.dueDate,
              time: taskObj.dueTime,
              reminderTime: taskObj.reminderTime,
              type: 'task',
              referenceId: id,
              sound: settings.reminderSound || 'default',
            });
            if (notifId) {
              const reschedTask = { ...taskObj, notificationId: notifId };
              await TaskRepository.updateTask(reschedTask);
              setTasks(prev => prev.map(t => (t.id === id ? reschedTask : t)));
            }
          } catch (e) {
            console.warn('[WorkspaceContext] Reschedule task reminder error:', e);
          }
        })();
      }

      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Toggle task error:', e);
      return false;
    }
  };

  // --- Event Handlers ---
  const addEvent = async (params: Parameters<typeof EventService.createEvent>[0]): Promise<EventItem> => {
    try {
      const newEvent = EventService.createEvent(params);

      // Instant optimistic state update
      setEvents(prev =>
        [...prev, newEvent].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
      );

      // Persist to SQLite
      await EventRepository.insertEvent(newEvent);

      // Schedule event reminder asynchronously in background if enabled
      if (params.reminderEnabled && settings.notificationsEnabled) {
        (async () => {
          try {
            const notificationId = await NotificationService.scheduleReminder({
              title: `Event: ${params.name}`,
              body: `Starting at ${params.startTime}${params.location ? ` @ ${params.location}` : ''}`,
              date: params.date,
              time: params.startTime,
              reminderTime: params.reminderTime,
              type: 'event',
              referenceId: newEvent.id,
              sound: settings.reminderSound || 'default',
            });
            if (notificationId) {
              const withNotif = { ...newEvent, notificationId };
              await EventRepository.updateEvent(withNotif);
              setEvents(prev => prev.map(e => (e.id === newEvent.id ? withNotif : e)));
            }
          } catch (e) {
            console.warn('[WorkspaceContext] Background event reminder error:', e);
          }
        })();
      }

      return newEvent;
    } catch (e) {
      console.error('[WorkspaceContext] Add event error:', e);
      throw e;
    }
  };

  const updateEvent = async (event: EventItem): Promise<boolean> => {
    try {
      let notifId = event.notificationId;
      if (event.reminderEnabled && settings.notificationsEnabled) {
        if (notifId) {
          await NotificationService.cancelReminder(notifId);
        }
        notifId = await NotificationService.scheduleReminder({
          title: `Event: ${event.name}`,
          body: `Starting at ${event.startTime}`,
          date: event.date,
          time: event.startTime,
          reminderTime: event.reminderTime,
          type: 'event',
          referenceId: event.id,
          sound: settings.reminderSound || 'default',
        });
      } else if (notifId) {
        await NotificationService.cancelReminder(notifId);
        notifId = undefined;
      }

      const finalEvent = { ...event, notificationId: notifId, updatedAt: new Date().toISOString() };
      // Instant optimistic state update
      setEvents(prev => prev.map(e => (e.id === event.id ? finalEvent : e)));
      await EventRepository.updateEvent(finalEvent);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Update event error:', e);
      return false;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    try {
      const target = events.find(e => e.id === id);
      // Instant optimistic state update
      setEvents(prev => prev.filter(e => e.id !== id));
      if (target?.notificationId) {
        await NotificationService.cancelReminder(target.notificationId);
      }
      await MediaStorage.deleteAttachmentsForParent('event', id);
      await EventRepository.deleteEvent(id);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Delete event error:', e);
      return false;
    }
  };

  // --- Expense Handlers ---
  const addExpense = async (params: {
    title: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod?: string;
    notes?: string;
    transactionId?: string;
    receiptUri?: string;
  }): Promise<ExpenseItem> => {
    try {
      const cleanDate = (params.date || getTodayDateString()).trim();
      const newExpense: ExpenseItem = {
        id: generateId('exp'),
        title: params.title.trim(),
        amount: Number(params.amount) || 0,
        category: params.category || 'Other',
        date: cleanDate,
        paymentMethod: (params.paymentMethod as any) || 'Card',
        notes: params.notes?.trim() || undefined,
        transactionId: params.transactionId?.trim() || undefined,
        receiptUri: params.receiptUri,
        createdAt: new Date().toISOString(),
      };

      // Instant optimistic state update
      setExpenses(prev => [newExpense, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
      await ExpenseRepository.insertExpense(newExpense);
      return newExpense;
    } catch (e) {
      console.error('[WorkspaceContext] Add expense error:', e);
      throw e;
    }
  };

  const updateExpense = async (expense: ExpenseItem): Promise<boolean> => {
    try {
      const updatedExpense = { ...expense, updatedAt: new Date().toISOString() };
      // Instant optimistic state update
      setExpenses(prev => prev.map(e => (e.id === expense.id ? updatedExpense : e)).sort((a, b) => b.date.localeCompare(a.date)));
      await ExpenseRepository.updateExpense(updatedExpense);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Update expense error:', e);
      return false;
    }
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      // Instant optimistic state update
      setExpenses(prev => prev.filter(e => e.id !== id));
      await MediaStorage.deleteAttachmentsForParent('expense', id);
      await ExpenseRepository.deleteExpense(id);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Delete expense error:', e);
      return false;
    }
  };

  // --- Note Handlers ---
  const addNote = async (params: Parameters<typeof NoteService.createNote>[0]): Promise<NoteItem> => {
    try {
      const newNote = NoteService.createNote(params);
      // Instant optimistic state update
      setNotes(prev => NoteService.sortNotes([newNote, ...prev]));
      await NoteRepository.insertNote(newNote);
      return newNote;
    } catch (e) {
      console.error('[WorkspaceContext] Add note error:', e);
      throw e;
    }
  };

  const updateNote = async (note: NoteItem): Promise<boolean> => {
    try {
      const updated = { ...note, updatedAt: new Date().toISOString() };
      // Instant optimistic state update
      setNotes(prev => NoteService.sortNotes(prev.map(n => (n.id === note.id ? updated : n))));
      await NoteRepository.updateNote(updated);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Update note error:', e);
      return false;
    }
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    try {
      // Instant optimistic state update
      setNotes(prev => prev.filter(n => n.id !== id));
      await NoteRepository.deleteNote(id);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Delete note error:', e);
      return false;
    }
  };

  const togglePinNote = async (id: string): Promise<boolean> => {
    try {
      let updatedPinned = false;
      setNotes(prev => {
        const target = prev.find(n => n.id === id);
        if (!target) return prev;
        updatedPinned = !target.pinned;
        const updated = { ...target, pinned: updatedPinned, updatedAt: new Date().toISOString() };
        return NoteService.sortNotes(prev.map(n => (n.id === id ? updated : n)));
      });
      await NoteRepository.togglePinNote(id, updatedPinned);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Toggle pin note error:', e);
      return false;
    }
  };

  // --- URL Handlers ---
  const addUrl = async (params: { title: string; url: string; category?: string; note?: string; previewImageUri?: string }) => {
    const result = UrlService.createUrl(params as any);
    if (!result.success || !result.item) {
      return { success: false, error: result.error };
    }
    // Instant optimistic state update
    setUrls(prev => [result.item!, ...prev]);
    await UrlRepository.insertUrl(result.item);
    return { success: true };
  };

  const addUrls = async (items: Array<{ title: string; url: string; category?: string; note?: string }>) => {
    try {
      const validItems: UrlItem[] = [];
      for (const item of items) {
        const res = UrlService.createUrl(item as any);
        if (res.success && res.item) {
          validItems.push(res.item);
        }
      }
      if (validItems.length === 0) {
        return { success: false, count: 0, error: 'No valid URLs provided' };
      }
      // Instant optimistic state update
      setUrls(prev => [...validItems, ...prev]);
      await UrlRepository.bulkInsertUrls(validItems);
      return { success: true, count: validItems.length };
    } catch (e: any) {
      console.error('[WorkspaceContext] Bulk add URLs error:', e);
      return { success: false, count: 0, error: e?.message || 'Failed to save URLs' };
    }
  };

  const updateUrl = async (id: string, params: { title: string; url: string; category?: string; note?: string; previewImageUri?: string }) => {
    const existing = urls.find(u => u.id === id);
    if (!existing) return { success: false, error: 'URL not found' };

    const result = UrlService.updateUrl(existing, params as any);
    if (!result.success || !result.item) {
      return { success: false, error: result.error };
    }

    // Instant optimistic state update
    setUrls(prev => prev.map(u => (u.id === id ? result.item! : u)));
    await UrlRepository.updateUrl(result.item);
    return { success: true };
  };

  const deleteUrl = async (id: string): Promise<boolean> => {
    // Instant optimistic state update
    setUrls(prev => prev.filter(u => u.id !== id));
    await MediaStorage.deleteAttachmentsForParent('url', id);
    await UrlRepository.deleteUrl(id);
    return true;
  };

  // --- Notification Handlers ---
  const markNotificationAsRead = async (id: string) => {
    await NotificationRepository.markAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = async () => {
    await NotificationRepository.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await NotificationRepository.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = async () => {
    await NotificationRepository.clearAllNotifications();
    setNotifications([]);
  };

  // --- Attachments ---
  const addAttachment = async (params: {
    parentType: AttachmentParentType;
    parentId: string;
    sourceUri: string;
    originalFileName: string;
    mimeType: string;
    fileSize?: number;
  }): Promise<AttachmentItem> => {
    return MediaStorage.saveAttachment(params);
  };

  const deleteAttachment = async (attachment: AttachmentItem): Promise<void> => {
    await MediaStorage.deleteAttachment(attachment);
  };

  // --- Settings & Storage ---
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated: AppSettings = { ...settings, ...newSettings };
    await SettingsRepository.updateSettings(newSettings);
    setSettings(updated);
  };

  const exportData = async () => {
    const [allAttachments, freshSettings] = await Promise.all([
      AttachmentRepository.getAllAttachments(),
      SettingsRepository.getSettings(),
    ]);
    const currentWorkspace: WorkspaceData = {
      user,
      tasks,
      events,
      expenses,
      urls,
      notes,
      notifications,
      settings: freshSettings || settings,
      attachments: allAttachments,
    };
    return BackupService.exportBackup(currentWorkspace);
  };

  const exportZipData = async () => {
    const [allAttachments, freshSettings] = await Promise.all([
      AttachmentRepository.getAllAttachments(),
      SettingsRepository.getSettings(),
    ]);
    const currentWorkspace: WorkspaceData = {
      user,
      tasks,
      events,
      expenses,
      urls,
      notes,
      notifications,
      settings: freshSettings || settings,
      attachments: allAttachments,
    };
    return BackupService.exportZipBackup(currentWorkspace);
  };

  const importMergeData = async (data: WorkspaceData): Promise<RestoreResult> => {
    const result = await RestoreService.mergeWorkspaceData(data);
    if (result.success) {
      await loadAll();
    }
    return result;
  };

  const importReplaceData = async (data: WorkspaceData): Promise<RestoreResult> => {
    const result = await RestoreService.replaceWorkspaceData(data);
    if (result.success) {
      await loadAll();
    }
    return result;
  };

  const clearWorkspace = async (): Promise<boolean> => {
    try {
      await UserRepository.setUser(null);
      await TaskRepository.clearAllTasks();
      await EventRepository.clearAllEvents();
      await ExpenseRepository.clearAllExpenses();
      await UrlRepository.clearAllUrls();
      await NoteRepository.clearAllNotes();
      await NotificationRepository.clearAllNotifications();
      await AttachmentRepository.clearAllAttachments();
      await SettingsRepository.setAllSettings(defaultSettings);

      setUser(null);
      setTasks([]);
      setEvents([]);
      setExpenses([]);
      setUrls([]);
      setNotes([]);
      setNotifications([]);
      setSettings(defaultSettings);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Clear workspace failed:', e);
      return false;
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <WorkspaceContext.Provider
      value={{
        isLoading,
        user,
        tasks,
        events,
        expenses,
        urls,
        notes,
        notifications,
        settings,
        unreadNotificationsCount,
        initializeUser,
        updateUser,
        updateUserAvatar,
        removeUserAvatar,
        triggerTestNotification,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addEvent,
        updateEvent,
        deleteEvent,
        addExpense,
        updateExpense,
        deleteExpense,
        addUrl,
        addUrls,
        updateUrl,
        deleteUrl,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        addAttachment,
        deleteAttachment,
        updateSettings,
        exportData,
        exportZipData,
        importMergeData,
        importReplaceData,
        clearWorkspace,
        reloadWorkspace: loadAll,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
