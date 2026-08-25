import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';
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
      <View style={[styles.colorBanner, { backgroundColor: event.color || Colors.primary }]} />

      <Text style={styles.title}>{event.name}</Text>

      {/* Main Meta Information */}
      <View style={styles.detailsCard}>
        {/* Date & Time */}
        <View style={styles.metaRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-outline" size={18} color={Colors.primaryLight} />
          </View>
          <View style={styles.metaTextGroup}>
            <Text style={styles.metaLabel}>Date & Time</Text>
            <Text style={styles.metaValue}>
              {formatDatePretty(event.date)} • {timeFormatted}
            </Text>
          </View>
        </View>

        {/* Location */}
        {event.location ? (
          <View style={styles.metaRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={18} color={Colors.accentPink} />
            </View>
            <View style={styles.metaTextGroup}>
              <Text style={styles.metaLabel}>Location</Text>
              <Text style={styles.metaValue}>{event.location}</Text>
            </View>
          </View>
        ) : null}

        {/* Repeat */}
        <View style={styles.metaRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="repeat-outline" size={18} color={Colors.accentCyan} />
          </View>
          <View style={styles.metaTextGroup}>
            <Text style={styles.metaLabel}>Repeat</Text>
            <Text style={styles.metaValue}>
              {event.repeat === 'none' ? 'Does not repeat' : `Repeats ${event.repeat}`}
            </Text>
          </View>
        </View>

        {/* Reminder */}
        <View style={styles.metaRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={18} color={Colors.mediumPriority} />
          </View>
          <View style={styles.metaTextGroup}>
            <Text style={styles.metaLabel}>Reminder</Text>
            <Text style={styles.metaValue}>
              {event.reminderEnabled ? `Set (${event.reminderTime?.replace(/_/g, ' ') || 'at event time'})` : 'Disabled'}
            </Text>
          </View>
        </View>

        {/* URL */}
        {event.url ? (
          <TouchableOpacity onPress={handleOpenUrl} style={styles.metaRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="link-outline" size={18} color={Colors.accentBlue} />
            </View>
            <View style={styles.metaTextGroup}>
              <Text style={styles.metaLabel}>Attached Link</Text>
              <Text style={[styles.metaValue, styles.linkValue]} numberOfLines={1}>
                {event.url}
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color={Colors.accentBlue} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Description */}
      {event.description ? (
        <View style={styles.descriptionCard}>
          <Text style={styles.descLabel}>Notes & Description</Text>
          <Text style={styles.description}>{event.description}</Text>
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
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: Spacing.lg,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  metaTextGroup: {
    flex: 1,
  },
  metaLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  linkValue: {
    color: Colors.accentBlue,
    textDecorationLine: 'underline',
  },
  descriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  descLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});
