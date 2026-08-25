import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';
import { EventItem } from '../../types';
import { formatDatePretty, formatTimePretty } from '../../utils';

interface EventCardProps {
  event: EventItem;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const timeFormatted = `${formatTimePretty(event.startTime)}${event.endTime ? ` - ${formatTimePretty(event.endTime)}` : ''}`;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.card, { borderLeftColor: event.color || Colors.primary }]}
    >
      <View style={styles.headerRow}>
        <View style={styles.timeTag}>
          <Ionicons name="time-outline" size={13} color={Colors.primaryLight} />
          <Text style={styles.timeTagText}>{timeFormatted}</Text>
        </View>

        <View style={styles.badgeGroup}>
          {event.repeat !== 'none' && (
            <View style={styles.repeatBadge}>
              <Ionicons name="repeat" size={12} color={Colors.accentCyan} />
              <Text style={styles.repeatText}>{event.repeat}</Text>
            </View>
          )}

          {event.reminderEnabled && (
            <View style={styles.reminderBadge}>
              <Ionicons name="notifications-outline" size={12} color={Colors.accentPink} />
            </View>
          )}
        </View>
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
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.footerText}>{formatDatePretty(event.date)}</Text>
        </View>

        {event.location ? (
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
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
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  timeTagText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primaryLight,
    marginLeft: 4,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.accentCyan}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: 6,
  },
  repeatText: {
    fontSize: 10,
    color: Colors.accentCyan,
    textTransform: 'capitalize',
    marginLeft: 2,
  },
  reminderBadge: {
    padding: 3,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  description: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 17,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: Colors.divider,
  },
  dateInfo: {
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
    color: Colors.textMuted,
    marginLeft: 4,
  },
});
