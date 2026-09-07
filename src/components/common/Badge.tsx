import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Typography, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Priority } from '../../types';

interface PriorityBadgeProps {
  priority: Priority;
  style?: StyleProp<ViewStyle>;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, style }) => {
  const { colors } = useTheme();

  let bg = colors.mediumPriorityBg;
  let text = colors.mediumPriority;
  let label = 'Medium';

  if (priority === 'high') {
    bg = colors.highPriorityBg;
    text = colors.highPriority;
    label = 'High';
  } else if (priority === 'low') {
    bg = colors.lowPriorityBg;
    text = colors.lowPriority;
    label = 'Low';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: text }, style]}>
      <View style={[styles.dot, { backgroundColor: text }]} />
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
};

interface CategoryPillProps {
  label: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  color,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();
  const activeColor = color || colors.primary;

  return (
    <View style={[styles.categoryPill, { backgroundColor: `${activeColor}20`, borderColor: `${activeColor}50` }, style]}>
      <Text style={[styles.categoryLabel, { color: activeColor }, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 0.5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  categoryLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
});
