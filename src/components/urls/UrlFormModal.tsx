import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { UrlCategories } from '../../constants/categories';
import { UrlItem, UrlCategory } from '../../types';
import { isValidUrl } from '../../utils';
import { HapticService } from '../../utils/haptics';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ModalWrapper } from '../common/ModalWrapper';

interface UrlFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    url: string;
    category: UrlCategory;
    note?: string;
  }) => void;
  initialItem?: UrlItem | null;
}

export const UrlFormModal: React.FC<UrlFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialItem,
}) => {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<UrlCategory>('Work');
  const [note, setNote] = useState('');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setUrl(initialItem.url);
      setCategory(initialItem.category);
      setNote(initialItem.note || '');
    } else {
      setTitle('');
      setUrl('');
      setCategory('Work');
      setNote('');
      setShowCustomCategory(false);
    }
    setTitleError('');
    setUrlError('');
  }, [initialItem, visible]);

  const handleSubmit = () => {
    let hasError = false;
    if (!title.trim()) {
      setTitleError('Title is required');
      hasError = true;
    }
    if (!url.trim()) {
      setUrlError('URL is required');
      hasError = true;
    } else if (!isValidUrl(url)) {
      setUrlError('Please enter a valid URL (e.g. github.com or https://example.com)');
      hasError = true;
    }

    if (hasError) {
      HapticService.error();
      return;
    }

    const finalCategory = showCustomCategory && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : category;

    HapticService.success();
    onSave({
      title: title.trim(),
      url: url.trim(),
      category: finalCategory,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={initialItem ? 'Edit URL' : 'Save Important Link'}
      subtitle="Keep quick access to portals, repos, and docs"
    >
      <Input
        label="Title *"
        placeholder="e.g., HRMS Portal or GitHub Repo"
        value={title}
        onChangeText={t => {
          setTitle(t);
          if (titleError) setTitleError('');
        }}
        error={titleError}
        clearable
      />

      <Input
        label="URL Address *"
        placeholder="https://example.com"
        value={url}
        onChangeText={u => {
          setUrl(u);
          if (urlError) setUrlError('');
        }}
        error={urlError}
        icon="link-outline"
        autoCapitalize="none"
        keyboardType="url"
        clearable
      />

      {/* Category */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {UrlCategories.map(cat => {
            const active = !showCustomCategory && category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  HapticService.selection();
                  setShowCustomCategory(false);
                  setCategory(cat.id);
                }}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: active ? `${cat.color}25` : colors.glassCard,
                    borderColor: active ? cat.color : colors.glassBorder,
                    borderWidth: active ? 1.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.categoryChipText, { color: active ? cat.color : colors.textSecondary }, active && { fontWeight: '700' }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => {
              HapticService.selection();
              setShowCustomCategory(true);
            }}
            style={[
              styles.categoryChip,
              {
                backgroundColor: showCustomCategory ? `${colors.primary}25` : colors.glassCard,
                borderColor: showCustomCategory ? colors.primary : colors.glassBorder,
                borderWidth: showCustomCategory ? 1.5 : 1,
              },
            ]}
          >
            <Text style={[styles.categoryChipText, { color: showCustomCategory ? colors.primaryLight : colors.textSecondary }, showCustomCategory && { fontWeight: '700' }]}>
              + Custom
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {showCustomCategory && (
          <Input
            placeholder="Enter custom category name"
            value={customCategoryInput}
            onChangeText={setCustomCategoryInput}
            containerStyle={{ marginTop: 8 }}
          />
        )}
      </View>

      {/* Note */}
      <Input
        label="Notes / Description (Optional)"
        placeholder="Credentials note, context, or bookmark details..."
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
        style={{ minHeight: 70, textAlignVertical: 'top' }}
      />

      <Button
        title={initialItem ? 'Update URL' : 'Save URL'}
        onPress={handleSubmit}
        style={{ marginTop: Spacing.lg }}
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
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
});
