import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { EventItem } from '../../types';
import { formatDatePretty, formatTimePretty } from '../../utils';

interface EventCardProps {
  event: EventItem;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { colors } = useTheme();
  const timeFormatted = `${formatTimePretty(event.startTime)}${event.endTime ? ` - ${formatTimePretty(event.endTime)}` : ''}`;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderLeftColor: event.color || colors.primary,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.timeTag, { backgroundColor: `${colors.primary}20` }]}>
          <Ionicons name="time-outline" size={13} color={colors.primaryLight} />
          <Text style={[styles.timeTagText, { color: colors.primaryLight }]}>{timeFormatted}</Text>
        </View>

        <View style={styles.badgeGroup}>
          {event.repeat !== 'none' && (
            <View style={[styles.repeatBadge, { backgroundColor: `${colors.accentCyan}20` }]}>
              <Ionicons name="repeat" size={12} color={colors.accentCyan} />
              <Text style={[styles.repeatText, { color: colors.accentCyan }]}>{event.repeat}</Text>
            </View>
          )}

          {event.reminderEnabled && (
            <View style={styles.reminderBadge}>
              <Ionicons name="notifications-outline" size={12} color={colors.accentPink} />
            </View>
          )}
        </View>
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
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
          <Text style={[styles.footerText, { color: colors.textMuted }]}>{formatDatePretty(event.date)}</Text>
        </View>

        {event.location ? (
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={[styles.footerText, { color: colors.textMuted }]} numberOfLines={1}>
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  timeTagText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: 4,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: 6,
  },
  repeatText: {
    fontSize: 10,
    textTransform: 'capitalize',
    marginLeft: 2,
  },
  reminderBadge: {
    padding: 3,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  description: {
    fontSize: Typography.fontSize.xs,
    marginBottom: 8,
    lineHeight: 17,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
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
    marginLeft: 4,
  },
});
