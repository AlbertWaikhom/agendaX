import { Platform, Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';

export const PermissionService = {
  /**
   * Request all essential permissions on initial app launch
   */
  async requestInitialPermissionsAsync(): Promise<{
    notifications: boolean;
    mediaLibrary: boolean;
  }> {
    if (Platform.OS === 'web') {
      return { notifications: false, mediaLibrary: false };
    }

    let notificationsGranted = false;
    let mediaGranted = false;

    try {
      // 1. Request notification permissions
      const notifStatus = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      notificationsGranted = notifStatus.status === 'granted';

      // 2. Request media library permissions
      const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      mediaGranted = mediaStatus.granted;
    } catch (e) {
      console.warn('[PermissionService] Initial permissions error:', e);
    }

    return {
      notifications: notificationsGranted,
      mediaLibrary: mediaGranted,
    };
  },

  /**
   * Request Media Library permission with automatic re-prompt alert if denied
   */
  async requireMediaLibraryPermission(featureName: string = 'media upload'): Promise<boolean> {
    if (Platform.OS === 'web') return true;

    try {
      const current = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (current.granted) return true;

      const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (requested.granted) return true;

      // If denied, prompt to open settings or retry
      Alert.alert(
        '📁 Storage Permission Required',
        `AgendaX requires photo/media storage access to attach screenshots and files for ${featureName}. Please enable this in your device settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS !== 'web') {
                Linking.openSettings().catch(() => {});
              }
            },
          },
        ]
      );
      return false;
    } catch (e) {
      console.warn('[PermissionService] Media permission check error:', e);
      return false;
    }
  },

  /**
   * Request Notification permission with re-prompt alert if denied
   */
  async requireNotificationPermission(featureName: string = 'reminders'): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const current = await Notifications.getPermissionsAsync();
      if (current.status === 'granted') return true;

      const requested = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      if (requested.status === 'granted') return true;

      Alert.alert(
        '🔔 Notification Permission Required',
        `AgendaX requires notification permissions to alert you for ${featureName}. Please enable notifications in device settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS !== 'web') {
                Linking.openSettings().catch(() => {});
              }
            },
          },
        ]
      );
      return false;
    } catch (e) {
      console.warn('[PermissionService] Notification permission check error:', e);
      return false;
    }
  },

  /**
   * Check Biometrics / Screen Lock Hardware
   */
  async checkBiometricsAsync(): Promise<{
    hasHardware: boolean;
    isEnrolled: boolean;
    supportedTypes: LocalAuthentication.AuthenticationType[];
  }> {
    if (Platform.OS === 'web') {
      return { hasHardware: false, isEnrolled: false, supportedTypes: [] };
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      return { hasHardware, isEnrolled, supportedTypes };
    } catch (e) {
      console.warn('[PermissionService] Biometrics check error:', e);
      return { hasHardware: false, isEnrolled: false, supportedTypes: [] };
    }
  },
};
