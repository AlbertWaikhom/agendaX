import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';
import { ModalWrapper } from './ModalWrapper';

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string, time?: string) => void;
  initialDate?: string;
  initialTime?: string;
  mode?: 'date' | 'time' | 'datetime';
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  initialDate,
  initialTime,
  mode = 'datetime',
}) => {
  const { colors } = useTheme();
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (initialDate) {
      const parts = initialDate.split('-').map(Number);
      return parts[0] || today.getFullYear();
    }
    return today.getFullYear();
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (initialDate) {
      const parts = initialDate.split('-').map(Number);
      return parts[1] || today.getMonth() + 1;
    }
    return today.getMonth() + 1;
  });

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (initialDate) {
      const parts = initialDate.split('-').map(Number);
      return parts[2] || today.getDate();
    }
    return today.getDate();
  });

  const [selectedHour, setSelectedHour] = useState<number>(() => {
    if (initialTime) {
      const parts = initialTime.split(':').map(Number);
      return parts[0] !== undefined ? parts[0] : 10;
    }
    return 10;
  });

  const [selectedMinute, setSelectedMinute] = useState<number>(() => {
    if (initialTime) {
      const parts = initialTime.split(':').map(Number);
      return parts[1] !== undefined ? parts[1] : 0;
    }
    return 0;
  });

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const handleSave = () => {
    const yStr = String(selectedYear);
    const mStr = String(selectedMonth).padStart(2, '0');
    const dStr = String(Math.min(selectedDay, daysInMonth)).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    const hStr = String(selectedHour).padStart(2, '0');
    const minStr = String(selectedMinute).padStart(2, '0');
    const timeStr = `${hStr}:${minStr}`;

    onSelect(dateStr, timeStr);
    onClose();
  };

  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth() + 1);
    setSelectedDay(d.getDate());
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} title="Select Date & Time">
      {/* Quick shortcuts */}
      <View style={styles.quickShortcuts}>
        <TouchableOpacity
          style={[styles.quickChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
          onPress={() => setQuickDate(0)}
        >
          <Text style={[styles.quickChipText, { color: colors.textSecondary }]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
          onPress={() => setQuickDate(1)}
        >
          <Text style={[styles.quickChipText, { color: colors.textSecondary }]}>Tomorrow</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
          onPress={() => setQuickDate(7)}
        >
          <Text style={[styles.quickChipText, { color: colors.textSecondary }]}>Next Week</Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {(mode === 'date' || mode === 'datetime') && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Date (Month / Day / Year)</Text>
          <View style={styles.pickerRow}>
            {/* Month */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {[
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
              ].map((name, index) => {
                const mNum = index + 1;
                const active = selectedMonth === mNum;
                return (
                  <TouchableOpacity
                    key={name}
                    onPress={() => setSelectedMonth(mNum)}
                    style={[
                      styles.numChip,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      active && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.numChipText,
                        { color: colors.textSecondary },
                        active && styles.numChipTextActive,
                      ]}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Days */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const active = selectedDay === day;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={[
                    styles.dayChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    active && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      { color: colors.text },
                      active && styles.dayChipTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Time Pickers */}
      {(mode === 'time' || mode === 'datetime') && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Time</Text>
          <View style={styles.timeRow}>
            {/* Hours */}
            <View style={styles.timeCol}>
              <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Hour</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Array.from({ length: 24 }, (_, i) => i).map(h => {
                  const active = selectedHour === h;
                  const displayH = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
                  return (
                    <TouchableOpacity
                      key={h}
                      onPress={() => setSelectedHour(h)}
                      style={[
                        styles.timeChip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        active && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          { color: colors.textSecondary },
                          active && styles.timeChipTextActive,
                        ]}
                      >
                        {displayH}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Minutes */}
          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
              <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Minute</Text>
              <View style={styles.minuteGrid}>
                {[0, 15, 30, 45].map(min => {
                  const active = selectedMinute === min;
                  return (
                    <TouchableOpacity
                      key={min}
                      onPress={() => setSelectedMinute(min)}
                      style={[
                        styles.minChip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        active && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.minChipText,
                          { color: colors.textSecondary },
                          active && styles.minChipTextActive,
                        ]}
                      >
                        :{String(min).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      )}

      <Button title="Set Date & Time" onPress={handleSave} style={{ marginTop: Spacing.lg }} />
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  quickShortcuts: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginRight: 8,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 8,
  },
  pickerRow: {
    marginBottom: 8,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  numChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: 6,
  },
  numChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  numChipTextActive: {
    color: '#FFF',
    fontWeight: Typography.fontWeight.bold,
  },
  daysScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  dayChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  dayChipTextActive: {
    color: '#FFF',
    fontWeight: Typography.fontWeight.bold,
  },
  timeRow: {
    marginTop: 6,
  },
  timeCol: {
    flex: 1,
  },
  timeLabel: {
    fontSize: Typography.fontSize.xs,
    marginBottom: 4,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: 6,
  },
  timeChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  timeChipTextActive: {
    color: '#FFF',
    fontWeight: Typography.fontWeight.bold,
  },
  minuteGrid: {
    flexDirection: 'row',
    marginTop: 4,
  },
  minChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 6,
  },
  minChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  minChipTextActive: {
    color: '#FFF',
  },
});
