import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationRecord } from '../types';
import { generateUniqueId } from '../utils';

export const NOTIFICATION_CHANNEL_ID = 'agendax_reminders';

export const RINGTONE_OPTIONS = [
  { id: 'default', name: 'Default System Alarm', icon: 'alarm-outline', soundFile: 'alarm.wav', channelId: 'agendax_alarm_default' },
  { id: 'chime', name: 'Gentle Chime', icon: 'musical-notes-outline', soundFile: 'chime.wav', channelId: 'agendax_alarm_chime' },
  { id: 'bell', name: 'Classic Bell', icon: 'notifications-outline', soundFile: 'bell.wav', channelId: 'agendax_alarm_bell' },
  { id: 'ping', name: 'Crystal Ping', icon: 'sparkles-outline', soundFile: 'ping.wav', channelId: 'agendax_alarm_ping' },
  { id: 'cyber', name: 'Cyber Pulse', icon: 'hardware-chip-outline', soundFile: 'cyber.wav', channelId: 'agendax_alarm_cyber' },
];

export function getChannelIdForSound(soundId?: string): string {
  const match = RINGTONE_OPTIONS.find(o => o.id === soundId);
  return match?.channelId || 'agendax_alarm_default';
}

export function getSoundFileForId(soundId?: string): string {
  const match = RINGTONE_OPTIONS.find(o => o.id === soundId);
  return match?.soundFile || 'alarm.wav';
}

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

  async initNotificationChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      // Initialize a high-priority channel for each offline ringtone with sound & AudioAttributes
      for (const opt of RINGTONE_OPTIONS) {
        await Notifications.setNotificationChannelAsync(opt.channelId, {
          name: `AgendaX: ${opt.name}`,
          description: `Alarm notifications with ${opt.name} offline ringtone and vibration`,
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
          sound: opt.soundFile,
          audioAttributes: {
            usage: Notifications.AndroidAudioUsage.ALARM,
            contentType: Notifications.AndroidAudioContentType.SONIFICATION,
            flags: { enforceAudibility: true, requestHardwareAudioVideoSynchronization: false },
          },
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true,
        });
      }

      // Default fallback channel
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'AgendaX Reminders & Alarms',
        description: 'Critical task and event alarm notifications with sound and vibration',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
        sound: 'alarm.wav',
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.ALARM,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
          flags: { enforceAudibility: true, requestHardwareAudioVideoSynchronization: false },
        },
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
      console.log('[NotificationService] Android notification channels initialized with offline sound files.');
    } catch (e) {
      console.warn('[NotificationService] Channel creation warning:', e);
    }
  },

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      await this.initNotificationChannel();

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.warn('[NotificationService] Permission check error:', e);
      return false;
    }
  },

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

      if (reminderTime === '5_min_before') {
        target.setMinutes(target.getMinutes() - 5);
      } else if (reminderTime === '10_min_before') {
        target.setMinutes(target.getMinutes() - 10);
      } else if (reminderTime === '15_min_before') {
        target.setMinutes(target.getMinutes() - 15);
      } else if (reminderTime === '30_min_before') {
        target.setMinutes(target.getMinutes() - 30);
      } else if (reminderTime === '1_hour_before') {
        target.setHours(target.getHours() - 1);
      } else if (reminderTime === '1_day_before') {
        target.setDate(target.getDate() - 1);
      }

      if (target.getTime() <= Date.now()) {
        return null;
      }

      return target;
    } catch {
      return null;
    }
  },

  async scheduleReminder(params: {
    title: string;
    body: string;
    date: string;
    time?: string;
    reminderTime?: string;
    type: 'task' | 'event';
    referenceId: string;
    sound?: string;
  }): Promise<string | undefined> {
    try {
      const triggerDate = this.calculateTriggerDate(params.date, params.time, params.reminderTime);
      if (!triggerDate) return undefined;

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return undefined;

      const soundId = params.sound || 'default';
      const channelId = getChannelIdForSound(soundId);
      const soundFile = getSoundFileForId(soundId);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: params.title,
          body: params.body,
          sound: soundFile,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          color: '#6366F1',
          data: {
            type: params.type,
            referenceId: params.referenceId,
            soundId,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: channelId,
        },
      });

      return notificationId;
    } catch (e) {
      console.warn('[NotificationService] Schedule error:', e);
      return undefined;
    }
  },

  async triggerTestReminder(soundId: string = 'default', soundTitle?: string): Promise<boolean> {
    try {
      const { SoundService } = await import('./soundService');
      // Play audio tone immediately through device speakers
      await SoundService.playTone(soundId);

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return true;

      const channelId = getChannelIdForSound(soundId);
      const soundFile = getSoundFileForId(soundId);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 AgendaX Alarm Test',
          body: `Reminder alert (${soundTitle || 'Default Alarm'}). Active in notification tray & lockscreen.`,
          sound: soundFile,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          color: '#6366F1',
          data: { type: 'system', soundId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          channelId: channelId,
        },
      });

      return true;
    } catch (e) {
      console.warn('[NotificationService] Test alert error:', e);
      return false;
    }
  },

  async cancelReminder(notificationId?: string): Promise<void> {
    if (!notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn('[NotificationService] Cancel error:', e);
    }
  },

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
