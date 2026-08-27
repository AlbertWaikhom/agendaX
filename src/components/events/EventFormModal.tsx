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
import { EventColors, RepeatOptions, ReminderOptions } from '../../constants/categories';
import { EventItem, EventRepeat } from '../../types';
import { getTodayDateString, formatDatePretty, formatTimePretty } from '../../utils';
import { HapticService } from '../../utils/haptics';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ModalWrapper } from '../common/ModalWrapper';
import { DateTimePickerModal } from '../common/DateTimePickerModal';

interface EventFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string;
    date: string;
    startTime: string;
    endTime?: string;
    location?: string;
    url?: string;
    reminderEnabled: boolean;
    reminderTime: string;
    repeat: EventRepeat;
    color: string;
    imageUri?: string;
  }) => void;
  initialEvent?: EventItem | null;
  defaultDate?: string;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialEvent,
  defaultDate,
}) => {
  const { colors, isDark } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate || getTodayDateString());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('30_min_before');
  const [repeat, setRepeat] = useState<EventRepeat>('none');
  const [color, setColor] = useState('#6366F1');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end'>('start');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialEvent) {
      setName(initialEvent.name);
      setDescription(initialEvent.description || '');
      setDate(initialEvent.date || getTodayDateString());
      setStartTime(initialEvent.startTime || '10:00');
      setEndTime(initialEvent.endTime || '11:00');
      setLocation(initialEvent.location || '');
      setUrl(initialEvent.url || '');
      setReminderEnabled(initialEvent.reminderEnabled);
      setReminderTime(initialEvent.reminderTime || '30_min_before');
      setRepeat(initialEvent.repeat || 'none');
      setColor(initialEvent.color || '#6366F1');
      setImageUri(initialEvent.imageUri);
    } else {
      setName('');
      setDescription('');
      setDate(defaultDate || getTodayDateString());
      setStartTime('10:00');
      setEndTime('11:00');
      setLocation('');
      setUrl('');
      setReminderEnabled(false);
      setReminderTime('30_min_before');
      setRepeat('none');
      setColor('#6366F1');
      setImageUri(undefined);
    }
    setError('');
  }, [initialEvent, defaultDate, visible]);

  const handlePickImage = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Pick event image error:', e);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      HapticService.error();
      setError('Please enter an event name');
      return;
    }

    HapticService.success();
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      date,
      startTime,
      endTime: endTime.trim() || undefined,
      location: location.trim() || undefined,
      url: url.trim() || undefined,
      reminderEnabled,
      reminderTime,
      repeat,
      color,
      imageUri,
    });
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={initialEvent ? 'Edit Event' : 'New Event'}
      subtitle="Schedule meetings, appointments, and milestones"
    >
      <Input
        label="Event Name *"
        placeholder="e.g., Team Sync Meeting"
        value={name}
        onChangeText={t => {
          setName(t);
          if (error) setError('');
        }}
        error={error}
        clearable
      />

      <Input
        label="Description (Optional)"
        placeholder="Agenda, notes, or details..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{ minHeight: 70, textAlignVertical: 'top' }}
      />

      {/* Date & Time Selectors */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Date & Time</Text>
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
            <Text style={[styles.dateTimeText, { color: colors.text }]}>{formatDatePretty(date)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.timePickersRow}>
          <TouchableOpacity
            style={[
              styles.timeBox,
              {
                backgroundColor: colors.glassCard,
                borderColor: colors.glassBorder,
                borderTopColor: colors.glassSpecular,
              },
            ]}
            onPress={() => {
              HapticService.light();
              setTimePickerTarget('start');
              setShowTimePicker(true);
            }}
          >
            <Text style={[styles.timeBoxLabel, { color: colors.textMuted }]}>Start Time</Text>
            <Text style={[styles.timeBoxValue, { color: colors.primaryLight }]}>{formatTimePretty(startTime)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.timeBox,
              {
                backgroundColor: colors.glassCard,
                borderColor: colors.glassBorder,
                borderTopColor: colors.glassSpecular,
              },
            ]}
            onPress={() => {
              HapticService.light();
              setTimePickerTarget('end');
              setShowTimePicker(true);
            }}
          >
            <Text style={[styles.timeBoxLabel, { color: colors.textMuted }]}>End Time</Text>
            <Text style={[styles.timeBoxValue, { color: colors.primaryLight }]}>{formatTimePretty(endTime)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location */}
      <Input
        label="Location (Optional)"
        placeholder="e.g., Conference Room A or Zoom link"
        value={location}
        onChangeText={setLocation}
        icon="location-outline"
      />

      {/* URL */}
      <Input
        label="Link / Meeting URL (Optional)"
        placeholder="https://..."
        value={url}
        onChangeText={setUrl}
        icon="link-outline"
        autoCapitalize="none"
        keyboardType="url"
      />

      {/* Color Category */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Theme Color</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
          {EventColors.map(c => {
            const active = color === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => {
                  HapticService.selection();
                  setColor(c);
                }}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  active && styles.colorCircleActive,
                ]}
              >
                {active && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Repeat Setting */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Repeat</Text>
        <View style={styles.repeatRow}>
          {RepeatOptions.map(opt => {
            const active = repeat === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  HapticService.selection();
                  setRepeat(opt.value as EventRepeat);
                }}
                style={[
                  styles.repeatChip,
                  {
                    backgroundColor: active ? colors.primary : colors.glassCard,
                    borderColor: active ? colors.primaryLight : colors.glassBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.repeatChipText,
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

      {/* Optional Event Photo / Ticket Attachment */}
      <View style={{ marginBottom: Spacing.md }}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Event Photo / Pass (Optional)</Text>
        {imageUri ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.glassBorder }}>
            <Ionicons name="image" size={24} color={colors.primaryLight} />
            <Text style={{ flex: 1, marginLeft: 10, fontSize: 12, color: colors.text }} numberOfLines={1}>
              Photo Attached
            </Text>
            <TouchableOpacity onPress={() => setImageUri(undefined)} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handlePickImage}
            style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.glassBorder, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: colors.glassCard }}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={colors.primaryLight} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Upload Ticket or Venue Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Button */}
      <Button
        title={initialEvent ? 'Update Event' : 'Create Event'}
        onPress={handleSubmit}
        style={{ marginTop: Spacing.sm }}
      />

      {/* Date Picker Modal */}
      <DateTimePickerModal
        visible={showDatePicker}
        mode="date"
        onClose={() => setShowDatePicker(false)}
        initialDate={date}
        onSelect={d => setDate(d)}
      />

      {/* Time Picker Modal */}
      <DateTimePickerModal
        visible={showTimePicker}
        mode="time"
        onClose={() => setShowTimePicker(false)}
        initialTime={timePickerTarget === 'start' ? startTime : endTime}
        onSelect={(_, t) => {
          if (t) {
            if (timePickerTarget === 'start') setStartTime(t);
            else setEndTime(t);
          }
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
  dateTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: 8,
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
  timePickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginHorizontal: 3,
  },
  timeBoxLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginBottom: 2,
  },
  timeBoxValue: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  colorRow: {
    flexDirection: 'row',
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  colorCircleActive: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  repeatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  repeatChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  repeatChipText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
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
