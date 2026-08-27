import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Linking, Image, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { TaskItem } from '../../types';
import { formatDatePretty, formatTimePretty } from '../../utils';
import { ModalWrapper } from '../common/ModalWrapper';
import { Button } from '../common/Button';
import { PriorityBadge, CategoryPill } from '../common/Badge';

interface TaskDetailsModalProps {
  visible: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onToggleComplete?: (id: string) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  visible,
  task,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const { colors, isDark } = useTheme();
  const [showFullImage, setShowFullImage] = useState(false);

  if (!task) return null;

  const handleShare = async () => {
    try {
      const shareMessage = `📋 Task: ${task.title}\n📅 Due: ${formatDatePretty(task.dueDate)}${task.dueTime ? ` at ${formatTimePretty(task.dueTime)}` : ''}\n🏷️ Category: ${task.category}\n⚡ Priority: ${task.priority.toUpperCase()}${task.description ? `\n\n${task.description}` : ''}${task.url ? `\n🔗 ${task.url}` : ''}\n\nShared via AgendaX`;
      await Share.share({
        message: shareMessage,
        title: task.title,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleOpenUrl = () => {
    if (task.url) {
      Linking.openURL(task.url).catch(e => console.warn('Cannot open URL:', e));
    }
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} title="Task Overview">
      {/* Top Header Card */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.badgeRow}>
          <CategoryPill label={task.category} />
          <PriorityBadge priority={task.priority} />
          {task.completed && (
            <View style={[styles.completedPill, { backgroundColor: colors.successBg, borderColor: colors.success }]}>
              <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              <Text style={[styles.completedPillText, { color: colors.success }]}>Completed</Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }, task.completed && { textDecorationLine: 'line-through', opacity: 0.8 }]}>
          {task.title}
        </Text>
      </View>

      {/* Attached Image / Screenshot Preview */}
      {task.mediaUri ? (
        <View style={[styles.mediaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Attached Photo / Media</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowFullImage(true)}
            style={styles.imageWrapper}
          >
            <Image
              source={{ uri: task.mediaUri }}
              style={styles.taskImage}
              resizeMode="cover"
            />
            <View style={[styles.expandBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
              <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
              <Text style={styles.expandBadgeText}>Tap to expand</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Metadata Card */}
      <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Due Date & Time */}
        <View style={[styles.metaRow, { borderColor: colors.divider }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight }]}>
            <Ionicons name="calendar-outline" size={18} color={colors.primaryLight} />
          </View>
          <View style={styles.metaTextGroup}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Due Date</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {formatDatePretty(task.dueDate)}
              {task.dueTime ? ` • ${formatTimePretty(task.dueTime)}` : ''}
            </Text>
          </View>
        </View>

        {/* Reminder */}
        <View style={[styles.metaRow, { borderColor: colors.divider }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight }]}>
            <Ionicons name="notifications-outline" size={18} color={colors.accentPink} />
          </View>
          <View style={styles.metaTextGroup}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Reminder</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {task.reminderEnabled
                ? `Active (${task.reminderTime?.replace(/_/g, ' ') || 'at due time'})`
                : 'Disabled'}
            </Text>
          </View>
        </View>

        {/* URL Link */}
        {task.url ? (
          <TouchableOpacity onPress={handleOpenUrl} style={[styles.metaRow, { borderColor: colors.divider }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons name="link-outline" size={18} color={colors.accentBlue} />
            </View>
            <View style={styles.metaTextGroup}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Attached Link</Text>
              <Text style={[styles.metaValue, styles.linkValue, { color: colors.accentBlue }]} numberOfLines={1}>
                {task.url}
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.accentBlue} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Description / Notes */}
      {task.description ? (
        <View style={[styles.descriptionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.descLabel, { color: colors.textSecondary }]}>Task Notes & Description</Text>
          <Text style={[styles.description, { color: colors.text }]}>{task.description}</Text>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actionsGrid}>
        <Button
          title="Share"
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
            onEdit(task);
          }}
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>

      <Button
        title="Delete Task"
        variant="danger"
        icon="trash-outline"
        onPress={() => {
          onClose();
          onDelete(task.id);
        }}
        style={{ marginTop: Spacing.md }}
      />

      {/* Full Image Zoom Modal */}
      {task.mediaUri ? (
        <Modal
          visible={showFullImage}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFullImage(false)}
        >
          <View style={[styles.fullImageOverlay, { backgroundColor: '#000000EB' }]}>
            <TouchableOpacity onPress={() => setShowFullImage(false)} style={styles.closeFullImageBtn}>
              <Ionicons name="close-circle" size={34} color="#FFFFFF" />
            </TouchableOpacity>
            <Image
              source={{ uri: task.mediaUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      ) : null}
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  completedPillText: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.heavy,
    letterSpacing: -0.3,
  },
  mediaCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  imageWrapper: {
    height: 180,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  taskImage: {
    width: '100%',
    height: '100%',
  },
  expandBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  expandBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
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
  fullImageOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  closeFullImageBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});
