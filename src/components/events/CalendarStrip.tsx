import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';

interface CalendarStripProps {
  selectedDate: string; // YYYY-MM-DD
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

  // Generate days in month
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
    <View style={styles.container}>
      {/* Month Navigator */}
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {MONTHS[currentMonth]} {currentYear}
        </Text>
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
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
            style={[styles.dayCard, item.isSelected && styles.dayCardSelected]}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayOfWeek, item.isSelected && styles.dayOfWeekSelected]}>
              {item.dayOfWeek}
            </Text>
            <Text style={[styles.dayNumber, item.isSelected && styles.dayNumberSelected]}>
              {item.day}
            </Text>
            {item.hasEvents && (
              <View style={[styles.eventDot, item.isSelected && styles.eventDotSelected]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
    color: Colors.text,
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
    backgroundColor: Colors.surfaceHighlight,
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
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingVertical: 6,
  },
  dayCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  dayOfWeek: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
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
    color: Colors.text,
    marginVertical: 2,
  },
  dayNumberSelected: {
    color: '#FFF',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primaryLight,
    marginTop: 2,
  },
  eventDotSelected: {
    backgroundColor: '#FFFFFF',
  },
});
