import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { NoteService, NOTE_CATEGORIES } from '../../services/noteService';
import { NoteItem } from '../../types';
import { formatDatePretty } from '../../utils';
import { PageContainer } from '../../../components/page/PageContainer';
import { Input } from '../../components/common/Input';
import { PageLockGuard } from '../../components/security/PageLockGuard';
import { CustomAlertModal, AlertButton } from '../../components/common/CustomAlertModal';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { NoteFormModal } from '../../components/notepad/NoteFormModal';
import { NoteDetailsModal } from '../../components/notepad/NoteDetailsModal';
import { createNotepadStyles } from './NotepadScreen.styles';

export const NotepadScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createNotepadStyles(colors), [colors]);

  const { notes, addNote, updateNote, deleteNote, togglePinNote } = useWorkspace();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Custom Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    buttons?: AlertButton[];
  }>({
    visible: false,
    title: '',
  });

  const displayedNotes = useMemo(() => {
    return NoteService.filterNotes(notes, searchQuery, selectedCategory);
  }, [notes, searchQuery, selectedCategory]);

  const handleSelectNote = (note: NoteItem) => {
    setSelectedNote(note);
    setShowDetailsModal(true);
  };

  const handleEdit = (note: NoteItem) => {
    setShowDetailsModal(false);
    setSelectedNote(null);
    setEditingNote(note);
    setShowModal(true);
  };

  const confirmDeleteNote = (note: NoteItem) => {
    setAlertConfig({
      visible: true,
      title: 'Delete Note',
      message: `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
      icon: 'trash-outline',
      iconColor: colors.error,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          icon: 'trash-outline',
          onPress: () => {
            deleteNote(note.id);
            if (selectedNote?.id === note.id) {
              setShowDetailsModal(false);
              setSelectedNote(null);
            }
          },
        },
      ],
    });
  };

  const handleSaveNote = async (data: any) => {
    if (editingNote) {
      await updateNote({ ...editingNote, ...data });
    } else {
      await addNote(data);
    }
  };

  // Collect distinct categories present across notes
  const availableCategories = useMemo(() => {
    const defaultCats = NOTE_CATEGORIES.map(c => c.id);
    const customCats = new Set<string>();
    notes.forEach(n => {
      if (n.category && !defaultCats.includes(n.category)) {
        customCats.add(n.category);
      }
    });
    return [
      ...NOTE_CATEGORIES,
      ...Array.from(customCats).map(cat => ({ id: cat, label: cat, color: colors.primaryLight })),
    ];
  }, [notes, colors]);

  return (
    <PageContainer>
      <PageLockGuard pageId="Notepad" pageTitle="Notepad">
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Notepad</Text>
              <Text style={styles.headerSubtitle}>
                {notes.length} notes • {notes.filter(n => n.pinned).length} pinned
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <Input
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon="search-outline"
            clearable
            containerStyle={{ marginBottom: 12 }}
          />

          {/* Category Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {availableCategories.map(cat => {
              const active = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Notes List */}
          <FlatList
            data={displayedNotes}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleSelectNote(item)}
                style={[
                  styles.noteCard,
                  {
                    backgroundColor: colors.glassCard,
                    borderColor: item.pinned ? `${colors.primaryLight}40` : colors.glassBorder,
                    borderTopColor: colors.glassSpecular,
                  },
                ]}
              >
                {/* Left Colored Accent Bar */}
                <View style={[styles.noteAccentBar, { backgroundColor: item.color || colors.primary }]} />

                {/* Top Row: Category Pill & Pin Icon */}
                <View style={styles.cardTop}>
                  <View
                    style={[
                      styles.categoryPill,
                      { backgroundColor: `${item.color || colors.primary}20` },
                    ]}
                  >
                    <Text style={[styles.categoryText, { color: item.color || colors.primaryLight }]}>
                      {item.category}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => togglePinNote(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[
                      styles.pinBtn,
                      { backgroundColor: item.pinned ? `${colors.primary}25` : colors.surfaceHighlight },
                    ]}
                  >
                    <Ionicons
                      name={item.pinned ? 'pin' : 'pin-outline'}
                      size={14}
                      color={item.pinned ? colors.primaryLight : colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                {/* Note Title */}
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                {/* Note Preview Content */}
                <Text style={styles.noteContent} numberOfLines={3}>
                  {item.content}
                </Text>

                {/* Footer: Date & Actions */}
                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>
                    {formatDatePretty(item.updatedAt.split('T')[0])}
                  </Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => handleEdit(item)}
                      style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="create-outline" size={15} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => confirmDeleteNote(item)}
                      style={[styles.actionBtn, { backgroundColor: colors.errorBg }]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={colors.textMuted}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No notes found</Text>
                <Text style={styles.emptySub}>
                  {searchQuery
                    ? 'No notes match your search query.'
                    : 'Tap the + button below to write your first note.'}
                </Text>
              </View>
            }
          />
        </View>

        {/* Floating Action Button */}
        <FloatingActionButton
          onPress={() => {
            setEditingNote(null);
            setShowModal(true);
          }}
        />

        {/* Create / Edit Note Modal */}
        <NoteFormModal
          visible={showModal}
          initialNote={editingNote}
          onClose={() => {
            setShowModal(false);
            setEditingNote(null);
          }}
          onSave={handleSaveNote}
        />

        {/* Note Details View Modal */}
        <NoteDetailsModal
          visible={showDetailsModal}
          note={selectedNote}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedNote(null);
          }}
          onEdit={handleEdit}
          onDelete={id => {
            if (selectedNote) confirmDeleteNote(selectedNote);
          }}
          onTogglePin={togglePinNote}
        />

        {/* Custom Confirmation Alert Modal */}
        <CustomAlertModal
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          icon={alertConfig.icon}
          iconColor={alertConfig.iconColor}
          buttons={alertConfig.buttons}
          onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        />
      </PageLockGuard>
    </PageContainer>
  );
};
