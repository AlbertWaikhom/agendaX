import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryBreakdown } from '../../services/expenseService';
import { Typography, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface ExpenseDonutChartProps {
  categories: CategoryBreakdown[];
  totalSpent: number;
  currencySymbol?: string;
}

export const ExpenseDonutChart: React.FC<ExpenseDonutChartProps> = ({
  categories,
  totalSpent,
  currencySymbol = '₹',
}) => {
  const { colors } = useTheme();

  // Top categories (up to 5 for clean layout, rest combined if needed)
  const sortedCategories = [...categories].sort((a, b) => b.total - a.total);
  const topCategories = sortedCategories.slice(0, 5);

  // Split into left side and right side for the mockup layout
  const leftCategories = topCategories.filter((_, idx) => idx % 2 === 1);
  const rightCategories = topCategories.filter((_, idx) => idx % 2 === 0);

  const ringColors = [
    '#06B6D4', // Cyan
    '#8B5CF6', // Purple
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#3B82F6', // Blue
  ];

  if (categories.length === 0 || totalSpent === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.donutOuter, { borderColor: `${colors.border}40` }]}>
          <View style={[styles.donutInner, { backgroundColor: colors.glassCard }]}>
            <Ionicons name="pie-chart-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>0% Spent</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Surrounding Labels Row */}
      <View style={styles.donutContentRow}>
        {/* Left Category Labels */}
        <View style={styles.sideColumn}>
          {leftCategories.map((cat, idx) => {
            const catColor = cat.color || ringColors[idx % ringColors.length];
            return (
              <View key={cat.category} style={styles.categoryBadgeLeft}>
                <View style={[styles.colorIndicator, { backgroundColor: catColor }]} />
                <View>
                  <Text style={[styles.categoryName, { color: colors.textSecondary }]}>
                    {cat.category}
                  </Text>
                  <Text style={[styles.categoryPercent, { color: catColor }]}>
                    {cat.percentage}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Center Donut Visual */}
        <View style={styles.donutWrapper}>
          {/* Outer Multi-color Ring Illusion */}
          <View style={[styles.donutOuterRing, { borderColor: `${colors.glassBorder}80` }]}>
            {/* Render 4 quadrants / multi-segment border arcs */}
            {topCategories.map((cat, index) => {
              const segColor = cat.color || ringColors[index % ringColors.length];
              const rotation = (index * 72) % 360;
              return (
                <View
                  key={cat.category}
                  style={[
                    styles.ringSegment,
                    {
                      borderColor: segColor,
                      transform: [{ rotate: `${rotation}deg` }],
                    },
                  ]}
                />
              );
            })}

            {/* Inner Hollow Center */}
            <View style={[styles.donutHole, { backgroundColor: colors.glassCard }]}>
              <Ionicons name="wallet" size={24} color={colors.primaryLight} />
              <Text style={[styles.donutCenterLabel, { color: colors.textMuted }]}>
                {topCategories.length} {topCategories.length === 1 ? 'Category' : 'Categories'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right Category Labels */}
        <View style={styles.sideColumn}>
          {rightCategories.map((cat, idx) => {
            const catColor = cat.color || ringColors[(idx + 2) % ringColors.length];
            return (
              <View key={cat.category} style={styles.categoryBadgeRight}>
                <View>
                  <Text style={[styles.categoryNameRight, { color: colors.textSecondary }]}>
                    {cat.category}
                  </Text>
                  <Text style={[styles.categoryPercentRight, { color: catColor }]}>
                    {cat.percentage}%
                  </Text>
                </View>
                <View style={[styles.colorIndicator, { backgroundColor: catColor }]} />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  donutContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.xs,
  },
  sideColumn: {
    flex: 1,
    justifyContent: 'space-around',
    gap: 16,
  },
  categoryBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadgeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
  },
  categoryNameRight: {
    fontFamily: Typography.fontFamily,
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'right',
  },
  categoryPercent: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
  },
  categoryPercentRight: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'right',
  },
  donutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.xs,
  },
  donutOuterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringSegment: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  donutHole: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  donutCenterLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 4,
  },
  donutOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 6,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 4,
  },
});
