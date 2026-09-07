import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { EventItem } from '../../types';
import { formatDatePretty, formatTimePretty } from '../../utils';
import { ModalWrapper } from '../common/ModalWrapper';
import { Button } from '../common/Button';

interface EventDetailsModalProps {
  visible: boolean;
  event: EventItem | null;
  onClose: () => void;
  onEdit: (event: EventItem) => void;
  onDelete: (id: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  visible,
  event,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  if (!event) return null;

  const timeFormatted = `${formatTimePretty(event.startTime)}${event.endTime ? ` - ${formatTimePretty(event.endTime)}` : ''}`;

  const handleShare = async () => {
    try {
      const shareMessage = `📅 ${event.name}\n🗓️ ${formatDatePretty(event.date)} at ${timeFormatted}${event.location ? `\n📍 ${event.location}` : ''}${event.description ? `\n\n${event.description}` : ''}${event.url ? `\n🔗 ${event.url}` : ''}\n\nShared via AgendaX`;
      await Share.share({
        message: shareMessage,
        title: event.name,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleOpenUrl = () => {
    if (event.url) {
      Linking.openURL(event.url).catch(e => console.warn('Cannot open URL:', e));
    }
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} title="Event Details">
      {/* Category color bar banner */}
      <View style={[styles.colorBanner, { backgroundColor: event.color || colors.primary }]} />

      <Text style={[styles.title, { color: colors.text }]}>{event.name}</Text>

      {/* Main Meta Information */}
      <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Date & Time */}
        <View style={[styles.metaRow, { borderColor: colors.divider }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight }]}>
            <Ionicons name="calendar-outline" size={18} color={colors.primaryLight} />
          </View>
          <View style={styles.metaTextGroup}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Date & Time</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {formatDatePretty(event.date)} • {timeFormatted}
            </Text>
          </View>
        </View>

        {/* Location */}
        {event.location ? (
          <View style={[styles.metaRow, { borderColor: colors.divider }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons name="location-outline" size={18} color={colors.accentPink} />
            </View>
            <View style={styles.metaTextGroup}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Location</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{event.location}</Text>
            </View>
          </View>
        ) : null}

        {/* Repeat */}
        <View style={[styles.metaRow, { borderColor: colors.divider }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight }]}>
            <Ionicons name="repeat-outline" size={18} color={colors.accentCyan} />
          </View>
          <View style={styles.metaTextGroup}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Repeat</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {event.repeat === 'none' ? 'Does not repeat' : `Repeats ${event.repeat}`}
            </Text>
          </View>
        </View>

        {/* Reminder */}
        <View style={[styles.metaRow, { borderColor: colors.divider }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight }]}>
            <Ionicons name="notifications-outline" size={18} color={colors.mediumPriority} />
          </View>
          <View style={styles.metaTextGroup}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Reminder</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {event.reminderEnabled ? `Set (${event.reminderTime?.replace(/_/g, ' ') || 'at event time'})` : 'Disabled'}
            </Text>
          </View>
        </View>

        {/* URL */}
        {event.url ? (
          <TouchableOpacity onPress={handleOpenUrl} style={[styles.metaRow, { borderColor: colors.divider }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons name="link-outline" size={18} color={colors.accentBlue} />
            </View>
            <View style={styles.metaTextGroup}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Attached Link</Text>
              <Text style={[styles.metaValue, styles.linkValue, { color: colors.accentBlue }]} numberOfLines={1}>
                {event.url}
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.accentBlue} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Description */}
      {event.description ? (
        <View style={[styles.descriptionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.descLabel, { color: colors.textSecondary }]}>Notes & Description</Text>
          <Text style={[styles.description, { color: colors.text }]}>{event.description}</Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actionsGrid}>
        <Button
          title="Share Event"
          variant="secondary"
          icon="share-social-outline"
          onPress={handleShare}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title="Edit"
          variant="secondary"
          icon="create-outline"
          onPress={() => {
            onClose();
            onEdit(event);
          }}
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>

      <Button
        title="Delete Event"
        variant="danger"
        icon="trash-outline"
        onPress={() => {
          onClose();
          onDelete(event.id);
        }}
        style={{ marginTop: Spacing.md }}
      />
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  colorBanner: {
    height: 6,
    borderRadius: 3,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.heavy,
    letterSpacing: -0.5,
    marginBottom: Spacing.lg,
  },
  detailsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  metaTextGroup: {
    flex: 1,
  },
  metaLabel: {
    fontSize: Typography.fontSize.xs,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  linkValue: {
    textDecorationLine: 'underline',
  },
  descriptionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  descLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});
