import { Vibration, Platform } from 'react-native';

let ExpoHaptics: typeof import('expo-haptics') | null = null;
try {
  ExpoHaptics = require('expo-haptics');
} catch {
  // Graceful fallback
}

export const HapticService = {
  /**
   * Light impact for typing, keypad taps, subtle button clicks
   */
  light: () => {
    try {
      if (ExpoHaptics?.impactAsync) {
        ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
      } else {
        Vibration.vibrate(15);
      }
    } catch {
      Vibration.vibrate(15);
    }
  },

  /**
   * Medium impact for primary actions, modal opens, card taps
   */
  medium: () => {
    try {
      if (ExpoHaptics?.impactAsync) {
        ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
      } else {
        Vibration.vibrate(30);
      }
    } catch {
      Vibration.vibrate(30);
    }
  },

  /**
   * Heavy impact for destructive actions, warnings
   */
  heavy: () => {
    try {
      if (ExpoHaptics?.impactAsync) {
        ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy);
      } else {
        Vibration.vibrate(50);
      }
    } catch {
      Vibration.vibrate(50);
    }
  },

  /**
   * Selection feedback for tab switches, segmented controls, radio buttons
   */
  selection: () => {
    try {
      if (ExpoHaptics?.selectionAsync) {
        ExpoHaptics.selectionAsync();
      } else {
        Vibration.vibrate(10);
      }
    } catch {
      Vibration.vibrate(10);
    }
  },

  /**
   * Success notification feedback for successful unlock, task completion, saving
   */
  success: () => {
    try {
      if (ExpoHaptics?.notificationAsync) {
        ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success);
      } else {
        Vibration.vibrate([0, 20, 50, 20]);
      }
    } catch {
      Vibration.vibrate(40);
    }
  },

  /**
   * Error notification feedback for incorrect PIN, failed validation
   */
  error: () => {
    try {
      if (ExpoHaptics?.notificationAsync) {
        ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error);
      } else {
        Vibration.vibrate([0, 40, 60, 40]);
      }
    } catch {
      Vibration.vibrate(100);
    }
  },
};
