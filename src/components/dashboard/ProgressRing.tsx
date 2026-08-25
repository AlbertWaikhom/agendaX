import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';

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
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Task Completion</Text>
          <Text style={styles.subtitle}>
            {total === 0 ? 'No tasks scheduled' : `${completed} of ${total} tasks completed`}
          </Text>
        </View>
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>{clampedPercentage}%</Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedPercentage}%`,
              backgroundColor:
                clampedPercentage === 100
                  ? Colors.success
                  : clampedPercentage > 50
                  ? Colors.primaryLight
                  : Colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  percentageBadge: {
    backgroundColor: `${Colors.primary}25`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: `${Colors.primary}60`,
  },
  percentageText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.heavy,
    color: Colors.primaryLight,
  },
  track: {
    height: 8,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
