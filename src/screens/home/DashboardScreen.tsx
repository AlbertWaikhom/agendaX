import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
import { ProgressRing } from '../../components/dashboard/ProgressRing';
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
    unreadNotificationsCount,
    toggleTask,
    addTask,
    addEvent,
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
      color: e.color,
      location: e.location,
    })),
  ].sort((a, b) => {
    const timeA = a.time || '23:59';
    const timeB = b.time || '23:59';
    return timeA.localeCompare(timeB);
  });

  return (
    <PageContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Header with Greeting & Avatar */}
        <View style={styles.topHeader}>
          <View style={styles.greetingContainer}>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText}>
                {getTimeGreeting(user?.name || '')}
              </Text>
              <Ionicons name="sparkles" size={18} color={colors.accentOrange} style={styles.greetingIcon} />
            </View>
            <View style={styles.workspaceIdBadge}>
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

            <TouchableOpacity
              onPress={() => navigation.navigate('More')}
              style={[styles.avatarCircle, { backgroundColor: user?.avatarColor || colors.primary }]}
            >
              <Text style={styles.avatarText}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Summary Cards Grid (2x2 Uniform Gap Fixed) */}
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
            count={events.filter(e => e.date >= todayStr).length}
            icon="calendar-outline"
            color={colors.accentPurple}
            onPress={() => navigation.navigate('Events')}
          />
          <SummaryCard
            title="Monthly Expenses"
            count={`₹${Math.round(monthlyExpenseTotal)}`}
            icon="wallet-outline"
            color={colors.accentEmerald}
            onPress={() => navigation.navigate('Expenses')}
          />
          <SummaryCard
            title="Active Reminders"
            count={activeRemindersCount}
            icon="notifications-outline"
            color={colors.accentPink}
            onPress={() => navigation.navigate('Tasks')}
          />
        </View>

        {/* Task Completion Progress Glass Card */}
        <ProgressRing
          completed={taskStats.totalCompleted}
          total={taskStats.total}
          percentage={taskStats.progressPercentage}
        />

        {/* Upcoming Event Section */}
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

        {/* Today's Schedule Section */}
        <SectionHeader
          title="Today's Schedule"
          badge={scheduleItems.length}
          actionText="Manage Tasks"
          onActionPress={() => navigation.navigate('Tasks')}
        />

        {scheduleItems.length === 0 ? (
          <View style={styles.emptySchedule}>
            <Ionicons name="sunny-outline" size={32} color={colors.accentOrange} style={styles.emptyScheduleIcon} />
            <Text style={styles.emptyScheduleText}>No items scheduled for today</Text>
            <Text style={styles.emptyScheduleSub}>You're all caught up! Enjoy your day.</Text>
          </View>
        ) : (
          scheduleItems.map(item => (
            <TodayScheduleItem
              key={`${item.type}-${item.id}`}
              item={item}
              onToggleComplete={() => toggleTask(item.id)}
              onPress={() => {
                if (item.type === 'event') {
                  const ev = events.find(e => e.id === item.id);
                  if (ev) {
                    setSelectedEvent(ev);
                    setShowEventDetails(true);
                  }
                } else {
                  navigation.navigate('Tasks');
                }
              }}
            />
          ))
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

      {/* Task Creation Modal */}
      <TaskFormModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={data => addTask(data)}
      />

      {/* Event Creation Modal */}
      <EventFormModal
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={data => addEvent(data)}
      />

      {/* URL Creation Modal */}
      <UrlFormModal
        visible={showUrlModal}
        onClose={() => setShowUrlModal(false)}
        onSave={data => addUrl(data)}
      />

      {/* Expense Creation Modal */}
      <ExpenseFormModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={data => addExpense(data)}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        visible={showEventDetails}
        event={selectedEvent}
        onClose={() => {
          setShowEventDetails(false);
          setSelectedEvent(null);
        }}
        onEdit={ev => {
          setSelectedEvent(ev);
          setShowEventModal(true);
        }}
        onDelete={id => deleteEvent(id)}
      />
    </PageContainer>
  );
};
