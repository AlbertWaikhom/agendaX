import { Platform } from 'react-native';
import { ThemeMode } from '../types';

export interface ThemeColors {
  // Base background & surfaces
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceHighlight: string;
  surfaceSubtle: string;

  // Liquid Glass Tokens (iOS 26)
  glassCard: string;
  glassCardHover: string;
  glassBorder: string;
  glassBorderHighlight: string;
  glassGlow: string;
  glassSpecular: string;
  card: string;
  cardBorder: string;
  cardHover: string;

  // Primary Brand & Accents
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGradientStart: string;
  primaryGradientEnd: string;
  accentBlue: string;
  accentCyan: string;
  accentPurple: string;
  accentPink: string;
  accentOrange: string;
  accentEmerald: string;

  // Semantic & Priorities
  highPriority: string;
  highPriorityBg: string;
  mediumPriority: string;
  mediumPriorityBg: string;
  lowPriority: string;
  lowPriorityBg: string;

  // Statuses
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Borders & Overlays
  border: string;
  borderLight: string;
  borderFocus: string;
  divider: string;
  overlay: string;
  modalBackground: string;
  tabBarBackground: string;
}

export const ThemePalettes: Record<ThemeMode, ThemeColors> = {
  dark: {
    background: '#070A12',
    backgroundSecondary: '#0C111E',
    surface: '#111827',
    surfaceHighlight: '#1F293D',
    surfaceSubtle: '#0D1424',

    glassCard: 'rgba(19, 27, 46, 0.72)',
    glassCardHover: 'rgba(28, 40, 68, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.09)',
    glassBorderHighlight: 'rgba(99, 102, 241, 0.45)',
    glassGlow: 'rgba(99, 102, 241, 0.18)',
    glassSpecular: 'rgba(255, 255, 255, 0.15)',
    card: 'rgba(19, 27, 46, 0.72)',
    cardBorder: 'rgba(255, 255, 255, 0.09)',
    cardHover: 'rgba(28, 40, 68, 0.85)',

    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    primaryGradientStart: '#6366F1',
    primaryGradientEnd: '#8B5CF6',
    accentBlue: '#3B82F6',
    accentCyan: '#06B6D4',
    accentPurple: '#A855F7',
    accentPink: '#EC4899',
    accentOrange: '#F97316',
    accentEmerald: '#10B981',

    highPriority: '#EF4444',
    highPriorityBg: 'rgba(239, 68, 68, 0.15)',
    mediumPriority: '#F59E0B',
    mediumPriorityBg: 'rgba(245, 158, 11, 0.15)',
    lowPriority: '#10B981',
    lowPriorityBg: 'rgba(16, 185, 129, 0.15)',

    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.15)',
    info: '#3B82F6',
    infoBg: 'rgba(59, 130, 246, 0.15)',

    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#070A12',

    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.14)',
    borderFocus: '#6366F1',
    divider: 'rgba(255, 255, 255, 0.06)',
    overlay: 'rgba(3, 6, 14, 0.82)',
    modalBackground: '#0F1626',
    tabBarBackground: 'rgba(11, 16, 28, 0.88)',
  },

  light: {
    background: '#F8FAFC',
    backgroundSecondary: '#EEF2F6',
    surface: '#FFFFFF',
    surfaceHighlight: '#F1F5F9',
    surfaceSubtle: '#F8FAFC',

    glassCard: 'rgba(255, 255, 255, 0.82)',
    glassCardHover: 'rgba(255, 255, 255, 0.95)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
    glassBorderHighlight: 'rgba(79, 70, 229, 0.35)',
    glassGlow: 'rgba(79, 70, 229, 0.12)',
    glassSpecular: 'rgba(255, 255, 255, 0.8)',
    card: 'rgba(255, 255, 255, 0.82)',
    cardBorder: 'rgba(0, 0, 0, 0.08)',
    cardHover: 'rgba(255, 255, 255, 0.95)',

    primary: '#4F46E5',
    primaryLight: '#6366F1',
    primaryDark: '#4338CA',
    primaryGradientStart: '#4F46E5',
    primaryGradientEnd: '#7C3AED',
    accentBlue: '#2563EB',
    accentCyan: '#0891B2',
    accentPurple: '#9333EA',
    accentPink: '#DB2777',
    accentOrange: '#EA580C',
    accentEmerald: '#059669',

    highPriority: '#DC2626',
    highPriorityBg: 'rgba(220, 38, 38, 0.12)',
    mediumPriority: '#D97706',
    mediumPriorityBg: 'rgba(217, 119, 6, 0.12)',
    lowPriority: '#059669',
    lowPriorityBg: 'rgba(5, 150, 105, 0.12)',

    success: '#059669',
    successBg: 'rgba(5, 150, 105, 0.12)',
    warning: '#D97706',
    warningBg: 'rgba(217, 119, 6, 0.12)',
    error: '#DC2626',
    errorBg: 'rgba(220, 38, 38, 0.12)',
    info: '#2563EB',
    infoBg: 'rgba(37, 99, 235, 0.12)',

    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    border: 'rgba(0, 0, 0, 0.08)',
    borderLight: 'rgba(0, 0, 0, 0.12)',
    borderFocus: '#4F46E5',
    divider: 'rgba(0, 0, 0, 0.06)',
    overlay: 'rgba(15, 23, 42, 0.45)',
    modalBackground: '#FFFFFF',
    tabBarBackground: 'rgba(255, 255, 255, 0.9)',
  },

  cyber: {
    background: '#040711',
    backgroundSecondary: '#080E20',
    surface: '#0B132B',
    surfaceHighlight: '#142145',
    surfaceSubtle: '#070D1F',

    glassCard: 'rgba(11, 20, 44, 0.76)',
    glassCardHover: 'rgba(18, 32, 70, 0.9)',
    glassBorder: 'rgba(6, 182, 212, 0.22)',
    glassBorderHighlight: 'rgba(236, 72, 153, 0.55)',
    glassGlow: 'rgba(6, 182, 212, 0.25)',
    glassSpecular: 'rgba(6, 182, 212, 0.2)',
    card: 'rgba(11, 20, 44, 0.76)',
    cardBorder: 'rgba(6, 182, 212, 0.22)',
    cardHover: 'rgba(18, 32, 70, 0.9)',

    primary: '#06B6D4',
    primaryLight: '#22D3EE',
    primaryDark: '#0891B2',
    primaryGradientStart: '#06B6D4',
    primaryGradientEnd: '#EC4899',
    accentBlue: '#38BDF8',
    accentCyan: '#22D3EE',
    accentPurple: '#C084FC',
    accentPink: '#F43F5E',
    accentOrange: '#FB923C',
    accentEmerald: '#34D399',

    highPriority: '#F43F5E',
    highPriorityBg: 'rgba(244, 63, 94, 0.2)',
    mediumPriority: '#FBBF24',
    mediumPriorityBg: 'rgba(251, 191, 36, 0.2)',
    lowPriority: '#34D399',
    lowPriorityBg: 'rgba(52, 211, 153, 0.2)',

    success: '#34D399',
    successBg: 'rgba(52, 211, 153, 0.2)',
    warning: '#FBBF24',
    warningBg: 'rgba(251, 191, 36, 0.2)',
    error: '#F43F5E',
    errorBg: 'rgba(244, 63, 94, 0.2)',
    info: '#38BDF8',
    infoBg: 'rgba(56, 189, 248, 0.2)',

    text: '#F0FDFA',
    textSecondary: '#99F6E4',
    textMuted: '#5EEAD4',
    textInverse: '#040711',

    border: 'rgba(6, 182, 212, 0.18)',
    borderLight: 'rgba(6, 182, 212, 0.3)',
    borderFocus: '#06B6D4',
    divider: 'rgba(6, 182, 212, 0.12)',
    overlay: 'rgba(2, 4, 10, 0.88)',
    modalBackground: '#080F22',
    tabBarBackground: 'rgba(7, 13, 28, 0.92)',
  },

  sunset: {
    background: '#0D0806',
    backgroundSecondary: '#18100C',
    surface: '#20140F',
    surfaceHighlight: '#301F18',
    surfaceSubtle: '#140C08',

    glassCard: 'rgba(32, 20, 15, 0.76)',
    glassCardHover: 'rgba(48, 31, 24, 0.9)',
    glassBorder: 'rgba(249, 115, 22, 0.22)',
    glassBorderHighlight: 'rgba(245, 158, 11, 0.55)',
    glassGlow: 'rgba(249, 115, 22, 0.22)',
    glassSpecular: 'rgba(254, 215, 170, 0.2)',
    card: 'rgba(32, 20, 15, 0.76)',
    cardBorder: 'rgba(249, 115, 22, 0.22)',
    cardHover: 'rgba(48, 31, 24, 0.9)',

    primary: '#F97316',
    primaryLight: '#FB923C',
    primaryDark: '#EA580C',
    primaryGradientStart: '#F97316',
    primaryGradientEnd: '#EF4444',
    accentBlue: '#60A5FA',
    accentCyan: '#38BDF8',
    accentPurple: '#E879F9',
    accentPink: '#FB7185',
    accentOrange: '#F97316',
    accentEmerald: '#34D399',

    highPriority: '#EF4444',
    highPriorityBg: 'rgba(239, 68, 68, 0.2)',
    mediumPriority: '#F59E0B',
    mediumPriorityBg: 'rgba(245, 158, 11, 0.2)',
    lowPriority: '#10B981',
    lowPriorityBg: 'rgba(16, 185, 129, 0.2)',

    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.2)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.2)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.2)',
    info: '#F97316',
    infoBg: 'rgba(249, 115, 22, 0.2)',

    text: '#FFF7ED',
    textSecondary: '#FED7AA',
    textMuted: '#FB923C',
    textInverse: '#0D0806',

    border: 'rgba(249, 115, 22, 0.18)',
    borderLight: 'rgba(249, 115, 22, 0.3)',
    borderFocus: '#F97316',
    divider: 'rgba(249, 115, 22, 0.12)',
    overlay: 'rgba(10, 5, 3, 0.88)',
    modalBackground: '#1A0E0A',
    tabBarBackground: 'rgba(16, 9, 6, 0.92)',
  },
};

// Default fallback color reference
export const Colors = ThemePalettes.dark;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  full: 9999,
};

const fontStack = Platform.select({
  ios: 'SF Pro Display, -apple-system, BlinkMacSystemFont',
  android: 'SF Pro Display, Roboto, sans-serif',
  default: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
});

export const Typography = {
  fontFamily: fontStack,
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

// Liquid Glass Helper Style presets
export const LiquidGlass = {
  card: {
    backgroundColor: Colors.glassCard,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  modal: {
    backgroundColor: Colors.modalBackground,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 16,
  },
};
