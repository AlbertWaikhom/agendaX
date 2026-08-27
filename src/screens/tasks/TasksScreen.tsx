import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskCategories } from '../../constants/categories';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TaskService, TaskFilter, TaskSort } from '../../services/taskService';
import { TaskItem } from '../../types';
import { PageContainer } from '../../../components/page/PageContainer';
import { Input } from '../../components/common/Input';
import { TaskCard } from '../../components/tasks/TaskCard';
import { PageLockGuard } from '../../components/security/PageLockGuard';
import { TaskFormModal } from '../../components/tasks/TaskFormModal';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { createTasksStyles } from './TasksScreen.styles';

export const TasksScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createTasksStyles(colors), [colors]);

  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useWorkspace();

  const [filter, setFilter] = useState<TaskFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<TaskSort>('dueDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const displayedTasks = useMemo(() => {
    const filtered = TaskService.filterTasks(tasks, filter, searchQuery, selectedCategory);
    return TaskService.sortTasks(filtered, sortBy);
  }, [tasks, filter, searchQuery, selectedCategory, sortBy]);

  const filterTabs: { id: TaskFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: tasks.length },
    { id: 'today', label: 'Today', count: tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length },
    { id: 'pending', label: 'Pending', count: tasks.filter(t => !t.completed).length },
    { id: 'completed', label: 'Completed', count: tasks.filter(t => t.completed).length },
  ];

  const handleEdit = (task: TaskItem) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSave = (data: any) => {
    if (editingTask) {
      updateTask({ ...editingTask, ...data });
    } else {
      addTask(data);
    }
  };

  return (
    <PageContainer>
      <PageLockGuard pageId="Tasks" pageTitle="Tasks & Schedule">
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Tasks</Text>
              <Text style={styles.headerSubtitle}>
                {tasks.filter(t => !t.completed).length} pending • {tasks.filter(t => t.completed).length} completed
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.filterChip, showSortMenu && styles.filterChipActive]}
              onPress={() => setShowSortMenu(!showSortMenu)}
            >
              <Ionicons name="swap-vertical" size={16} color={showSortMenu ? '#FFF' : colors.textSecondary} />
              <Text style={[styles.filterText, showSortMenu && styles.filterTextActive]}>Sort</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon="search-outline"
            clearable
            containerStyle={{ marginBottom: 12 }}
          />

          {/* Status Filter Horizontal Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {filterTabs.map(tab => {
              const active = filter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setFilter(tab.id)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{tab.label}</Text>
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{tab.count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Categories Horizontal Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory('All')}
              style={[styles.filterChip, selectedCategory === 'All' && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, selectedCategory === 'All' && styles.filterTextActive]}>All</Text>
            </TouchableOpacity>

            {TaskCategories.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Tasks List */}
          <FlatList
            data={displayedTasks}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onToggleComplete={() => toggleTask(item.id)}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteTask(item.id)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="checkbox-outline" size={48} color={colors.textMuted} style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No tasks found</Text>
                <Text style={styles.emptySub}>
                  {searchQuery ? 'Try clearing your search query' : 'Tap the + button to create a task.'}
                </Text>
              </View>
            }
          />
        </View>

        <FloatingActionButton
          onPress={() => {
            setEditingTask(null);
            setShowModal(true);
          }}
        />

        <TaskFormModal
          visible={showModal}
          initialTask={editingTask}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSave={handleSave}
        />
      </PageLockGuard>
    </PageContainer>
  );
};
