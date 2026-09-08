import * as Haptics from 'expo-haptics';
import { Vibration, Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

const SOUND_MAP: Record<string, any> = {
  default: require('../../assets/sounds/alarm.wav'),
  alarm: require('../../assets/sounds/alarm.wav'),
  chime: require('../../assets/sounds/chime.wav'),
  bell: require('../../assets/sounds/bell.wav'),
  ping: require('../../assets/sounds/ping.wav'),
  cyber: require('../../assets/sounds/cyber.wav'),
};

let activePlayer: AudioPlayer | null = null;

export const SoundService = {
  async playTone(soundKey: string = 'default'): Promise<boolean> {
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
        Vibration.vibrate([0, 150, 100, 150]);
      }

      // Stop and release any previously playing audio tone
      if (activePlayer) {
        try {
          activePlayer.pause();
          activePlayer.release();
        } catch { }
        activePlayer = null;
      }

      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
        });
      } catch (audioModeError) {
        console.warn('[SoundService] Audio mode config warning:', audioModeError);
      }

      const source = SOUND_MAP[soundKey] || SOUND_MAP.default;
      if (source) {
        activePlayer = createAudioPlayer(source);
        activePlayer.play();
      }

      return true;
    } catch (error) {
      console.warn('[SoundService] Audio playback error:', error);
      return false;
    }
  },

  async stopTone(): Promise<void> {
    try {
      Vibration.cancel();
      if (activePlayer) {
        activePlayer.pause();
        activePlayer.release();
        activePlayer = null;
      }
    } catch (error) {
      console.warn('[SoundService] Stop tone error:', error);
    }
  },
};


