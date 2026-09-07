import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { TaskCategories, ReminderOptions } from '../../constants/categories';
import { TaskItem, Priority, TaskCategory } from '../../types';
import { getTodayDateString, formatDatePretty, formatTimePretty } from '../../utils';
import { HapticService } from '../../utils/haptics';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ModalWrapper } from '../common/ModalWrapper';
import { DateTimePickerModal } from '../common/DateTimePickerModal';

import { MediaStorage } from '../../storage/mediaStorage';

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: Priority;
    dueDate: string;
    dueTime?: string;
    url?: string;
    reminderEnabled: boolean;
    reminderTime: string;
    mediaUri?: string;
  }) => void;
  initialTask?: TaskItem | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialTask,
}) => {
  const { colors, isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('12:00');
  const [url, setUrl] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('30_min_before');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  const [mediaUri, setMediaUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setDueDate(initialTask.dueDate || getTodayDateString());
      setDueTime(initialTask.dueTime || '12:00');
      setUrl(initialTask.url || '');
      setReminderEnabled(initialTask.reminderEnabled);
      setReminderTime(initialTask.reminderTime || '30_min_before');
      setMediaUri(initialTask.mediaUri);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Work');
      setPriority('medium');
      setDueDate(getTodayDateString());
      setDueTime('12:00');
      setUrl('');
      setReminderEnabled(false);
      setReminderTime('30_min_before');
      setShowCustomCategory(false);
      setMediaUri(undefined);
    }
    setError('');
  }, [initialTask, visible]);

  const handlePickMedia = async () => {
    try {
      const res = await MediaStorage.pickImage('task attachment');
      if (res.success && res.uri) {
        setMediaUri(res.uri);
      }
    } catch (e) {
      console.warn('Pick media error:', e);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      HapticService.error();
      setError('Please enter a task title');
      return;
    }

    const finalCategory = showCustomCategory && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : category;

    HapticService.success();
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category: finalCategory,
      priority,
      dueDate,
      dueTime: dueTime || undefined,
      url: url.trim() || undefined,
      reminderEnabled,
      reminderTime,
      mediaUri,
    });
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={initialTask ? 'Edit Task' : 'Create New Task'}
      subtitle="Organize your priorities and deadlines"
    >
      <Input
        label="Task Title *"
        placeholder="e.g., Complete HRMS testing"
        value={title}
        onChangeText={t => {
          setTitle(t);
          if (error) setError('');
        }}
        error={error}
        clearable
      />

      <Input
        label="Description (Optional)"
        placeholder="Add details, sub-tasks, or notes..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{ minHeight: 70, textAlignVertical: 'top' }}
      />

      {/* Priority Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {(['low', 'medium', 'high'] as Priority[]).map(p => {
            const active = priority === p;
            let activeBg = isDark ? 'rgba(234, 179, 8, 0.16)' : 'rgba(234, 179, 8, 0.12)';
            let activeBorder = '#EAB308';
            let label = 'Medium';

            if (p === 'high') {
              activeBg = isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.12)';
              activeBorder = '#EF4444';
              label = 'High';
            } else if (p === 'low') {
              activeBg = isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.12)';
              activeBorder = '#10B981';
              label = 'Low';
            }

            return (
              <TouchableOpacity
                key={p}
                onPress={() => {
                  HapticService.selection();
                  setPriority(p);
                }}
                style={[
                  styles.priorityBtn,
                  {
                    backgroundColor: active ? activeBg : colors.glassCard,
                    borderColor: active ? activeBorder : colors.glassBorder,
                    borderWidth: active ? 1.5 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityBtnText,
                    { color: active ? activeBorder : colors.textSecondary },
                    active && { fontWeight: '700' },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {TaskCategories.map(cat => {
            const active = !showCustomCategory && category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  HapticService.selection();
                  setShowCustomCategory(false);
                  setCategory(cat.id);
                }}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: active ? `${cat.color}25` : colors.glassCard,
                    borderColor: active ? cat.color : colors.glassBorder,
                    borderWidth: active ? 1.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.categoryChipText, { color: active ? cat.color : colors.textSecondary }, active && { fontWeight: '700' }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => {
              HapticService.selection();
              setShowCustomCategory(true);
            }}
            style={[
              styles.categoryChip,
              {
                backgroundColor: showCustomCategory ? `${colors.primary}25` : colors.glassCard,
                borderColor: showCustomCategory ? colors.primary : colors.glassBorder,
                borderWidth: showCustomCategory ? 1.5 : 1,
              },
            ]}
          >
            <Text style={[styles.categoryChipText, { color: showCustomCategory ? colors.primaryLight : colors.textSecondary }, showCustomCategory && { fontWeight: '700' }]}>
              + Custom
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {showCustomCategory && (
          <Input
            placeholder="Enter custom category name"
            value={customCategoryInput}
            onChangeText={setCustomCategoryInput}
            containerStyle={{ marginTop: 8 }}
          />
        )}
      </View>

      {/* Due Date & Time Picker Button */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Due Date & Time</Text>
        <TouchableOpacity
          style={[
            styles.dateTimeSelector,
            {
              backgroundColor: colors.glassCard,
              borderColor: colors.glassBorder,
              borderTopColor: colors.glassSpecular,
            },
          ]}
          onPress={() => {
            HapticService.light();
            setShowDatePicker(true);
          }}
        >
          <View style={styles.dateTimeLeft}>
            <Ionicons name="calendar-outline" size={20} color={colors.primaryLight} />
            <Text style={[styles.dateTimeText, { color: colors.text }]}>
              {formatDatePretty(dueDate)} at {formatTimePretty(dueTime)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* URL Attachment */}
      <Input
        label="Reference URL (Optional)"
        placeholder="https://..."
        value={url}
        onChangeText={setUrl}
        icon="link-outline"
        autoCapitalize="none"
        keyboardType="url"
      />

      {/* Reminder Toggle */}
      <View
        style={[
          styles.reminderCard,
          {
            backgroundColor: colors.glassCard,
            borderColor: colors.glassBorder,
            borderTopColor: colors.glassSpecular,
          },
        ]}
      >
        <View style={styles.reminderHeader}>
          <View style={styles.reminderTitleRow}>
            <Ionicons name="notifications-outline" size={20} color={colors.accentPink || '#EC4899'} />
            <Text style={[styles.reminderTitle, { color: colors.text }]}>Set Reminder</Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={v => {
              HapticService.selection();
              setReminderEnabled(v);
            }}
            trackColor={{ false: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {reminderEnabled && (
          <View style={[styles.reminderOptions, { borderColor: colors.glassBorder }]}>
            <Text style={[styles.reminderOptionLabel, { color: colors.textSecondary }]}>Remind me:</Text>
            <View style={styles.reminderChipsGrid}>
              {ReminderOptions.filter(o => o.value !== 'none').map(opt => {
                const active = reminderTime === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => {
                      HapticService.selection();
                      setReminderTime(opt.value);
                    }}
                    style={[
                      styles.reminderChip,
                      {
                        backgroundColor: active ? colors.primary : colors.glassCard,
                        borderColor: active ? colors.primaryLight : colors.glassBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reminderChipText,
                        { color: active ? '#FFFFFF' : colors.textSecondary },
                        active && { fontWeight: '700' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Optional Photo / Document Attachment */}
      <View style={{ marginBottom: Spacing.md }}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Attachment (Optional)</Text>
        {mediaUri ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.glassBorder }}>
            <Ionicons name="image" size={24} color={colors.primaryLight} />
            <Text style={{ flex: 1, marginLeft: 10, fontSize: 12, color: colors.text }} numberOfLines={1}>
              Photo Attached
            </Text>
            <TouchableOpacity onPress={() => setMediaUri(undefined)} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handlePickMedia}
            style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.glassBorder, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: colors.glassCard }}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={colors.primaryLight} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Upload Photo or Screenshot</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Button */}
      <Button
        title={initialTask ? 'Save Changes' : 'Add Task'}
        onPress={handleSubmit}
        style={{ marginTop: Spacing.sm }}
      />

      {/* Date Time Picker Modal */}
      <DateTimePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        initialDate={dueDate}
        initialTime={dueTime}
        onSelect={(date, time) => {
          setDueDate(date);
          if (time) setDueTime(time);
        }}
      />
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  priorityBtnText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  dateTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  dateTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: 10,
  },
  reminderCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: 8,
  },
  reminderOptions: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  reminderOptionLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginBottom: 6,
  },
  reminderChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reminderChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  reminderChipText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
  },
});
