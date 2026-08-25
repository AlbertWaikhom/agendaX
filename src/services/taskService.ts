import { TaskItem, Priority, TaskCategory } from '../types';
import { generateUniqueId, getTodayDateString } from '../utils';

export type TaskFilter = 'all' | 'today' | 'pending' | 'completed';
export type TaskSort = 'dueDate' | 'priority' | 'createdAt';

const PriorityWeight: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const TaskService = {
  createTask(params: {
    title: string;
    description?: string;
    category?: TaskCategory;
    priority?: Priority;
    dueDate?: string;
    dueTime?: string;
    url?: string;
    reminderEnabled?: boolean;
    reminderTime?: string;
    notificationId?: string;
  }): TaskItem {
    const now = new Date().toISOString();
    return {
      id: generateUniqueId('task'),
      title: params.title.trim(),
      description: params.description?.trim() || '',
      category: params.category || 'Work',
      priority: params.priority || 'medium',
      dueDate: params.dueDate || getTodayDateString(),
      dueTime: params.dueTime || '',
      url: params.url?.trim() || '',
      reminderEnabled: !!params.reminderEnabled,
      reminderTime: params.reminderTime || 'none',
      notificationId: params.notificationId,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
  },

  filterTasks(tasks: TaskItem[], filter: TaskFilter, searchQuery: string = '', selectedCategory: string = 'All'): TaskItem[] {
    const today = getTodayDateString();
    let filtered = [...tasks];

    // Filter by tab
    if (filter === 'today') {
      filtered = filtered.filter(t => t.dueDate === today);
    } else if (filter === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return filtered;
  },

  sortTasks(tasks: TaskItem[], sortBy: TaskSort): TaskItem[] {
    const sorted = [...tasks];

    if (sortBy === 'dueDate') {
      sorted.sort((a, b) => {
        // Pending first, then date
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const dateA = `${a.dueDate} ${a.dueTime || '23:59'}`;
        const dateB = `${b.dueDate} ${b.dueTime || '23:59'}`;
        return dateA.localeCompare(dateB);
      });
    } else if (sortBy === 'priority') {
      sorted.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (PriorityWeight[b.priority] || 0) - (PriorityWeight[a.priority] || 0);
      });
    } else if (sortBy === 'createdAt') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return sorted;
  },

  getStats(tasks: TaskItem[]) {
    const today = getTodayDateString();
    const todayTasks = tasks.filter(t => t.dueDate === today);
    const todayCompleted = todayTasks.filter(t => t.completed).length;
    const totalCompleted = tasks.filter(t => t.completed).length;

    const progressPercentage = todayTasks.length > 0
      ? Math.round((todayCompleted / todayTasks.length) * 100)
      : (tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0);

    return {
      total: tasks.length,
      todayTotal: todayTasks.length,
      todayCompleted,
      totalCompleted,
      progressPercentage,
    };
  },
};
