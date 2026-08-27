import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TaskService } from '../../services/taskService';
import { EventService } from '../../services/eventService';
import { ExpenseService } from '../../services/expenseService';
import { getTimeGreeting, getTodayDateString, formatDatePretty, formatTimePretty } from '../../utils';
import { PageContainer } from '../../../components/page/PageContainer';
import { SectionHeader } from '../../../components/page/SectionHeader';
import { BentoStatCard } from '../../components/dashboard/BentoStatCard';
import { TodayScheduleItem, ScheduleItemData } from '../../components/dashboard/TodayScheduleItem';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { QuickCreateModal } from '../../components/quickAction/QuickCreateModal';
import { TaskFormModal } from '../../components/tasks/TaskFormModal';
import { EventFormModal } from '../../components/events/EventFormModal';
import { UrlFormModal } from '../../components/urls/UrlFormModal';
import { ExpenseFormModal } from '../../components/expenses/ExpenseFormModal';
import { EventDetailsModal } from '../../components/events/EventDetailsModal';
import { TaskDetailsModal } from '../../components/tasks/TaskDetailsModal';
import { EventItem, TaskItem } from '../../types';
import { createDashboardStyles } from './DashboardScreen.styles';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useMemo(() => createDashboardStyles(colors), [colors]);

  const {
    user,
    tasks,
    events,
    expenses,
    settings,
    unreadNotificationsCount,
    toggleTask,
    addTask,
    addEvent,
    updateEvent,
    addUrl,
    addExpense,
    deleteEvent,
    deleteTask,
  } = useWorkspace();

  // Modals state
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  // Stagger Animation Values
  const fadeHeader = useRef(new Animated.Value(0)).current;
  const slideHeader = useRef(new Animated.Value(-16)).current;

  const fadeBento = useRef(new Animated.Value(0)).current;
  const slideBento = useRef(new Animated.Value(20)).current;

  const fadeProgress = useRef(new Animated.Value(0)).current;
  const slideProgress = useRef(new Animated.Value(20)).current;

  const fadeSpotlight = useRef(new Animated.Value(0)).current;
  const slideSpotlight = useRef(new Animated.Value(20)).current;

  const fadeQuickActions = useRef(new Animated.Value(0)).current;
  const slideQuickActions = useRef(new Animated.Value(20)).current;

  const fadeTimeline = useRef(new Animated.Value(0)).current;
  const slideTimeline = useRef(new Animated.Value(20)).current;

  // Animated Progress Bar Width (0 to 100%)
  const progressAnim = useRef(new Animated.Value(0)).current;

  const todayStr = getTodayDateString();
  const currentMonthKey = todayStr.substring(0, 7);

  // Calculations
  const taskStats = TaskService.getStats(tasks);
  const nextUpcomingEvent = EventService.getNextUpcomingEvent(events);

  const todayEvents = events.filter(e => e.date === todayStr);
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);

  const monthlyExpenseTotal = useMemo(
    () => ExpenseService.getMonthlyTotal(expenses, currentMonthKey),
    [expenses, currentMonthKey]
  );

  const activeRemindersCount =
    tasks.filter(t => t.reminderEnabled && !t.completed).length +
    events.filter(e => e.reminderEnabled && e.date >= todayStr).length;

  const todayCompletedCount = todayTasks.filter(t => t.completed).length;
  const todayTotalCount = todayTasks.length;

  const completionRate = todayTotalCount > 0
    ? Math.round((todayCompletedCount / todayTotalCount) * 100)
    : taskStats.total > 0
    ? Math.round((taskStats.totalCompleted / taskStats.total) * 100)
    : 0;

  // Next up item: next event or urgent pending task
  const nextUrgentTask = todayTasks.find(t => !t.completed && t.priority === 'high');
  const spotlightItem = nextUpcomingEvent || nextUrgentTask;

  // Motivational badge text
  const motivationalBadge = useMemo(() => {
    if (completionRate >= 100 && todayTotalCount > 0) return '🎉 ALL DONE!';
    if (completionRate >= 75) return '🔥 CRUSHING IT';
    if (completionRate >= 50) return '⚡ ON TRACK';
    if (completionRate > 0) return '🚀 IN PROGRESS';
    return '🌱 READY TO START';
  }, [completionRate, todayTotalCount]);

  // Today formatted pretty date string
  const formattedTodayDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, []);

  // Build today's timeline schedule items
  const scheduleItems: ScheduleItemData[] = useMemo(() => [
    ...todayTasks.map(t => ({
      id: t.id,
      type: 'task' as const,
      title: t.title,
      time: t.dueTime,
      category: t.category,
      priority: t.priority,
      completed: t.completed,
    })),
    ...todayEvents.map(e => ({
      id: e.id,
      type: 'event' as const,
      title: e.name,
      time: e.startTime,
      endTime: e.endTime,
      category: (e as any).category || 'General',
      location: e.location,
    })),
  ].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')), [todayTasks, todayEvents]);

  // Trigger Stagger Entrance Animation
  useEffect(() => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeHeader, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slideHeader, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]),
      Animated.parallel([
        Animated.timing(fadeBento, { toValue: 1, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slideBento, { toValue: 0, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]),
      Animated.parallel([
        Animated.timing(fadeProgress, { toValue: 1, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slideProgress, { toValue: 0, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]),
      Animated.parallel([
        Animated.timing(fadeSpotlight, { toValue: 1, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slideSpotlight, { toValue: 0, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]),
      Animated.parallel([
        Animated.timing(fadeQuickActions, { toValue: 1, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slideQuickActions, { toValue: 0, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]),
      Animated.parallel([
        Animated.timing(fadeTimeline, { toValue: 1, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slideTimeline, { toValue: 0, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]),
    ]).start();
  }, []);

  // Animate progress bar fill smoothly
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: completionRate,
      duration: 700,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [completionRate]);

  const handleScheduleItemPress = (item: ScheduleItemData) => {
    Haptics.selectionAsync().catch(() => {});
    if (item.type === 'event') {
      const found = events.find(e => e.id === item.id);
      if (found) {
        setSelectedEvent(found);
        setShowEventDetails(true);
      }
    } else {
      const found = tasks.find(t => t.id === item.id);
      if (found) {
        setSelectedTask(found);
        setShowTaskDetails(true);
      }
    }
  };

  const handleSpotlightPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (nextUpcomingEvent) {
      setSelectedEvent(nextUpcomingEvent);
      setShowEventDetails(true);
    } else if (nextUrgentTask) {
      setSelectedTask(nextUrgentTask);
      setShowTaskDetails(true);
    }
  };

  return (
    <PageContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Hero Header with Stagger Animation */}
        <Animated.View
          style={[
            styles.topHeader,
            {
              opacity: fadeHeader,
              transform: [{ translateY: slideHeader }],
            },
          ]}
        >
          <View style={styles.greetingContainer}>
            <Text style={styles.dateBadge}>{formattedTodayDate}</Text>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText} numberOfLines={1}>
                {getTimeGreeting(user?.name || 'Albert')}
              </Text>
            </View>

            <View style={styles.workspaceIdBadge}>
              <Ionicons name="finger-print-outline" size={12} color={colors.primaryLight} />
              <Text style={styles.workspaceIdText}>
                {user?.id ? `AGX-${user.id.slice(0, 8).toUpperCase()}` : 'OFFLINE VAULT'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* Notifications Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                navigation.navigate('Notifications');
              }}
              style={styles.glassIconBtn}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              {unreadNotificationsCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile Avatar Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                navigation.navigate('More');
              }}
              style={[styles.avatarCircle, { backgroundColor: colors.primary }]}
              accessibilityLabel="Account Profile"
            >
              {user?.avatarUri ? (
                <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* 2. Bento Stat Grid with Stagger & Spring */}
        <Animated.View
          style={[
            styles.summaryGrid,
            {
              opacity: fadeBento,
              transform: [{ translateY: slideBento }],
            },
          ]}
        >
          {/* Bento Card 1: Tasks */}
          <BentoStatCard
            title="Today's Tasks"
            value={todayTasks.length}
            subtitle={`${todayCompletedCount} completed`}
            icon="checkbox-outline"
            accentColor={colors.primary}
            badgeText={todayTasks.length > 0 ? `${todayCompletedCount}/${todayTasks.length}` : undefined}
            onPress={() => navigation.navigate('Tasks')}
            style={styles.bentoItem}
          />

          {/* Bento Card 2: Events */}
          <BentoStatCard
            title="Upcoming Events"
            value={events.length}
            subtitle={todayEvents.length > 0 ? `${todayEvents.length} today` : 'Upcoming'}
            icon="calendar-outline"
            accentColor={colors.accentPurple || '#A855F7'}
            badgeText={todayEvents.length > 0 ? 'Today' : undefined}
            onPress={() => navigation.navigate('Events')}
            style={styles.bentoItem}
          />

          {/* Bento Card 3: Expenses */}
          <BentoStatCard
            title="Monthly Spend"
            value={`${settings.currencySymbol || '₹'}${monthlyExpenseTotal.toFixed(0)}`}
            subtitle={expenses.length > 0 ? `${expenses.length} logs` : 'Budget'}
            icon="wallet-outline"
            accentColor={colors.accentEmerald || '#10B981'}
            onPress={() => navigation.navigate('Expenses')}
            style={styles.bentoItem}
          />

          {/* Bento Card 4: Active Alarms & Reminders */}
          <BentoStatCard
            title="Active Alarms"
            value={activeRemindersCount}
            subtitle="Scheduled alerts"
            icon="alarm-outline"
            accentColor={colors.accentPink || '#EC4899'}
            badgeText={activeRemindersCount > 0 ? 'ACTIVE' : undefined}
            badgeColor={colors.accentPink || '#EC4899'}
            onPress={() => navigation.navigate('Tasks')}
            style={styles.bentoItem}
          />
        </Animated.View>

        {/* 3. Daily Focus & Animated Progress Bar */}
        <Animated.View
          style={[
            styles.progressCard,
            {
              opacity: fadeProgress,
              transform: [{ translateY: slideProgress }],
            },
          ]}
        >
          <View style={styles.progressHeaderRow}>
            <View style={styles.progressTitleGroup}>
              <Ionicons name="sparkles" size={15} color={colors.primaryLight} />
              <Text style={styles.progressTitle}>Daily Focus & Productivity</Text>
            </View>

            <View style={styles.progressPercentageTag}>
              <Text style={styles.progressPercentageText}>{completionRate}%</Text>
            </View>
          </View>

          <View style={styles.progressSubtextRow}>
            <Text style={styles.progressSubtext}>
              {todayTotalCount > 0
                ? `${todayCompletedCount} of ${todayTotalCount} tasks completed today`
                : `${taskStats.totalCompleted} of ${taskStats.total} total tasks completed`}
            </Text>
            <Text style={styles.statusBadge}>{motivationalBadge}</Text>
          </View>

          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: completionRate >= 100 ? colors.success : colors.primary,
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* 4. Spotlight Next-Up Focus Card */}
        {spotlightItem ? (
          <Animated.View
            style={[
              {
                opacity: fadeSpotlight,
                transform: [{ translateY: slideSpotlight }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSpotlightPress}
              style={[
                styles.spotlightCard,
                {
                  backgroundColor: colors.glassCard,
                  borderColor: nextUpcomingEvent ? `${colors.accentPurple || '#A855F7'}40` : `${colors.primary}40`,
                  borderTopColor: colors.glassSpecular,
                },
              ]}
            >
              <View style={styles.spotlightHeader}>
                <View
                  style={[
                    styles.spotlightTag,
                    {
                      backgroundColor: nextUpcomingEvent
                        ? `${colors.accentPurple || '#A855F7'}20`
                        : `${colors.primary}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={nextUpcomingEvent ? 'calendar' : 'alert-circle'}
                    size={12}
                    color={nextUpcomingEvent ? (colors.accentPurple || '#A855F7') : colors.primaryLight}
                  />
                  <Text
                    style={[
                      styles.spotlightTagText,
                      { color: nextUpcomingEvent ? (colors.accentPurple || '#A855F7') : colors.primaryLight },
                    ]}
                  >
                    {nextUpcomingEvent ? 'Next Upcoming Event' : 'High Priority Task'}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>

              <Text style={styles.spotlightTitle} numberOfLines={1}>
                {'name' in spotlightItem ? spotlightItem.name : spotlightItem.title}
              </Text>

              {'description' in spotlightItem && spotlightItem.description ? (
                <Text style={styles.spotlightSub} numberOfLines={1}>
                  {spotlightItem.description}
                </Text>
              ) : null}

              <View style={styles.spotlightMetaRow}>
                <View style={styles.spotlightMetaItem}>
                  <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.spotlightMetaText}>
                    {'startTime' in spotlightItem
                      ? `${formatDatePretty(spotlightItem.date)} • ${formatTimePretty(spotlightItem.startTime)}`
                      : `${formatDatePretty(spotlightItem.dueDate)}${spotlightItem.dueTime ? ` • ${formatTimePretty(spotlightItem.dueTime)}` : ''}`}
                  </Text>
                </View>

                {'location' in spotlightItem && spotlightItem.location ? (
                  <View style={styles.spotlightMetaItem}>
                    <Ionicons name="location-outline" size={13} color={colors.accentPink} />
                    <Text style={styles.spotlightMetaText} numberOfLines={1}>
                      {spotlightItem.location}
                    </Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        {/* 5. Floating Quick Action Capsule Bar */}
        <Animated.View
          style={[
            styles.quickActionsSection,
            {
              opacity: fadeQuickActions,
              transform: [{ translateY: slideQuickActions }],
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            {/* Quick Button: Task */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setShowTaskModal(true);
              }}
              style={styles.quickActionChip}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: `${colors.primary}25` }]}>
                <Ionicons name="add" size={16} color={colors.primaryLight} />
              </View>
              <Text style={styles.quickActionText}>New Task</Text>
            </TouchableOpacity>

            {/* Quick Button: Expense */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setShowExpenseModal(true);
              }}
              style={styles.quickActionChip}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: `${colors.accentEmerald || '#10B981'}25` }]}>
                <Ionicons name="card-outline" size={14} color={colors.accentEmerald || '#10B981'} />
              </View>
              <Text style={styles.quickActionText}>Add Expense</Text>
            </TouchableOpacity>

            {/* Quick Button: Event */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setShowEventModal(true);
              }}
              style={styles.quickActionChip}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: `${colors.accentPurple || '#A855F7'}25` }]}>
                <Ionicons name="calendar-outline" size={14} color={colors.accentPurple || '#A855F7'} />
              </View>
              <Text style={styles.quickActionText}>New Event</Text>
            </TouchableOpacity>

            {/* Quick Button: URL */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setShowUrlModal(true);
              }}
              style={styles.quickActionChip}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: `${colors.accentCyan || '#06B6D4'}25` }]}>
                <Ionicons name="link-outline" size={14} color={colors.accentCyan || '#06B6D4'} />
              </View>
              <Text style={styles.quickActionText}>Save Link</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* 6. Today's Agenda Timeline */}
        <Animated.View
          style={[
            {
              opacity: fadeTimeline,
              transform: [{ translateY: slideTimeline }],
            },
          ]}
        >
          <SectionHeader
            title="Today's Schedule"
            badge={scheduleItems.length > 0 ? scheduleItems.length : undefined}
            actionText="Manage Tasks"
            onActionPress={() => navigation.navigate('Tasks')}
          />

          {scheduleItems.length > 0 ? (
            scheduleItems.map(item => (
              <TodayScheduleItem
                key={`${item.type}-${item.id}`}
                item={item}
                onPress={() => handleScheduleItemPress(item)}
                onToggleComplete={item.type === 'task' ? () => toggleTask(item.id) : undefined}
              />
            ))
          ) : (
            <View style={styles.emptySchedule}>
              <Ionicons
                name="calendar-clear-outline"
                size={40}
                color={colors.textMuted}
                style={styles.emptyScheduleIcon}
              />
              <Text style={styles.emptyScheduleText}>No items scheduled for today</Text>
              <Text style={styles.emptyScheduleSub}>
                Your schedule is clean. Tap below to create your first item!
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowTaskModal(true)}
                style={styles.emptyScheduleBtn}
              >
                <Ionicons name="add-circle-outline" size={16} color={colors.primaryLight} />
                <Text style={styles.emptyScheduleBtnText}>Create a Task</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => setShowQuickModal(true)} />

      {/* Quick Action Matrix Modal */}
      <QuickCreateModal
        visible={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        onSelectTask={() => setShowTaskModal(true)}
        onSelectEvent={() => setShowEventModal(true)}
        onSelectExpense={() => setShowExpenseModal(true)}
        onSelectUrl={() => setShowUrlModal(true)}
      />

      {/* Creation Modals */}
      <TaskFormModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={addTask}
      />
      <EventFormModal
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={addEvent}
      />
      <ExpenseFormModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={addExpense}
      />
      <UrlFormModal
        visible={showUrlModal}
        onClose={() => setShowUrlModal(false)}
        onSave={addUrl}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        visible={showEventDetails}
        event={selectedEvent}
        onClose={() => {
          setShowEventDetails(false);
          setSelectedEvent(null);
        }}
        onEdit={event => {
          updateEvent(event);
        }}
        onDelete={id => {
          deleteEvent(id);
        }}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        visible={showTaskDetails}
        task={selectedTask}
        onClose={() => {
          setShowTaskDetails(false);
          setSelectedTask(null);
        }}
        onEdit={() => {}}
        onDelete={id => {
          deleteTask(id);
        }}
        onToggleComplete={id => {
          toggleTask(id);
          if (selectedTask && selectedTask.id === id) {
            setSelectedTask({ ...selectedTask, completed: !selectedTask.completed });
          }
        }}
      />
    </PageContainer>
  );
};
