import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { PriorityBadge, CategoryPill } from '../common/Badge';
import { TaskItem } from '../../types';
import { formatDatePretty, formatTimePretty } from '../../utils';

interface TaskCardProps {
  task: TaskItem;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();

  const handleOpenUrl = () => {
    if (task.url) {
      Linking.openURL(task.url).catch(e => console.warn('Could not open URL:', e));
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.glassCard,
          borderColor: colors.glassBorder,
          borderTopColor: colors.glassSpecular,
        },
        task.completed && [styles.cardCompleted, { backgroundColor: colors.surfaceSubtle }],
      ]}
    >
      <View style={styles.topRow}>
        {/* Checkbox */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onToggleComplete}
          style={[
            styles.checkbox,
            { borderColor: colors.primaryLight },
            task.completed && [styles.checkboxCompleted, { backgroundColor: colors.success, borderColor: colors.success }],
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </TouchableOpacity>

        {/* Title & Description */}
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, { color: colors.text }, task.completed && [styles.titleCompleted, { color: colors.textMuted }]]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {task.description ? (
            <Text
              style={[styles.description, { color: colors.textSecondary }, task.completed && styles.descCompleted]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          ) : null}
        </View>

        {/* Actions Menu */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={onEdit}
            style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={[styles.actionBtn, { backgroundColor: colors.errorBg }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer Badges and Meta */}
      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <View style={styles.badgesGroup}>
          <CategoryPill label={task.category} style={styles.tag} />
          <PriorityBadge priority={task.priority} style={styles.tag} />
        </View>

        <View style={styles.metaGroup}>
          {task.reminderEnabled && (
            <View style={[styles.reminderIcon, { backgroundColor: `${colors.accentPink}20` }]}>
              <Ionicons name="notifications-outline" size={12} color={colors.accentPink} />
            </View>
          )}

          {task.url ? (
            <TouchableOpacity
              onPress={handleOpenUrl}
              style={[styles.urlBtn, { backgroundColor: `${colors.accentBlue}20` }]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="link-outline" size={13} color={colors.accentBlue} />
            </TouchableOpacity>
          ) : null}

          <View style={styles.dueContainer}>
            <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.dueText, { color: colors.textMuted }]}>
              {formatDatePretty(task.dueDate)}
              {task.dueTime ? ` ${formatTimePretty(task.dueTime)}` : ''}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    borderWidth: 1,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  cardCompleted: {
    opacity: 0.65,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: Spacing.md,
  },
  checkboxCompleted: {},
  textContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  descCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {},
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
});
