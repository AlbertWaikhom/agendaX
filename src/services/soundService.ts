import { Audio } from 'expo-av';

const SOUND_ASSETS: Record<string, any> = {
  default: require('../../assets/sounds/alarm.wav'),
  alarm: require('../../assets/sounds/alarm.wav'),
  chime: require('../../assets/sounds/chime.wav'),
  bell: require('../../assets/sounds/bell.wav'),
  ping: require('../../assets/sounds/ping.wav'),
  cyber: require('../../assets/sounds/cyber.wav'),
};

let currentSound: Audio.Sound | null = null;

export const SoundService = {
  /**
   * Play offline audio tone
   */
  async playTone(soundKey: string = 'default'): Promise<boolean> {
    try {
      // Stop and unload any playing sound
      if (currentSound) {
        await currentSound.stopAsync().catch(() => {});
        await currentSound.unloadAsync().catch(() => {});
        currentSound = null;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const soundSource = SOUND_ASSETS[soundKey] || SOUND_ASSETS.default;
      const { sound } = await Audio.Sound.createAsync(
        soundSource,
        { shouldPlay: true, volume: 1.0 }
      );

      currentSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          if (currentSound === sound) currentSound = null;
        }
      });

      return true;
    } catch (error) {
      console.warn('[SoundService] Play tone error:', error);
      return false;
    }
  },

  /**
   * Stop current playing sound
   */
  async stopTone(): Promise<void> {
    if (currentSound) {
      try {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      } catch {
        // ignore
      }
      currentSound = null;
    }
  },
};
