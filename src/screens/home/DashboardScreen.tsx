import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TaskService } from '../../services/taskService';
import { EventService } from '../../services/eventService';
import { ExpenseService } from '../../services/expenseService';
import { getTimeGreeting, getTodayDateString } from '../../utils';
import { PageContainer } from '../../../components/page/PageContainer';
import { SectionHeader } from '../../../components/page/SectionHeader';
import { SummaryCard } from '../../components/dashboard/SummaryCard';
import { TodayScheduleItem, ScheduleItemData } from '../../components/dashboard/TodayScheduleItem';
import { UpcomingEventCard } from '../../components/dashboard/UpcomingEventCard';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { QuickCreateModal } from '../../components/quickAction/QuickCreateModal';
import { TaskFormModal } from '../../components/tasks/TaskFormModal';
import { EventFormModal } from '../../components/events/EventFormModal';
import { UrlFormModal } from '../../components/urls/UrlFormModal';
import { ExpenseFormModal } from '../../components/expenses/ExpenseFormModal';
import { EventDetailsModal } from '../../components/events/EventDetailsModal';
import { EventItem } from '../../types';
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
  } = useWorkspace();

  // Modals state
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

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

  const completionRate = taskStats.total > 0
    ? Math.round((taskStats.totalCompleted / taskStats.total) * 100)
    : 0;

  // Build today's timeline schedule items
  const scheduleItems: ScheduleItemData[] = [
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
      location: e.location,
      color: e.color,
    })),
  ].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  const handleScheduleItemPress = (item: ScheduleItemData) => {
    if (item.type === 'task') {
      navigation.navigate('Tasks');
    } else {
      const foundEvent = events.find(e => e.id === item.id);
      if (foundEvent) {
        setSelectedEvent(foundEvent);
        setShowEventDetails(true);
      }
    }
  };

  const currencySymbol = settings.currencySymbol || '₹';

  return (
    <PageContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header with Greeting, Workspace ID, and Profile Avatar */}
        <View style={styles.topHeader}>
          <View style={styles.greetingContainer}>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText}>
                {getTimeGreeting(user?.name || 'Albert')}
              </Text>
            </View>
            <View style={styles.workspaceIdBadge}>
              <Ionicons name="finger-print" size={13} color={colors.primaryLight} />
              <Text style={styles.workspaceIdText}>
                Workspace: {user?.id || 'AGX-LOCAL'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.glassIconBtn}
              onPress={() => navigation.navigate('Notifications')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
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

            {/* Profile Avatar with uploaded photo or initials fallback */}
            <TouchableOpacity
              onPress={() => navigation.navigate('More')}
              style={[
                styles.avatarCircle,
                { backgroundColor: user?.avatarColor || colors.primary },
              ]}
              activeOpacity={0.8}
            >
              {user?.avatarUri ? (
                <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 2x2 Summary Metrics Grid */}
        <View style={styles.summaryGrid}>
          <SummaryCard
            title="Today's Tasks"
            count={taskStats.todayTotal}
            icon="checkbox-outline"
            color={colors.primaryLight}
            onPress={() => navigation.navigate('Tasks')}
          />
          <SummaryCard
            title="Upcoming Events"
            count={events.length}
            icon="calendar-outline"
            color={colors.accentPurple}
            onPress={() => navigation.navigate('Events')}
          />
          <SummaryCard
            title="Monthly Expenses"
            count={`${currencySymbol}${monthlyExpenseTotal.toFixed(0)}`}
            icon="wallet-outline"
            color={colors.accentEmerald}
            onPress={() => navigation.navigate('Expenses')}
          />
          <SummaryCard
            title="Active Reminders"
            count={activeRemindersCount}
            icon="alarm-outline"
            color={colors.accentPink}
            onPress={() => navigation.navigate('More')}
          />
        </View>

        {/* Quick Action Shortcuts Bar */}
        <View style={styles.quickActionsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            <TouchableOpacity
              style={styles.quickActionChip}
              onPress={() => setShowTaskModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: `${colors.primary}25` }]}>
                <Ionicons name="add" size={16} color={colors.primaryLight} />
              </View>
              <Text style={styles.quickActionText}>New Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionChip}
              onPress={() => setShowExpenseModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: `${colors.accentEmerald}25` }]}>
                <Ionicons name="cash-outline" size={14} color={colors.accentEmerald} />
              </View>
              <Text style={styles.quickActionText}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionChip}
              onPress={() => setShowEventModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: `${colors.accentPurple}25` }]}>
                <Ionicons name="calendar-outline" size={14} color={colors.accentPurple} />
              </View>
              <Text style={styles.quickActionText}>New Event</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionChip}
              onPress={() => setShowUrlModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: `${colors.accentCyan}25` }]}>
                <Ionicons name="bookmark-outline" size={14} color={colors.accentCyan} />
              </View>
              <Text style={styles.quickActionText}>Save Link</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Daily Task Completion Progress Widget */}
        <View style={styles.glassCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>Task Completion</Text>
            <View style={styles.progressPercentageTag}>
              <Text style={styles.progressPercentageText}>{completionRate}%</Text>
            </View>
          </View>
          <Text style={styles.progressSubtext}>
            {taskStats.todayCompleted} of {taskStats.todayTotal} tasks completed today
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, completionRate))}%` }]} />
          </View>
        </View>

        {/* Upcoming Event Spotlight */}
        <SectionHeader
          title="Upcoming Event"
          actionText="View All"
          onActionPress={() => navigation.navigate('Events')}
        />
        <UpcomingEventCard
          event={nextUpcomingEvent}
          onPress={() => {
            if (nextUpcomingEvent) {
              setSelectedEvent(nextUpcomingEvent);
              setShowEventDetails(true);
            }
          }}
          onAddEventPress={() => setShowEventModal(true)}
        />

        {/* Today's Schedule Timeline */}
        <SectionHeader
          title="Today's Schedule"
          badge={scheduleItems.length}
          actionText="Manage Tasks"
          onActionPress={() => navigation.navigate('Tasks')}
        />

        {scheduleItems.length === 0 ? (
          <View style={styles.emptySchedule}>
            <View style={styles.emptyScheduleIcon}>
              <Ionicons name="sunny-outline" size={36} color={colors.primaryLight} />
            </View>
            <Text style={styles.emptyScheduleText}>No items scheduled for today</Text>
            <Text style={styles.emptyScheduleSub}>You're all caught up! Enjoy your day or plan ahead.</Text>
            <TouchableOpacity
              style={styles.emptyScheduleBtn}
              onPress={() => setShowTaskModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={16} color={colors.primaryLight} />
              <Text style={styles.emptyScheduleBtnText}>Schedule a Task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {scheduleItems.map(item => (
              <TodayScheduleItem
                key={`${item.type}-${item.id}`}
                item={item}
                onToggleComplete={() => {
                  if (item.type === 'task') {
                    toggleTask(item.id);
                  }
                }}
                onPress={() => handleScheduleItemPress(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => setShowQuickModal(true)} />

      {/* Quick Action Selector Modal */}
      <QuickCreateModal
        visible={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        onSelectTask={() => setShowTaskModal(true)}
        onSelectEvent={() => setShowEventModal(true)}
        onSelectUrl={() => setShowUrlModal(true)}
        onSelectExpense={() => setShowExpenseModal(true)}
      />

      {/* Individual Form Modals */}
      <TaskFormModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={async taskData => {
          await addTask(taskData);
        }}
      />

      <EventFormModal
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={async eventData => {
          await addEvent(eventData);
        }}
      />

      <UrlFormModal
        visible={showUrlModal}
        onClose={() => setShowUrlModal(false)}
        onSave={async urlData => {
          await addUrl(urlData);
        }}
      />

      <ExpenseFormModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={async expenseData => {
          await addExpense(expenseData);
        }}
      />

      {/* Event Details Inspector Modal */}
      <EventDetailsModal
        visible={showEventDetails}
        event={selectedEvent}
        onClose={() => {
          setShowEventDetails(false);
          setSelectedEvent(null);
        }}
        onEdit={event => {
          setSelectedEvent(event);
          setShowEventDetails(false);
          setShowEventModal(true);
        }}
        onDelete={async id => {
          await deleteEvent(id);
          setShowEventDetails(false);
          setSelectedEvent(null);
        }}
      />
    </PageContainer>
  );
};
