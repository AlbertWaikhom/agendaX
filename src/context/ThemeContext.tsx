import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode } from '../types';
import { ThemePalettes, ThemeColors } from '../constants/theme';
import { Storage, STORAGE_KEYS } from '../storage/asyncStorage';

interface ThemeContextValue {
  theme: ThemeMode;
  colors: ThemeColors;
  setTheme: (newTheme: ThemeMode) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    // Load persisted theme
    const loadTheme = async () => {
      try {
        const savedSettings = await Storage.getItem<any>(STORAGE_KEYS.SETTINGS, null);
        if (savedSettings && savedSettings.theme && ThemePalettes[savedSettings.theme as ThemeMode]) {
          setThemeState(savedSettings.theme as ThemeMode);
        }
      } catch (err) {
        console.warn('[ThemeContext] Failed to load theme:', err);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      const currentSettings = (await Storage.getItem<any>(STORAGE_KEYS.SETTINGS, {})) || {};
      await Storage.setItem(STORAGE_KEYS.SETTINGS, {
        ...currentSettings,
        theme: newTheme,
      });
    } catch (err) {
      console.warn('[ThemeContext] Failed to persist theme:', err);
    }
  };

  const colors = ThemePalettes[theme] || ThemePalettes.dark;
  const isDark = theme !== 'light';

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      colors: ThemePalettes.dark,
      setTheme: async () => {},
      isDark: true,
    };
  }
  return context;
};
