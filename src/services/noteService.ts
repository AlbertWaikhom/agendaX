import { NoteItem } from '../types';
import { generateUniqueId } from '../utils';

export const NOTE_CATEGORIES = [
  { id: 'All', label: 'All' },
  { id: 'General', label: 'General', color: '#6366F1' },
  { id: 'Work', label: 'Work', color: '#3B82F6' },
  { id: 'Personal', label: 'Personal', color: '#EC4899' },
  { id: 'Ideas', label: 'Ideas', color: '#F59E0B' },
  { id: 'Checklist', label: 'Checklist', color: '#10B981' },
  { id: 'Code', label: 'Code & Tech', color: '#8B5CF6' },
  { id: 'Finance', label: 'Finance', color: '#14B8A6' },
];

export const NOTE_COLORS = [
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export const NoteService = {
  createNote(params: {
    title: string;
    content: string;
    category?: string;
    color?: string;
    pinned?: boolean;
  }): NoteItem {
    const now = new Date().toISOString();
    return {
      id: generateUniqueId('note'),
      title: params.title.trim(),
      content: params.content.trim(),
      category: params.category?.trim() || 'General',
      color: params.color || NOTE_COLORS[0],
      pinned: !!params.pinned,
      createdAt: now,
      updatedAt: now,
    };
  },

  filterNotes(notes: NoteItem[], searchQuery: string = '', selectedCategory: string = 'All'): NoteItem[] {
    let filtered = [...notes];

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(
        n => n.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }

    return this.sortNotes(filtered);
  },

  sortNotes(notes: NoteItem[]): NoteItem[] {
    return [...notes].sort((a, b) => {
      // Pinned notes come first
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      // Then sort by newest updated
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },

  getStats(notes: NoteItem[]) {
    const pinnedCount = notes.filter(n => n.pinned).length;
    return {
      total: notes.length,
      pinnedCount,
    };
  },
};
