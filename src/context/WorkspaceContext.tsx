import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  WorkspaceData,
  LocalUser,
  TaskItem,
  EventItem,
  ExpenseItem,
  UrlItem,
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
import { NotificationRepository } from '../database/repositories/notificationRepository';
import { SettingsRepository } from '../database/repositories/settingsRepository';
import { AttachmentRepository } from '../database/repositories/attachmentRepository';
import { LegacyMigrationService } from '../services/legacyMigrationService';
import { RestoreService, RestoreResult } from '../services/restoreService';
import { UserService } from '../services/userService';
import { TaskService } from '../services/taskService';
import { EventService } from '../services/eventService';
import { UrlService } from '../services/urlService';
import { NotificationService } from '../services/notificationService';
import { BackupService } from '../services/backupService';
import { MediaStorage } from '../storage/mediaStorage';
import { FileStorage } from '../storage/fileStorage';
import { generateId } from '../utils';

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

  // User/Workspace lifecycle
  initializeUser: (name: string) => Promise<boolean>;
  updateUser: (name: string) => Promise<boolean>;
  updateUserAvatar: (avatarUri: string) => Promise<boolean>;
  removeUserAvatar: () => Promise<boolean>;
  triggerTestNotification: (soundId?: string, soundTitle?: string) => Promise<boolean>;

  // Task Operations
  addTask: (params: Parameters<typeof TaskService.createTask>[0]) => Promise<TaskItem>;
  updateTask: (task: TaskItem) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTask: (id: string) => Promise<boolean>;

  // Event Operations
  addEvent: (params: Parameters<typeof EventService.createEvent>[0]) => Promise<EventItem>;
  updateEvent: (event: EventItem) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;

  // Expense Operations
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

  // URL Operations
  addUrl: (params: { title: string; url: string; category?: string; note?: string; previewImageUri?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUrl: (id: string, params: { title: string; url: string; category?: string; note?: string; previewImageUri?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteUrl: (id: string) => Promise<boolean>;

  // Notification Operations
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Attachments
  addAttachment: (params: {
    parentType: AttachmentParentType;
    parentId: string;
    sourceUri: string;
    originalFileName: string;
    mimeType: string;
    fileSize?: number;
  }) => Promise<AttachmentItem>;
  deleteAttachment: (attachment: AttachmentItem) => Promise<void>;

  // Settings & Storage
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
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Initialize file storage & directories
      await FileStorage.ensureDirectoriesAsync();

      // 2. Initialize database
      await Database.initDatabaseAsync();

      // 3. Run auto legacy migration if needed
      await LegacyMigrationService.runAutoMigration();

      // 4. Load all records from SQLite
      const [u, t, ev, exp, uList, notifs, s] = await Promise.all([
        UserRepository.getUser(),
        TaskRepository.getAllTasks(),
        EventRepository.getAllEvents(),
        ExpenseRepository.getAllExpenses(),
        UrlRepository.getAllUrls(),
        NotificationRepository.getAllNotifications(),
        SettingsRepository.getSettings(),
      ]);

      setUser(u);
      setTasks(t);
      setEvents(ev);
      setExpenses(exp);
      setUrls(uList);
      setNotifications(notifs);
      setSettings(s || defaultSettings);
    } catch (e) {
      console.error('[WorkspaceContext] Failed to load SQLite workspace:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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

  // --- Task Handlers ---
  const addTask = async (params: Parameters<typeof TaskService.createTask>[0]): Promise<TaskItem> => {
    let notificationId: string | undefined;

    if (params.reminderEnabled && settings.notificationsEnabled) {
      notificationId = await NotificationService.scheduleReminder({
        title: `Task Reminder: ${params.title}`,
        body: `Due at ${params.dueTime || 'today'} (${params.category || 'General'})`,
        date: params.dueDate || '',
        time: params.dueTime,
        reminderTime: params.reminderTime,
        type: 'task',
        referenceId: '',
      });
    }

    const newTask = TaskService.createTask({
      ...params,
      notificationId,
    });

    await TaskRepository.insertTask(newTask);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = async (task: TaskItem): Promise<boolean> => {
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
      });
    } else if (notifId) {
      await NotificationService.cancelReminder(notifId);
      notifId = undefined;
    }

    const finalTask = { ...task, notificationId: notifId, updatedAt: new Date().toISOString() };
    await TaskRepository.updateTask(finalTask);
    setTasks(prev => prev.map(t => (t.id === task.id ? finalTask : t)));
    return true;
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    const target = tasks.find(t => t.id === id);
    if (target?.notificationId) {
      await NotificationService.cancelReminder(target.notificationId);
    }
    await MediaStorage.deleteAttachmentsForParent('task', id);
    await TaskRepository.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    return true;
  };

  const toggleTask = async (id: string): Promise<boolean> => {
    const target = tasks.find(t => t.id === id);
    if (!target) return false;

    const isNowCompleted = !target.completed;
    const updatedTask: TaskItem = {
      ...target,
      completed: isNowCompleted,
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    await TaskRepository.updateTask(updatedTask);
    setTasks(prev => prev.map(t => (t.id === id ? updatedTask : t)));
    return true;
  };

  // --- Event Handlers ---
  const addEvent = async (params: Parameters<typeof EventService.createEvent>[0]): Promise<EventItem> => {
    let notificationId: string | undefined;

    if (params.reminderEnabled && settings.notificationsEnabled) {
      notificationId = await NotificationService.scheduleReminder({
        title: `Event: ${params.name}`,
        body: `Starting at ${params.startTime}${params.location ? ` @ ${params.location}` : ''}`,
        date: params.date,
        time: params.startTime,
        reminderTime: params.reminderTime,
        type: 'event',
        referenceId: '',
      });
    }

    const newEvent = EventService.createEvent({
      ...params,
      notificationId,
    });

    await EventRepository.insertEvent(newEvent);
    setEvents(prev =>
      [...prev, newEvent].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    );
    return newEvent;
  };

  const updateEvent = async (event: EventItem): Promise<boolean> => {
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
      });
    } else if (notifId) {
      await NotificationService.cancelReminder(notifId);
      notifId = undefined;
    }

    const finalEvent = { ...event, notificationId: notifId, updatedAt: new Date().toISOString() };
    await EventRepository.updateEvent(finalEvent);
    setEvents(prev => prev.map(e => (e.id === event.id ? finalEvent : e)));
    return true;
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    const target = events.find(e => e.id === id);
    if (target?.notificationId) {
      await NotificationService.cancelReminder(target.notificationId);
    }
    await MediaStorage.deleteAttachmentsForParent('event', id);
    await EventRepository.deleteEvent(id);
    setEvents(prev => prev.filter(e => e.id !== id));
    return true;
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
    const newExpense: ExpenseItem = {
      id: generateId('exp'),
      title: params.title.trim(),
      amount: Number(params.amount) || 0,
      category: params.category,
      date: params.date,
      paymentMethod: (params.paymentMethod as any) || 'Card',
      notes: params.notes?.trim(),
      transactionId: params.transactionId?.trim(),
      receiptUri: params.receiptUri,
      createdAt: new Date().toISOString(),
    };

    await ExpenseRepository.insertExpense(newExpense);
    setExpenses(prev => [newExpense, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    return newExpense;
  };

  const updateExpense = async (expense: ExpenseItem): Promise<boolean> => {
    const updatedExpense = { ...expense, updatedAt: new Date().toISOString() };
    await ExpenseRepository.updateExpense(updatedExpense);
    setExpenses(prev => prev.map(e => (e.id === expense.id ? updatedExpense : e)).sort((a, b) => b.date.localeCompare(a.date)));
    return true;
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    await MediaStorage.deleteAttachmentsForParent('expense', id);
    await ExpenseRepository.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    return true;
  };

  // --- URL Handlers ---
  const addUrl = async (params: { title: string; url: string; category?: string; note?: string; previewImageUri?: string }) => {
    const result = UrlService.createUrl(params as any);
    if (!result.success || !result.item) {
      return { success: false, error: result.error };
    }
    await UrlRepository.insertUrl(result.item);
    setUrls(prev => [result.item!, ...prev]);
    return { success: true };
  };

  const updateUrl = async (id: string, params: { title: string; url: string; category?: string; note?: string; previewImageUri?: string }) => {
    const existing = urls.find(u => u.id === id);
    if (!existing) return { success: false, error: 'URL not found' };

    const result = UrlService.updateUrl(existing, params as any);
    if (!result.success || !result.item) {
      return { success: false, error: result.error };
    }

    await UrlRepository.updateUrl(result.item);
    setUrls(prev => prev.map(u => (u.id === id ? result.item! : u)));
    return { success: true };
  };

  const deleteUrl = async (id: string): Promise<boolean> => {
    await MediaStorage.deleteAttachmentsForParent('url', id);
    await UrlRepository.deleteUrl(id);
    setUrls(prev => prev.filter(u => u.id !== id));
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
    const allAttachments = await AttachmentRepository.getAllAttachments();
    const currentWorkspace: WorkspaceData = {
      user,
      tasks,
      events,
      expenses,
      urls,
      notifications,
      settings,
      attachments: allAttachments,
    };
    return BackupService.exportBackup(currentWorkspace);
  };

  const exportZipData = async () => {
    const allAttachments = await AttachmentRepository.getAllAttachments();
    const currentWorkspace: WorkspaceData = {
      user,
      tasks,
      events,
      expenses,
      urls,
      notifications,
      settings,
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
      await NotificationRepository.clearAllNotifications();
      await AttachmentRepository.clearAllAttachments();
      await SettingsRepository.setAllSettings(defaultSettings);

      setUser(null);
      setTasks([]);
      setEvents([]);
      setExpenses([]);
      setUrls([]);
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
        updateUrl,
        deleteUrl,
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
