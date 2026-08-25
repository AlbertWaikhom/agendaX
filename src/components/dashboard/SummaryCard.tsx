import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface SummaryCardProps {
  title: string;
  count: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  count,
  icon,
  color,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.glassCard,
          borderColor: `${color}35`,
        },
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.count, { color: colors.text }]}>{count}</Text>
        <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  content: {
    justifyContent: 'center',
  },
  count: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.heavy,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 2,
  },
});
