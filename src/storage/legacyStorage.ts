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
import { defaultSettings } from './asyncStorage';

export const LEGACY_KEYS = {
  WORKSPACE: '@agendax_workspace_v1',
  USER: '@agendax_user_v1',
  TASKS: '@agendax_tasks_v1',
  EVENTS: '@agendax_events_v1',
  EXPENSES: '@agendax_expenses_v1',
  URLS: '@agendax_urls_v1',
  NOTIFICATIONS: '@agendax_notifications_v1',
  SETTINGS: '@agendax_settings_v1',
  SECURITY: '@agendax_security_v1',
  INITIALIZED: '@agendax_initialized_v1',
};

export const LegacyStorage = {
  /**
   * Check if any legacy data exists in AsyncStorage
   */
  async hasLegacyData(): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const legacyKeysFound = keys.filter(k => k.startsWith('@agendax_'));
      if (legacyKeysFound.length === 0) return false;

      // Check if there are actual records in key lists
      const [tasksRaw, eventsRaw, expensesRaw, userRaw] = await Promise.all([
        AsyncStorage.getItem(LEGACY_KEYS.TASKS),
        AsyncStorage.getItem(LEGACY_KEYS.EVENTS),
        AsyncStorage.getItem(LEGACY_KEYS.EXPENSES),
        AsyncStorage.getItem(LEGACY_KEYS.USER),
      ]);

      const hasTasks = tasksRaw && tasksRaw !== '[]' && tasksRaw !== 'null';
      const hasEvents = eventsRaw && eventsRaw !== '[]' && eventsRaw !== 'null';
      const hasExpenses = expensesRaw && expensesRaw !== '[]' && expensesRaw !== 'null';
      const hasUser = userRaw && userRaw !== 'null';

      return Boolean(hasTasks || hasEvents || hasExpenses || hasUser);
    } catch (e) {
      console.warn('[LegacyStorage] Error checking legacy data:', e);
      return false;
    }
  },

  /**
   * Load entire legacy workspace from AsyncStorage
   */
  async loadLegacyWorkspace(): Promise<WorkspaceData | null> {
    try {
      const [userRaw, tasksRaw, eventsRaw, expensesRaw, urlsRaw, notifsRaw, settingsRaw, secRaw] =
        await Promise.all([
          AsyncStorage.getItem(LEGACY_KEYS.USER),
          AsyncStorage.getItem(LEGACY_KEYS.TASKS),
          AsyncStorage.getItem(LEGACY_KEYS.EVENTS),
          AsyncStorage.getItem(LEGACY_KEYS.EXPENSES),
          AsyncStorage.getItem(LEGACY_KEYS.URLS),
          AsyncStorage.getItem(LEGACY_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(LEGACY_KEYS.SETTINGS),
          AsyncStorage.getItem(LEGACY_KEYS.SECURITY),
        ]);

      const user: LocalUser | null = userRaw ? JSON.parse(userRaw) : null;
      const tasks: TaskItem[] = tasksRaw ? JSON.parse(tasksRaw) : [];
      const events: EventItem[] = eventsRaw ? JSON.parse(eventsRaw) : [];
      const expenses: ExpenseItem[] = expensesRaw ? JSON.parse(expensesRaw) : [];
      const urls: UrlItem[] = urlsRaw ? JSON.parse(urlsRaw) : [];
      const notifications: NotificationRecord[] = notifsRaw ? JSON.parse(notifsRaw) : [];
      const settings: AppSettings = settingsRaw ? JSON.parse(settingsRaw) : defaultSettings;
      const security = secRaw ? JSON.parse(secRaw) : undefined;

      if (security) {
        settings.security = security;
      }

      return {
        user,
        tasks: Array.isArray(tasks) ? tasks : [],
        events: Array.isArray(events) ? events : [],
        expenses: Array.isArray(expenses) ? expenses : [],
        urls: Array.isArray(urls) ? urls : [],
        notifications: Array.isArray(notifications) ? notifications : [],
        settings,
      };
    } catch (e) {
      console.error('[LegacyStorage] Failed to read legacy workspace:', e);
      return null;
    }
  },
};
