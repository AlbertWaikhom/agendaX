import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
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
  const { colors } = useTheme();

  if (!event) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No Upcoming Events</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Keep your schedule organized by adding your next event</Text>
        {onAddEventPress && (
          <TouchableOpacity
            onPress={onAddEventPress}
            style={[styles.addBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.borderLight }]}
          >
            <Ionicons name="add-circle-outline" size={16} color={colors.primaryLight} />
            <Text style={[styles.addBtnText, { color: colors.primaryLight }]}>Schedule an Event</Text>
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
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderLeftColor: event.color || colors.primary,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.dateBadge, { backgroundColor: `${colors.primary}20` }]}>
          <Ionicons name="time-outline" size={14} color={colors.primaryLight} />
          <Text style={[styles.dateBadgeText, { color: colors.primaryLight }]}>{formatDatePretty(event.date)}</Text>
        </View>
        {event.reminderEnabled && (
          <View style={[styles.reminderBadge, { backgroundColor: `${colors.accentPink}20` }]}>
            <Ionicons name="notifications-outline" size={12} color={colors.accentPink} />
            <Text style={[styles.reminderBadgeText, { color: colors.accentPink }]}>Reminder set</Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {event.name}
      </Text>

      {event.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {event.description}
        </Text>
      ) : null}

      <View style={[styles.footerRow, { borderColor: colors.divider }]}>
        <View style={styles.timeInfo}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>{timeFormatted}</Text>
        </View>

        {event.location ? (
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.footerText, { color: colors.textSecondary }]} numberOfLines={1}>
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  dateBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: 4,
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  reminderBadgeText: {
    fontSize: Typography.fontSize.xs,
    marginLeft: 4,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  description: {
    fontSize: Typography.fontSize.xs,
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
    marginLeft: 4,
  },
});
