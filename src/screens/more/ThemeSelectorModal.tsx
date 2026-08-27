import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { ModalWrapper } from '../../components/common/ModalWrapper';
import { ThemeMode } from '../../types';

interface ThemeOption {
  id: ThemeMode;
  name: string;
  description: string;
  bg: string;
  accent: string;
  previewCard: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'sunset',
    name: 'Sunset Amber',
    description: 'Warm obsidian dark mode with glowing molten amber specular refraction',
    bg: '#0D0806',
    accent: '#F97316',
    previewCard: '#20140F',
  },
  {
    id: 'dark',
    name: 'Liquid Dark',
    description: 'Deep midnight obsidian with crisp indigo accents and glass specular highlights',
    bg: '#070A12',
    accent: '#6366F1',
    previewCard: '#111827',
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    description: 'Futuristic dark glass with luminous electric cyan and neon glow',
    bg: '#040711',
    accent: '#06B6D4',
    previewCard: '#0B132B',
  },
  {
    id: 'light',
    name: 'Crystal Light',
    description: 'Ultra-clean luminous white glass with vivid sapphire contrast',
    bg: '#F8FAFC',
    accent: '#4F46E5',
    previewCard: '#FFFFFF',
  },
];

interface ThemeSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  visible,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  const { colors } = useTheme();

  const handleSelect = (themeId: ThemeMode) => {
    Haptics.selectionAsync().catch(() => {});
    onSelectTheme(themeId);
    onClose();
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} title="Choose App Theme">
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Select an AgendaX Liquid Effect theme to customize your workspace appearance and specular glass glow.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.themesList}>
        {THEME_OPTIONS.map(opt => {
          const isSelected = currentTheme === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.85}
              onPress={() => handleSelect(opt.id)}
              style={[
                styles.themeOptionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? opt.accent : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
                isSelected && {
                  shadowColor: opt.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 6,
                },
              ]}
            >
              {/* Theme Color Palette Preview Box */}
              <View style={[styles.previewSquare, { backgroundColor: opt.bg, borderColor: `${opt.accent}60`, borderWidth: 1.5 }]}>
                <View style={[styles.colorOrb, { backgroundColor: opt.accent }]} />
                <View style={[styles.innerMiniCard, { backgroundColor: opt.previewCard, borderColor: `${opt.accent}40`, borderWidth: 1 }]}>
                  <View style={[styles.miniLine, { backgroundColor: opt.accent }]} />
                  <View style={[styles.miniLineSub, { backgroundColor: `${opt.accent}60` }]} />
                </View>
              </View>

              {/* Theme Details */}
              <View style={styles.themeInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.themeName, { color: colors.text }]}>{opt.name}</Text>
                  {isSelected && (
                    <View style={[styles.activePill, { backgroundColor: `${opt.accent}25`, borderColor: opt.accent }]}>
                      <Ionicons name="checkmark-circle" size={13} color={opt.accent} />
                      <Text style={[styles.activePillText, { color: opt.accent }]}>Active</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.themeDesc, { color: colors.textMuted }]}>{opt.description}</Text>
              </View>

              {/* Radio Indicator */}
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: isSelected ? opt.accent : colors.textMuted },
                  isSelected && { backgroundColor: `${opt.accent}20` },
                ]}
              >
                {isSelected && <View style={[styles.radioInner, { backgroundColor: opt.accent }]} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  themesList: {
    maxHeight: 460,
  },
  themeOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  previewSquare: {
    width: 58,
    height: 58,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  colorOrb: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    opacity: 0.8,
  },
  innerMiniCard: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    padding: 4,
    justifyContent: 'center',
    gap: 3,
  },
  miniLine: {
    width: '70%',
    height: 4,
    borderRadius: 2,
  },
  miniLineSub: {
    width: '45%',
    height: 3,
    borderRadius: 2,
  },
  themeInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  themeName: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -0.2,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  activePillText: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  themeDesc: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
