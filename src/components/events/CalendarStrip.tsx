import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface CalendarStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  eventDatesMap: Record<string, boolean>;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onSelectDate,
  eventDatesMap,
}) => {
  const { colors } = useTheme();
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const parts = selectedDate.split('-').map(Number);
    return parts[0] || new Date().getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const parts = selectedDate.split('-').map(Number);
    return parts[1] ? parts[1] - 1 : new Date().getMonth();
  });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysList = Array.from({ length: numDays }, (_, i) => {
    const day = i + 1;
    const dateObj = new Date(currentYear, currentMonth, day);
    const dayOfWeek = DAYS_OF_WEEK[dateObj.getDay()];
    const yStr = String(currentYear);
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;
    const hasEvents = !!eventDatesMap[dateStr];
    const isSelected = selectedDate === dateStr;

    return {
      day,
      dayOfWeek,
      dateStr,
      hasEvents,
      isSelected,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
      {/* Month Navigator */}
      <View style={styles.header}>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {MONTHS[currentMonth]} {currentYear}
        </Text>
        <View style={styles.navButtons}>
          <TouchableOpacity
            onPress={prevMonth}
            style={[styles.navBtn, { backgroundColor: colors.surfaceHighlight }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={nextMonth}
            style={[styles.navBtn, { backgroundColor: colors.surfaceHighlight }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {daysList.map(item => (
          <TouchableOpacity
            key={item.dateStr}
            onPress={() => onSelectDate(item.dateStr)}
            style={[
              styles.dayCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              item.isSelected && {
                backgroundColor: colors.primary,
                borderColor: colors.primaryLight,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayOfWeek,
                { color: colors.textMuted },
                item.isSelected && styles.dayOfWeekSelected,
              ]}
            >
              {item.dayOfWeek}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                { color: colors.text },
                item.isSelected && styles.dayNumberSelected,
              ]}
            >
              {item.day}
            </Text>
            {item.hasEvents && (
              <View style={[styles.eventDot, { backgroundColor: colors.primaryLight }, item.isSelected && styles.eventDotSelected]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  monthTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -0.3,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  dayCard: {
    width: 50,
    height: 72,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingVertical: 6,
  },
  dayOfWeek: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'uppercase',
  },
  dayOfWeekSelected: {
    color: '#FFF',
    fontWeight: Typography.fontWeight.bold,
  },
  dayNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginVertical: 2,
  },
  dayNumberSelected: {
    color: '#FFF',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  eventDotSelected: {
    backgroundColor: '#FFFFFF',
  },
});
