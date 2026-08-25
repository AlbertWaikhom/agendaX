import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { ModalWrapper } from '../common/ModalWrapper';

interface QuickCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTask: () => void;
  onSelectEvent: () => void;
  onSelectUrl: () => void;
  onSelectExpense: () => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  visible,
  onClose,
  onSelectTask,
  onSelectEvent,
  onSelectUrl,
  onSelectExpense,
}) => {
  const { colors } = useTheme();

  const options = [
    {
      title: 'New Task',
      subtitle: 'Set to-dos, priorities, deadlines, and reminders',
      icon: 'checkmark-circle' as const,
      color: colors.primaryLight,
      onPress: () => {
        onClose();
        onSelectTask();
      },
    },
    {
      title: 'New Event',
      subtitle: 'Schedule meetings, deadlines, and milestones',
      icon: 'calendar' as const,
      color: colors.accentPurple,
      onPress: () => {
        onClose();
        onSelectEvent();
      },
    },
    {
      title: 'Log Expense',
      subtitle: 'Track spending, categories, and monthly budget',
      icon: 'wallet' as const,
      color: colors.accentEmerald,
      onPress: () => {
        onClose();
        onSelectExpense();
      },
    },
    {
      title: 'Important Link',
      subtitle: 'Save documentation, dashboards, repos, and URLs',
      icon: 'link' as const,
      color: colors.accentCyan,
      onPress: () => {
        onClose();
        onSelectUrl();
      },
    },
  ];

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Quick Action"
      subtitle="What would you like to add to your workspace?"
    >
      <View style={styles.list}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.title}
            activeOpacity={0.8}
            onPress={opt.onPress}
            style={[
              styles.itemCard,
              {
                backgroundColor: colors.glassCard,
                borderColor: `${opt.color}35`,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${opt.color}20`, borderColor: `${opt.color}40`, borderWidth: 1 },
              ]}
            >
              <Ionicons name={opt.icon} size={24} color={opt.color} />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>{opt.title}</Text>
              <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{opt.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingVertical: Spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    lineHeight: 16,
  },
});
