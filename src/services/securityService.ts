import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecuritySettings, LockMode } from '../types';

let LocalAuthentication: typeof import('expo-local-authentication') | null = null;
try {
  LocalAuthentication = require('expo-local-authentication');
} catch (e) {
  console.warn('LocalAuthentication native module unavailable:', e);
}

const SECURITY_STORAGE_KEY = '@agendax_security_v1';

export const defaultSecuritySettings: SecuritySettings = {
  appLockEnabled: false,
  lockMode: 'custom_pin',
  customPin: null,
  lockedPages: [],
  biometricsEnabled: true,
};

export class SecurityService {
  /**
   * Load stored security settings
   */
  static async loadSecuritySettings(): Promise<SecuritySettings> {
    try {
      const raw = await AsyncStorage.getItem(SECURITY_STORAGE_KEY);
      if (raw) {
        return { ...defaultSecuritySettings, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Error loading security settings:', e);
    }
    return defaultSecuritySettings;
  }

  /**
   * Save security settings
   */
  static async saveSecuritySettings(settings: SecuritySettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error saving security settings:', e);
    }
  }

  /**
   * Check if device has biometrics / system authentication hardware
   */
  static async checkBiometricsCapability(): Promise<{
    hasHardware: boolean;
    isEnrolled: boolean;
    types: string[];
  }> {
    try {
      if (!LocalAuthentication || !LocalAuthentication.hasHardwareAsync) {
        return { hasHardware: false, isEnrolled: false, types: [] };
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      const typeLabels: string[] = [];
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        typeLabels.push('Fingerprint');
      }
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        typeLabels.push('Face ID');
      }
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        typeLabels.push('Iris');
      }
      if (typeLabels.length === 0 && hasHardware) {
        typeLabels.push('Device Passcode / Biometrics');
      }

      return {
        hasHardware,
        isEnrolled,
        types: typeLabels,
      };
    } catch (e) {
      console.warn('Error checking biometrics capability:', e);
      return { hasHardware: false, isEnrolled: false, types: [] };
    }
  }

  /**
   * Prompt biometric / system unlock
   */
  static async authenticateBiometric(
    promptMessage: string = 'Unlock AgendaX'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!LocalAuthentication || !LocalAuthentication.authenticateAsync) {
        return { success: false, error: 'Biometrics native module not available' };
      }

      const capability = await this.checkBiometricsCapability();
      if (!capability.hasHardware || !capability.isEnrolled) {
        return { success: false, error: 'Biometrics not enrolled on device' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: (result as any).error || 'Authentication failed',
        };
      }
    } catch (e: any) {
      console.warn('Biometric auth error:', e);
      return { success: false, error: e?.message || 'Biometric authentication failed' };
    }
  }

  /**
   * Verify custom PIN
   */
  static verifyPin(enteredPin: string, storedPin: string | null): boolean {
    if (!storedPin) return false;
    return enteredPin === storedPin;
  }
}
