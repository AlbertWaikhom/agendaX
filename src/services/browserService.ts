import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export interface BrowserOption {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  schemeCheck?: string;
  buildUrl: (targetUrl: string) => string;
}

const BROWSER_STORAGE_KEY = '@agendax_browser_pref_v1';

export const BROWSER_OPTIONS: BrowserOption[] = [
  {
    id: 'system',
    name: 'System Default Browser',
    icon: 'globe-outline',
    color: '#38BDF8',
    buildUrl: (url: string) => url,
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    icon: 'logo-chrome',
    color: '#EA4335',
    schemeCheck: 'googlechrome://',
    buildUrl: (url: string) => {
      const clean = url.replace(/^https?:\/\//, '');
      return url.startsWith('https://') ? `googlechromes://${clean}` : `googlechrome://${clean}`;
    },
  },
  {
    id: 'firefox',
    name: 'Mozilla Firefox',
    icon: 'logo-firefox',
    color: '#FF7139',
    schemeCheck: 'firefox://',
    buildUrl: (url: string) => `firefox://open-url?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'edge',
    name: 'Microsoft Edge',
    icon: 'logo-edge',
    color: '#0078D7',
    schemeCheck: 'microsoft-edge-https://',
    buildUrl: (url: string) => {
      const clean = url.replace(/^https?:\/\//, '');
      return url.startsWith('https://') ? `microsoft-edge-https://${clean}` : `microsoft-edge-http://${clean}`;
    },
  },
  {
    id: 'brave',
    name: 'Brave Browser',
    icon: 'shield-outline',
    color: '#FB542B',
    schemeCheck: 'brave://',
    buildUrl: (url: string) => `brave://open-url?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'opera',
    name: 'Opera Browser',
    icon: 'planet-outline',
    color: '#FF1B2D',
    schemeCheck: 'opera-https://',
    buildUrl: (url: string) => {
      const clean = url.replace(/^https?:\/\//, '');
      return url.startsWith('https://') ? `opera-https://${clean}` : `opera-http://${clean}`;
    },
  },
];

export const BrowserService = {
  /**
   * Returns saved default browser id, or null if user wants to be asked every time.
   */
  async getDefaultBrowser(): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(BROWSER_STORAGE_KEY);
      return val && val !== 'ask' ? val : null;
    } catch {
      return null;
    }
  },

  /**
   * Set user preference: 'ask' or specific browser id
   */
  async setDefaultBrowser(browserId: string | null): Promise<void> {
    try {
      if (!browserId || browserId === 'ask') {
        await AsyncStorage.removeItem(BROWSER_STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(BROWSER_STORAGE_KEY, browserId);
      }
    } catch (e) {
      console.warn('[BrowserService] Failed to set default browser:', e);
    }
  },

  /**
   * Discover available browsers by testing schemes
   */
  async getAvailableBrowsers(): Promise<BrowserOption[]> {
    if (Platform.OS === 'web') {
      return [BROWSER_OPTIONS[0]];
    }

    const available: BrowserOption[] = [BROWSER_OPTIONS[0]]; // System default is always available

    for (const b of BROWSER_OPTIONS.slice(1)) {
      try {
        if (b.schemeCheck) {
          const supported = await Linking.canOpenURL(b.schemeCheck);
          if (supported) {
            available.push(b);
          }
        }
      } catch {
        // Ignored, not installed or not queryable
      }
    }

    // If only system browser was verified due to Android 11+ package visibility,
    // also include Chrome & Firefox so users still have the choice
    if (available.length === 1) {
      return BROWSER_OPTIONS;
    }

    return available;
  },

  /**
   * Launch a target URL with the specified browser option
   */
  async launchUrl(targetUrl: string, browserId: string = 'system'): Promise<boolean> {
    try {
      const formattedUrl = targetUrl.startsWith('http://') || targetUrl.startsWith('https://')
        ? targetUrl
        : `https://${targetUrl}`;

      const option = BROWSER_OPTIONS.find(b => b.id === browserId) || BROWSER_OPTIONS[0];
      const directUrl = option.buildUrl(formattedUrl);

      if (option.id !== 'system') {
        try {
          const canOpen = await Linking.canOpenURL(directUrl);
          if (canOpen) {
            await Linking.openURL(directUrl);
            return true;
          }
        } catch {
          // Fallback to standard openURL
        }
      }

      await Linking.openURL(formattedUrl);
      return true;
    } catch (e) {
      console.warn('[BrowserService] Launch failed:', e);
      return false;
    }
  },
};
