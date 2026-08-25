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
} from '../types';
import { Storage, defaultSettings } from '../storage/asyncStorage';
import { UserService } from '../services/userService';
import { TaskService } from '../services/taskService';
import { EventService } from '../services/eventService';
import { UrlService } from '../services/urlService';
import { NotificationService } from '../services/notificationService';
import { BackupService } from '../services/backupService';
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
  }) => Promise<ExpenseItem>;
  updateExpense: (expense: ExpenseItem) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;

  // URL Operations
  addUrl: (params: { title: string; url: string; category?: string; note?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUrl: (id: string, params: { title: string; url: string; category?: string; note?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteUrl: (id: string) => Promise<boolean>;

  // Notification Operations
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Settings & Storage
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  exportData: () => Promise<{ success: boolean; message?: string; error?: string }>;
  importData: (data: WorkspaceData) => Promise<boolean>;
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
      const data = await Storage.loadWorkspace();
      setUser(data.user);
      setTasks(data.tasks);
      setEvents(data.events);
      setExpenses(data.expenses || []);
      setUrls(data.urls);
      setNotifications(data.notifications);
      setSettings(data.settings || defaultSettings);
    } catch (e) {
      console.error('[WorkspaceContext] Failed to load:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Save changes helper
  const syncWorkspace = useCallback(async (updated: Partial<WorkspaceData>) => {
    const current: WorkspaceData = {
      user: updated.user !== undefined ? updated.user : user,
      tasks: updated.tasks !== undefined ? updated.tasks : tasks,
      events: updated.events !== undefined ? updated.events : events,
      expenses: updated.expenses !== undefined ? updated.expenses : expenses,
      urls: updated.urls !== undefined ? updated.urls : urls,
      notifications: updated.notifications !== undefined ? updated.notifications : notifications,
      settings: updated.settings !== undefined ? updated.settings : settings,
    };
    await Storage.saveWorkspace(current);
  }, [user, tasks, events, expenses, urls, notifications, settings]);

  const initializeUser = async (name: string): Promise<boolean> => {
    const newUser = UserService.createLocalUser(name);
    const welcomeNotif = NotificationService.createRecord({
      title: 'Welcome to AgendaX! 🚀',
      message: `Your private local workspace (${newUser.id}) has been created. All data is kept 100% locally.`,
      type: 'system',
    });

    const initialData: WorkspaceData = {
      user: newUser,
      tasks: [],
      events: [],
      expenses: [],
      urls: [],
      notifications: [welcomeNotif],
      settings: defaultSettings,
    };

    await Storage.saveWorkspace(initialData);
    setUser(newUser);
    setTasks([]);
    setEvents([]);
    setExpenses([]);
    setUrls([]);
    setNotifications([welcomeNotif]);
    setSettings(defaultSettings);
    return true;
  };

  const updateUser = async (name: string): Promise<boolean> => {
    if (!user) return false;
    const updatedUser: LocalUser = { ...user, name: name.trim() || user.name };
    setUser(updatedUser);
    await syncWorkspace({ user: updatedUser });
    return true;
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

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    await syncWorkspace({ tasks: updatedTasks });
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
    const updatedTasks = tasks.map(t => (t.id === task.id ? finalTask : t));
    setTasks(updatedTasks);
    await syncWorkspace({ tasks: updatedTasks });
    return true;
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    const target = tasks.find(t => t.id === id);
    if (target?.notificationId) {
      await NotificationService.cancelReminder(target.notificationId);
    }
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    await syncWorkspace({ tasks: updatedTasks });
    return true;
  };

  const toggleTask = async (id: string): Promise<boolean> => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const isNowCompleted = !t.completed;
        return {
          ...t,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    await syncWorkspace({ tasks: updatedTasks });
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

    const updatedEvents = [...events, newEvent].sort((a, b) => {
      const dtA = `${a.date} ${a.startTime}`;
      const dtB = `${b.date} ${b.startTime}`;
      return dtA.localeCompare(dtB);
    });

    setEvents(updatedEvents);
    await syncWorkspace({ events: updatedEvents });
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
    const updatedEvents = events.map(e => (e.id === event.id ? finalEvent : e));
    setEvents(updatedEvents);
    await syncWorkspace({ events: updatedEvents });
    return true;
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    const target = events.find(e => e.id === id);
    if (target?.notificationId) {
      await NotificationService.cancelReminder(target.notificationId);
    }
    const updatedEvents = events.filter(e => e.id !== id);
    setEvents(updatedEvents);
    await syncWorkspace({ events: updatedEvents });
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
  }): Promise<ExpenseItem> => {
    const newExpense: ExpenseItem = {
      id: generateId('exp'),
      title: params.title.trim(),
      amount: Number(params.amount) || 0,
      category: params.category,
      date: params.date,
      paymentMethod: (params.paymentMethod as any) || 'Card',
      notes: params.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedExpenses = [newExpense, ...expenses].sort((a, b) => b.date.localeCompare(a.date));
    setExpenses(updatedExpenses);
    await syncWorkspace({ expenses: updatedExpenses });
    return newExpense;
  };

  const updateExpense = async (expense: ExpenseItem): Promise<boolean> => {
    const updatedExpense = { ...expense, updatedAt: new Date().toISOString() };
    const updatedExpenses = expenses
      .map(e => (e.id === expense.id ? updatedExpense : e))
      .sort((a, b) => b.date.localeCompare(a.date));
    setExpenses(updatedExpenses);
    await syncWorkspace({ expenses: updatedExpenses });
    return true;
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    const updatedExpenses = expenses.filter(e => e.id !== id);
    setExpenses(updatedExpenses);
    await syncWorkspace({ expenses: updatedExpenses });
    return true;
  };

  // --- URL Handlers ---
  const addUrl = async (params: { title: string; url: string; category?: string; note?: string }) => {
    const result = UrlService.createUrl(params);
    if (!result.success || !result.item) {
      return { success: false, error: result.error };
    }
    const updatedUrls = [result.item, ...urls];
    setUrls(updatedUrls);
    await syncWorkspace({ urls: updatedUrls });
    return { success: true };
  };

  const updateUrl = async (id: string, params: { title: string; url: string; category?: string; note?: string }) => {
    const existing = urls.find(u => u.id === id);
    if (!existing) return { success: false, error: 'URL not found' };

    const result = UrlService.updateUrl(existing, params);
    if (!result.success || !result.item) {
      return { success: false, error: result.error };
    }

    const updatedUrls = urls.map(u => (u.id === id ? result.item! : u));
    setUrls(updatedUrls);
    await syncWorkspace({ urls: updatedUrls });
    return { success: true };
  };

  const deleteUrl = async (id: string): Promise<boolean> => {
    const updatedUrls = urls.filter(u => u.id !== id);
    setUrls(updatedUrls);
    await syncWorkspace({ urls: updatedUrls });
    return true;
  };

  // --- Notification Handlers ---
  const markNotificationAsRead = async (id: string) => {
    const updated = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    await syncWorkspace({ notifications: updated });
  };

  const markAllNotificationsAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    await syncWorkspace({ notifications: updated });
  };

  const deleteNotification = async (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    await syncWorkspace({ notifications: updated });
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    await syncWorkspace({ notifications: [] });
  };

  // --- Settings & Storage ---
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated: AppSettings = { ...settings, ...newSettings };
    setSettings(updated);
    await syncWorkspace({ settings: updated });
  };

  const exportData = async () => {
    const currentWorkspace: WorkspaceData = {
      user,
      tasks,
      events,
      expenses,
      urls,
      notifications,
      settings,
    };
    return BackupService.exportBackup(currentWorkspace);
  };

  const importData = async (data: WorkspaceData): Promise<boolean> => {
    try {
      await Storage.saveWorkspace(data);
      setUser(data.user);
      setTasks(data.tasks);
      setEvents(data.events);
      setExpenses(data.expenses || []);
      setUrls(data.urls);
      setNotifications(data.notifications);
      setSettings(data.settings);
      return true;
    } catch (e) {
      console.error('[WorkspaceContext] Import failed:', e);
      return false;
    }
  };

  const clearWorkspace = async (): Promise<boolean> => {
    try {
      await Storage.clearAllData();
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
        updateSettings,
        exportData,
        importData,
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
