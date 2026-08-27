import * as Haptics from 'expo-haptics';
import { Vibration, Platform } from 'react-native';

export const SoundService = {

  async playTone(soundKey: string = 'default'): Promise<boolean> {
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
        Vibration.vibrate([0, 150, 100, 150]);
      }
      return true;
    } catch (error) {
      console.warn('[SoundService] Feedback error:', error);
      return false;
    }
  },

  async stopTone(): Promise<void> {
    try {
      Vibration.cancel();
    } catch {
    }
  },
};

