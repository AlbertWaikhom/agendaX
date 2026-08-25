import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';
import { EventItem } from '../../types';
import { formatDatePretty, formatTimePretty } from '../../utils';

interface UpcomingEventCardProps {
  event: EventItem | null;
  onPress?: () => void;
  onAddEventPress?: () => void;
}

export const UpcomingEventCard: React.FC<UpcomingEventCardProps> = ({
  event,
  onPress,
  onAddEventPress,
}) => {
  if (!event) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={32} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>No Upcoming Events</Text>
        <Text style={styles.emptySubtitle}>Keep your schedule organized by adding your next event</Text>
        {onAddEventPress && (
          <TouchableOpacity onPress={onAddEventPress} style={styles.addBtn}>
            <Ionicons name="add-circle-outline" size={16} color={Colors.primaryLight} />
            <Text style={styles.addBtnText}>Schedule an Event</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const timeFormatted = `${formatTimePretty(event.startTime)}${event.endTime ? ` - ${formatTimePretty(event.endTime)}` : ''}`;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, { borderLeftColor: event.color || Colors.primary }]}
    >
      <View style={styles.topRow}>
        <View style={styles.dateBadge}>
          <Ionicons name="time-outline" size={14} color={Colors.primaryLight} />
          <Text style={styles.dateBadgeText}>{formatDatePretty(event.date)}</Text>
        </View>
        {event.reminderEnabled && (
          <View style={styles.reminderBadge}>
            <Ionicons name="notifications-outline" size={12} color={Colors.accentPink} />
            <Text style={styles.reminderBadgeText}>Reminder set</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {event.name}
      </Text>

      {event.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.timeInfo}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.footerText}>{timeFormatted}</Text>
        </View>

        {event.location ? (
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.footerText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  addBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primaryLight,
    marginLeft: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  dateBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryLight,
    marginLeft: 4,
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.accentPink}20`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  reminderBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.accentPink,
    marginLeft: 4,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  description: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});
