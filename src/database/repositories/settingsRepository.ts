import { Database } from '../database';
import { AppSettings } from '../../types';
import { defaultSettings } from '../../storage/asyncStorage';

export const SettingsRepository = {
  async getSettings(): Promise<AppSettings> {
    try {
      const db = await Database.getDatabaseAsync();
      const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings;');
      if (!rows || rows.length === 0) {
        return defaultSettings;
      }

      const settingsMap: Record<string, any> = {};
      for (const row of rows) {
        try {
          settingsMap[row.key] = JSON.parse(row.value);
        } catch {
          settingsMap[row.key] = row.value;
        }
      }

      return {
        theme: settingsMap.theme || defaultSettings.theme,
        notificationsEnabled:
          settingsMap.notificationsEnabled !== undefined
            ? settingsMap.notificationsEnabled
            : defaultSettings.notificationsEnabled,
        hapticFeedback:
          settingsMap.hapticFeedback !== undefined
            ? settingsMap.hapticFeedback
            : defaultSettings.hapticFeedback,
        defaultPriority: settingsMap.defaultPriority || defaultSettings.defaultPriority,
        compactView:
          settingsMap.compactView !== undefined ? settingsMap.compactView : defaultSettings.compactView,
        badgeCountEnabled:
          settingsMap.badgeCountEnabled !== undefined
            ? settingsMap.badgeCountEnabled
            : defaultSettings.badgeCountEnabled,
        currencySymbol: settingsMap.currencySymbol || defaultSettings.currencySymbol,
        security: settingsMap.security || undefined,
      };
    } catch (e) {
      console.error('[SettingsRepository] Error reading settings:', e);
      return defaultSettings;
    }
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    const db = await Database.getDatabaseAsync();
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) {
        await db.runAsync(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);',
          [key, JSON.stringify(value)]
        );
      }
    }
  },

  async setAllSettings(settings: AppSettings): Promise<void> {
    const db = await Database.getDatabaseAsync();
    await db.runAsync('DELETE FROM settings;');
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) {
        await db.runAsync(
          'INSERT INTO settings (key, value) VALUES (?, ?);',
          [key, JSON.stringify(value)]
        );
      }
    }
  },
};
