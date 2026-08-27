import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface BentoStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  badgeText?: string;
  badgeColor?: string;
  onPress?: () => void;
  style?: any;
}

export const BentoStatCard: React.FC<BentoStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor,
  badgeText,
  badgeColor,
  onPress,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onPress) onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.card,
          {
            backgroundColor: colors.glassCard,
            borderColor: colors.glassBorder,
            borderTopColor: colors.glassSpecular,
          },
        ]}
      >
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}18` }]}>
            <Ionicons name={icon} size={20} color={accentColor} />
          </View>

          {badgeText ? (
            <View style={[styles.badge, { backgroundColor: badgeColor ? `${badgeColor}20` : `${accentColor}20` }]}>
              <Text style={[styles.badgeText, { color: badgeColor || accentColor }]}>{badgeText}</Text>
            </View>
          ) : (
            <View style={[styles.glowDot, { backgroundColor: accentColor }]} />
          )}
        </View>

        {/* Value and Title */}
        <View style={styles.contentContainer}>
          <Text style={[styles.value, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
            {value}
          </Text>
          <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Ambient accent highlight line on bottom */}
        <View style={[styles.bottomAccentBar, { backgroundColor: accentColor }]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 128,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  glowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
  contentContainer: {
    marginTop: Spacing.xs,
  },
  value: {
    fontFamily: Typography.fontFamily,
    fontSize: 26,
    fontWeight: Typography.fontWeight.heavy,
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  subtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    marginTop: 2,
  },
  bottomAccentBar: {
    position: 'absolute',
    bottom: 0,
    left: Spacing.md,
    right: Spacing.md,
    height: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    opacity: 0.5,
  },
});
