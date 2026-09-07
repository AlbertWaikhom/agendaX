import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface ProgressRingProps {
  completed: number;
  total: number;
  percentage: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  completed,
  total,
  percentage,
}) => {
  const { colors } = useTheme();
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Task Completion</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {total === 0 ? 'No tasks scheduled' : `${completed} of ${total} tasks completed`}
          </Text>
        </View>
        <View
          style={[
            styles.percentageBadge,
            { backgroundColor: `${colors.primary}25`, borderColor: `${colors.primary}60` },
          ]}
        >
          <Text style={[styles.percentageText, { color: colors.primaryLight }]}>{clampedPercentage}%</Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={[styles.track, { backgroundColor: colors.surfaceHighlight }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedPercentage}%`,
              backgroundColor:
                clampedPercentage === 100
                  ? colors.success
                  : clampedPercentage > 50
                  ? colors.primaryLight
                  : colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  percentageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  percentageText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.heavy,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
