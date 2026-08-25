import AsyncStorage from '@react-native-async-storage/async-storage';
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

export const STORAGE_KEYS = {
  WORKSPACE: '@agendax_workspace_v1',
  USER: '@agendax_user_v1',
  TASKS: '@agendax_tasks_v1',
  EVENTS: '@agendax_events_v1',
  EXPENSES: '@agendax_expenses_v1',
  URLS: '@agendax_urls_v1',
  NOTIFICATIONS: '@agendax_notifications_v1',
  SETTINGS: '@agendax_settings_v1',
  INITIALIZED: '@agendax_initialized_v1',
};

export const defaultSettings: AppSettings = {
  theme: 'dark',
  notificationsEnabled: true,
  hapticFeedback: true,
  defaultPriority: 'medium',
  compactView: false,
  badgeCountEnabled: true,
  currencySymbol: '₹',
};

export const initialWorkspaceData: WorkspaceData = {
  user: null,
  tasks: [],
  events: [],
  expenses: [],
  urls: [],
  notifications: [],
  settings: defaultSettings,
};

export const Storage = {
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : defaultValue;
    } catch (e) {
      console.error(`[Storage] Failed to read key ${key}:`, e);
      return defaultValue;
    }
  },

  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (e) {
      console.error(`[Storage] Failed to save key ${key}:`, e);
      return false;
    }
  },

  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`[Storage] Failed to remove key ${key}:`, e);
      return false;
    }
  },

  async loadWorkspace(): Promise<WorkspaceData> {
    try {
      const [user, tasks, events, expenses, urls, notifications, settings] = await Promise.all([
        this.getItem<LocalUser | null>(STORAGE_KEYS.USER, null),
        this.getItem<TaskItem[]>(STORAGE_KEYS.TASKS, []),
        this.getItem<EventItem[]>(STORAGE_KEYS.EVENTS, []),
        this.getItem<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, []),
        this.getItem<UrlItem[]>(STORAGE_KEYS.URLS, []),
        this.getItem<NotificationRecord[]>(STORAGE_KEYS.NOTIFICATIONS, []),
        this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS, defaultSettings),
      ]);

      return {
        user,
        tasks: Array.isArray(tasks) ? tasks : [],
        events: Array.isArray(events) ? events : [],
        expenses: Array.isArray(expenses) ? expenses : [],
        urls: Array.isArray(urls) ? urls : [],
        notifications: Array.isArray(notifications) ? notifications : [],
        settings: settings || defaultSettings,
      };
    } catch (e) {
      console.error('[Storage] Failed to load workspace:', e);
      return initialWorkspaceData;
    }
  },

  async saveWorkspace(data: WorkspaceData): Promise<boolean> {
    try {
      const pairs: [string, string][] = [
        [STORAGE_KEYS.USER, JSON.stringify(data.user)],
        [STORAGE_KEYS.TASKS, JSON.stringify(data.tasks)],
        [STORAGE_KEYS.EVENTS, JSON.stringify(data.events)],
        [STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses)],
        [STORAGE_KEYS.URLS, JSON.stringify(data.urls)],
        [STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications)],
        [STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings)],
      ];
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (e) {
      console.error('[Storage] Failed to save workspace:', e);
      return false;
    }
  },

  async clearAllData(): Promise<boolean> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (e) {
      console.error('[Storage] Failed to clear data:', e);
      return false;
    }
  },
};
