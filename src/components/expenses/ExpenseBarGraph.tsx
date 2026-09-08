import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MonthlyComparisonPoint, CategoryBreakdown } from '../../services/expenseService';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface ExpenseBarGraphProps {
  monthlyPoints: MonthlyComparisonPoint[];
  categoryBreakdown: CategoryBreakdown[];
  currencySymbol?: string;
  onSelectMonth?: (monthKey: string) => void;
}

export const ExpenseBarGraph: React.FC<ExpenseBarGraphProps> = ({
  monthlyPoints,
  categoryBreakdown,
  currencySymbol = '₹',
  onSelectMonth,
}) => {
  const { colors } = useTheme();
  const [viewMode, setViewMode] = useState<'monthly' | 'categories'>('monthly');

  // Max values for relative scaling
  const maxMonthlyTotal = Math.max(...monthlyPoints.map(p => p.total), 1);
  const maxCategoryTotal = Math.max(...categoryBreakdown.map(c => c.total), 1);

  return (
    <View style={[styles.card, { backgroundColor: colors.glassCard, borderColor: colors.glassBorder }]}>
      {/* Header with Mode Switcher */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Spending Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {viewMode === 'monthly' ? '6-Month comparison trend' : 'Category distribution'}
          </Text>
        </View>

        <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceHighlight }]}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === 'monthly' && [styles.toggleBtnActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setViewMode('monthly')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="bar-chart"
              size={14}
              color={viewMode === 'monthly' ? '#FFFFFF' : colors.textMuted}
            />
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'monthly' ? '#FFFFFF' : colors.textMuted },
              ]}
            >
              Trend
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === 'categories' && [styles.toggleBtnActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setViewMode('categories')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="pie-chart"
              size={14}
              color={viewMode === 'categories' ? '#FFFFFF' : colors.textMuted}
            />
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'categories' ? '#FFFFFF' : colors.textMuted },
              ]}
            >
              Categories
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Monthly Trend View */}
      {viewMode === 'monthly' ? (
        <View style={styles.graphBody}>
          <View style={styles.barsContainer}>
            {monthlyPoints.map(point => {
              const heightRatio = point.total / maxMonthlyTotal;
              const heightPercent = Math.min(100, Math.max(12, Math.round(heightRatio * 100)));
              const displayAmount =
                point.total >= 1000
                  ? `${currencySymbol}${(point.total / 1000).toFixed(point.total >= 10000 ? 0 : 1)}k`
                  : `${currencySymbol}${point.total.toFixed(0)}`;

              return (
                <TouchableOpacity
                  key={point.monthKey}
                  style={styles.barColumn}
                  activeOpacity={0.8}
                  onPress={() => onSelectMonth?.(point.monthKey)}
                >
                  <Text style={[styles.barAmount, { color: point.isCurrent ? colors.accentPink : colors.textMuted }]}>
                    {point.total > 0 ? displayAmount : '₹0'}
                  </Text>

                  <View style={[styles.barTrack, { backgroundColor: colors.surfaceHighlight }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: point.isCurrent ? colors.accentPink : colors.primaryLight,
                          borderColor: point.isCurrent ? '#FFFFFF' : 'transparent',
                          borderWidth: point.isCurrent ? 1 : 0,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.barLabel,
                      { color: point.isCurrent ? colors.text : colors.textSecondary },
                      point.isCurrent && styles.barLabelCurrent,
                    ]}
                  >
                    {point.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Baseline Guide */}
          <View style={[styles.baseline, { backgroundColor: colors.border }]} />
        </View>
      ) : (
        /* Categories Distribution View */
        <View style={styles.graphBody}>
          {categoryBreakdown.length === 0 ? (
            <View style={styles.emptyCatContainer}>
              <Text style={[styles.emptyCatText, { color: colors.textMuted }]}>
                No category data for this month
              </Text>
            </View>
          ) : (
            <View style={styles.barsContainer}>
              {categoryBreakdown.slice(0, 5).map(cat => {
                const heightRatio = cat.total / maxCategoryTotal;
                const heightPercent = Math.min(100, Math.max(12, Math.round(heightRatio * 100)));
                const displayAmount =
                  cat.total >= 1000
                    ? `${currencySymbol}${(cat.total / 1000).toFixed(1)}k`
                    : `${currencySymbol}${cat.total.toFixed(0)}`;

                return (
                  <View key={cat.category} style={styles.barColumn}>
                    <Text style={[styles.barAmount, { color: cat.color }]}>
                      {displayAmount}
                    </Text>

                    <View style={[styles.barTrack, { backgroundColor: colors.surfaceHighlight }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${heightPercent}%`,
                            backgroundColor: cat.color,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      numberOfLines={1}
                      style={[styles.barLabel, { color: colors.textSecondary }]}
                    >
                      {cat.category.split(' ')[0]}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Baseline Guide */}
          <View style={[styles.baseline, { backgroundColor: colors.border }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  subtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    padding: 3,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  toggleBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
  },
  graphBody: {
    paddingTop: Spacing.sm,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    paddingBottom: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  barAmount: {
    fontFamily: Typography.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 6,
  },
  barTrack: {
    width: 22,
    height: 105,
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: BorderRadius.sm,
  },
  barLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 8,
    textAlign: 'center',
  },
  barLabelCurrent: {
    fontWeight: Typography.fontWeight.bold,
  },
  baseline: {
    height: 1,
    width: '100%',
    marginTop: 2,
    opacity: 0.4,
  },
  emptyCatContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCatText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
  },
});
