import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';
import { PriorityBadge, CategoryPill } from '../common/Badge';
import { Priority } from '../../types';
import { formatTimePretty } from '../../utils';

export interface ScheduleItemData {
  id: string;
  type: 'task' | 'event';
  title: string;
  time?: string;
  category?: string;
  priority?: Priority;
  completed?: boolean;
  color?: string;
  location?: string;
}

interface TodayScheduleItemProps {
  item: ScheduleItemData;
  onPress?: () => void;
  onToggleComplete?: () => void;
}

export const TodayScheduleItem: React.FC<TodayScheduleItemProps> = ({
  item,
  onPress,
  onToggleComplete,
}) => {
  const isTask = item.type === 'task';
  const displayTime = item.time ? formatTimePretty(item.time) : 'All Day';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.container,
        item.completed && styles.containerCompleted,
        { borderLeftColor: item.color || (item.priority === 'high' ? Colors.highPriority : Colors.primary) },
      ]}
    >
      {/* Time & Type icon */}
      <View style={styles.timeSection}>
        <Text style={styles.timeText}>{displayTime}</Text>
        <View style={styles.typeIndicator}>
          <Ionicons
            name={isTask ? 'checkmark-circle-outline' : 'calendar-outline'}
            size={14}
            color={Colors.textMuted}
          />
          <Text style={styles.typeText}>{isTask ? 'Task' : 'Event'}</Text>
        </View>
      </View>

      {/* Main Info */}
      <View style={styles.contentSection}>
        <Text
          style={[styles.title, item.completed && styles.titleCompleted]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {item.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        )}

        <View style={styles.tagsRow}>
          {item.category && <CategoryPill label={item.category} color={item.color} style={styles.tag} />}
          {isTask && item.priority && <PriorityBadge priority={item.priority} style={styles.tag} />}
        </View>
      </View>

      {/* Checkbox for Task */}
      {isTask && onToggleComplete && (
        <TouchableOpacity
          onPress={onToggleComplete}
          style={[styles.checkbox, item.completed && styles.checkboxCompleted]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {item.completed && <Ionicons name="checkmark" size={14} color="#FFF" />}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderLeftWidth: 4,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  containerCompleted: {
    opacity: 0.6,
    backgroundColor: Colors.surfaceSubtle,
  },
  timeSection: {
    width: 78,
    borderRightWidth: 1,
    borderColor: Colors.border,
    paddingRight: Spacing.sm,
    marginRight: Spacing.md,
  },
  timeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  typeText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginLeft: 3,
    textTransform: 'uppercase',
  },
  contentSection: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginLeft: 3,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  tag: {
    marginRight: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  checkboxCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
});
