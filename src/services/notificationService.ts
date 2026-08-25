import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationRecord } from '../types';
import { generateUniqueId } from '../utils';

// Configure notification behavior
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.log('[NotificationService] Handler init bypassed:', e);
}

export const NotificationService = {
  /**
   * Request local notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.warn('[NotificationService] Permission check error:', e);
      return false;
    }
  },

  /**
   * Calculate trigger date based on due date, due time and offset
   */
  calculateTriggerDate(dateStr: string, timeStr?: string, reminderTime?: string): Date | null {
    try {
      if (!dateStr) return null;
      const [year, month, day] = dateStr.split('-').map(Number);
      let hours = 9;
      let minutes = 0;

      if (timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        hours = h;
        minutes = m;
      }

      const target = new Date(year, month - 1, day, hours, minutes, 0, 0);

      // Apply offset
      if (reminderTime === '10_min_before') {
        target.setMinutes(target.getMinutes() - 10);
      } else if (reminderTime === '30_min_before') {
        target.setMinutes(target.getMinutes() - 30);
      } else if (reminderTime === '1_hour_before') {
        target.setHours(target.getHours() - 1);
      } else if (reminderTime === '1_day_before') {
        target.setDate(target.getDate() - 1);
      }

      // If scheduled time is in the past, return null
      if (target.getTime() <= Date.now()) {
        return null;
      }

      return target;
    } catch {
      return null;
    }
  },

  /**
   * Schedule a local notification for a task or event
   */
  async scheduleReminder(params: {
    title: string;
    body: string;
    date: string;
    time?: string;
    reminderTime?: string;
    type: 'task' | 'event';
    referenceId: string;
  }): Promise<string | undefined> {
    try {
      const triggerDate = this.calculateTriggerDate(params.date, params.time, params.reminderTime);
      if (!triggerDate) return undefined;

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return undefined;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: params.title,
          body: params.body,
          sound: true,
          data: {
            type: params.type,
            referenceId: params.referenceId,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      return notificationId;
    } catch (e) {
      console.warn('[NotificationService] Schedule error:', e);
      return undefined;
    }
  },

  /**
   * Cancel an existing scheduled notification
   */
  async cancelReminder(notificationId?: string): Promise<void> {
    if (!notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn('[NotificationService] Cancel error:', e);
    }
  },

  /**
   * Create an in-app notification record
   */
  createRecord(params: {
    title: string;
    message: string;
    type: 'task' | 'event' | 'system';
    referenceId?: string;
  }): NotificationRecord {
    return {
      id: generateUniqueId('notif'),
      title: params.title,
      message: params.message,
      type: params.type,
      referenceId: params.referenceId,
      read: false,
      timestamp: new Date().toISOString(),
    };
  },
};
