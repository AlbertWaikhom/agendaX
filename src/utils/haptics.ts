import { Vibration, Platform } from 'react-native';

let ExpoHaptics: typeof import('expo-haptics') | null = null;
try {
  ExpoHaptics = require('expo-haptics');
} catch {
}

export const HapticService = {

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
