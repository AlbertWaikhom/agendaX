import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    previewImageUri?: string;
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
  const [previewImageUri, setPreviewImageUri] = useState<string | undefined>(undefined);
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
      setPreviewImageUri(initialItem.previewImageUri);
    } else {
      setTitle('');
      setUrl('');
      setCategory('Work');
      setNote('');
      setPreviewImageUri(undefined);
      setShowCustomCategory(false);
    }
    setTitleError('');
    setUrlError('');
  }, [initialItem, visible]);

  const handlePickPreview = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPreviewImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Pick URL thumbnail error:', e);
    }
  };

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
      previewImageUri,
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

      {/* Optional Bookmark Image Attachment */}
      <View style={{ marginBottom: Spacing.md }}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Screenshot / Logo (Optional)</Text>
        {previewImageUri ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.glassBorder }}>
            <Ionicons name="image" size={24} color={colors.primaryLight} />
            <Text style={{ flex: 1, marginLeft: 10, fontSize: 12, color: colors.text }} numberOfLines={1}>
              Thumbnail Attached
            </Text>
            <TouchableOpacity onPress={() => setPreviewImageUri(undefined)} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handlePickPreview}
            style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.glassBorder, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: colors.glassCard }}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={colors.primaryLight} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Upload Logo or Screenshot</Text>
          </TouchableOpacity>
        )}
      </View>

      <Button
        title={initialItem ? 'Update URL' : 'Save URL'}
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
