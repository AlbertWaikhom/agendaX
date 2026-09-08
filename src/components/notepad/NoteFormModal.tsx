import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { NoteItem } from '../../types';
import { NOTE_CATEGORIES, NOTE_COLORS } from '../../services/noteService';
import { HapticService } from '../../utils/haptics';
import { ModalWrapper } from '../common/ModalWrapper';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface NoteFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    content: string;
    category?: string;
    color?: string;
    pinned?: boolean;
  }) => void;
  initialNote?: NoteItem | null;
}

export const NoteFormModal: React.FC<NoteFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialNote,
}) => {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [color, setColor] = useState(NOTE_COLORS[0]);
  const [pinned, setPinned] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setCategory(initialNote.category || 'General');
      setColor(initialNote.color || NOTE_COLORS[0]);
      setPinned(!!initialNote.pinned);
      setShowCustomCat(false);
      setCustomCategory('');
    } else {
      setTitle('');
      setContent('');
      setCategory('General');
      setColor(NOTE_COLORS[0]);
      setPinned(false);
      setShowCustomCat(false);
      setCustomCategory('');
    }
    setError('');
  }, [initialNote, visible]);

  const handleSubmit = () => {
    if (!title.trim()) {
      HapticService.error();
      setError('Please enter a note title');
      return;
    }

    if (!content.trim()) {
      HapticService.error();
      setError('Note content cannot be empty');
      return;
    }

    const finalCategory = showCustomCat && customCategory.trim()
      ? customCategory.trim()
      : category;

    HapticService.success();
    onSave({
      title: title.trim(),
      content: content.trim(),
      category: finalCategory,
      color,
      pinned,
    });
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={initialNote ? 'Edit Note' : 'Create New Note'}
      subtitle="Capture thoughts, checklists, codes, and memos"
    >
      {/* Title */}
      <Input
        label="Note Title *"
        placeholder="e.g., Project Architecture Notes"
        value={title}
        onChangeText={t => {
          setTitle(t);
          if (error) setError('');
        }}
        error={error}
        clearable
      />

      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {NOTE_CATEGORIES.filter(c => c.id !== 'All').map(cat => {
            const active = !showCustomCat && category.toLowerCase() === cat.id.toLowerCase();
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  HapticService.selection();
                  setShowCustomCat(false);
                  setCategory(cat.id);
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? `${cat.color}25` : colors.glassCard,
                    borderColor: active ? cat.color : colors.glassBorder,
                    borderWidth: active ? 1.5 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? cat.color : colors.textSecondary },
                    active && { fontWeight: '700' },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => {
              HapticService.selection();
              setShowCustomCat(true);
            }}
            style={[
              styles.chip,
              {
                backgroundColor: showCustomCat ? `${colors.primary}25` : colors.glassCard,
                borderColor: showCustomCat ? colors.primary : colors.glassBorder,
                borderWidth: showCustomCat ? 1.5 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: showCustomCat ? colors.primaryLight : colors.textSecondary },
                showCustomCat && { fontWeight: '700' },
              ]}
            >
              + Custom
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {showCustomCat && (
          <Input
            placeholder="Type custom category name..."
            value={customCategory}
            onChangeText={setCustomCategory}
            containerStyle={{ marginTop: 8 }}
          />
        )}
      </View>

      {/* Color Accent Picker */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Color Theme</Text>
        <View style={styles.colorRow}>
          {NOTE_COLORS.map(c => {
            const isSelected = color === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => {
                  HapticService.selection();
                  setColor(c);
                }}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  isSelected && {
                    transform: [{ scale: 1.25 }],
                    borderWidth: 2.5,
                    borderColor: '#FFFFFF',
                  },
                ]}
              >
                {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Pin to Top Option */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          HapticService.selection();
          setPinned(!pinned);
        }}
        style={[
          styles.pinRow,
          {
            backgroundColor: pinned ? `${colors.primary}20` : colors.glassCard,
            borderColor: pinned ? colors.primaryLight : colors.glassBorder,
          },
        ]}
      >
        <View style={styles.pinTextContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={pinned ? 'pin' : 'pin-outline'} size={18} color={pinned ? colors.primaryLight : colors.textSecondary} />
            <Text style={[styles.pinTitle, { color: colors.text }]}>Pin to Top</Text>
          </View>
          <Text style={[styles.pinSubtitle, { color: colors.textMuted }]}>
            Keep this note pinned to the top of your notepad
          </Text>
        </View>
        <View style={[styles.toggleCircle, { backgroundColor: pinned ? colors.primary : colors.surfaceHighlight }]}>
          {pinned && <Ionicons name="checkmark" size={14} color="#FFF" />}
        </View>
      </TouchableOpacity>

      {/* Content Editor */}
      <View style={styles.section}>
        <View style={styles.contentLabelRow}>
          <Text style={[styles.sectionLabel, { color: colors.text, marginBottom: 0 }]}>Note Content *</Text>
          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {content.length} chars • {content.split('\n').length} lines
          </Text>
        </View>
        <TextInput
          value={content}
          onChangeText={c => {
            setContent(c);
            if (error) setError('');
          }}
          placeholder="Start writing your thoughts, checklists, documentation, snippets..."
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          style={[
            styles.contentInput,
            {
              backgroundColor: colors.surfaceHighlight,
              borderColor: colors.borderLight,
              color: colors.text,
            },
          ]}
        />
      </View>

      {/* Submit Button */}
      <Button
        title={initialNote ? 'Update Note' : 'Save Note'}
        icon="save-outline"
        onPress={handleSubmit}
        style={{ marginTop: Spacing.sm }}
      />
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 8,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  pinTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  pinTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  pinSubtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  charCount: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
  },
  contentInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    lineHeight: 22,
    minHeight: 180,
  },
});
