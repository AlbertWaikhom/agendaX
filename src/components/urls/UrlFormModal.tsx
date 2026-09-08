import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { UrlCategories } from '../../constants/categories';
import { UrlItem, UrlCategory } from '../../types';
import { isValidUrl, getDomain } from '../../utils';
import { HapticService } from '../../utils/haptics';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ModalWrapper } from '../common/ModalWrapper';
import { MediaStorage } from '../../storage/mediaStorage';

interface MultiLinkEntry {
  id: string;
  title: string;
  url: string;
}

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
  onSaveMultiple?: (items: Array<{
    title: string;
    url: string;
    category: UrlCategory;
    note?: string;
  }>) => void;
  initialItem?: UrlItem | null;
}

export const UrlFormModal: React.FC<UrlFormModalProps> = ({
  visible,
  onClose,
  onSave,
  onSaveMultiple,
  initialItem,
}) => {
  const { colors } = useTheme();

  // Mode: 'single' | 'multiple'
  const [mode, setMode] = useState<'single' | 'multiple'>('single');

  // Single mode state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<UrlCategory>('Work');
  const [note, setNote] = useState('');
  const [previewImageUri, setPreviewImageUri] = useState<string | undefined>(undefined);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [urlError, setUrlError] = useState('');

  // Multiple mode state
  const [bulkText, setBulkText] = useState('');
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [multiLinks, setMultiLinks] = useState<MultiLinkEntry[]>([
    { id: '1', title: '', url: '' },
    { id: '2', title: '', url: '' },
  ]);
  const [multiError, setMultiError] = useState('');

  useEffect(() => {
    if (initialItem) {
      setMode('single');
      setTitle(initialItem.title);
      setUrl(initialItem.url);
      setCategory(initialItem.category);
      setNote(initialItem.note || '');
      setPreviewImageUri(initialItem.previewImageUri);
    } else {
      setMode('single');
      setTitle('');
      setUrl('');
      setCategory('Work');
      setNote('');
      setPreviewImageUri(undefined);
      setShowCustomCategory(false);
      setBulkText('');
      setShowBulkPaste(false);
      setMultiLinks([
        { id: '1', title: '', url: '' },
        { id: '2', title: '', url: '' },
      ]);
    }
    setTitleError('');
    setUrlError('');
    setMultiError('');
  }, [initialItem, visible]);

  const handlePickPreview = async () => {
    try {
      const res = await MediaStorage.pickImage('bookmark thumbnail');
      if (res.success && res.uri) {
        setPreviewImageUri(res.uri);
      }
    } catch (e) {
      console.warn('Pick URL thumbnail error:', e);
    }
  };

  const handleSingleSubmit = () => {
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

  // --- Multi-Link Handlers ---
  const handleAddRow = () => {
    setMultiLinks(prev => [...prev, { id: String(Date.now() + Math.random()), title: '', url: '' }]);
  };

  const handleRemoveRow = (id: string) => {
    if (multiLinks.length <= 1) return;
    setMultiLinks(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateRow = (id: string, field: 'title' | 'url', value: string) => {
    setMultiLinks(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'url' && !item.title.trim() && value.includes('.')) {
          const dom = getDomain(value);
          if (dom) {
            updated.title = dom.charAt(0).toUpperCase() + dom.slice(1);
          }
        }
        return updated;
      })
    );
    if (multiError) setMultiError('');
  };

  const handleParseBulkText = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed: MultiLinkEntry[] = [];

    for (const line of lines) {
      let t = '';
      let u = '';

      if (line.includes(',')) {
        const parts = line.split(',');
        t = parts[0].trim();
        u = parts.slice(1).join(',').trim();
      } else if (line.includes(' - ')) {
        const parts = line.split(' - ');
        t = parts[0].trim();
        u = parts.slice(1).join(' - ').trim();
      } else {
        u = line;
        const dom = getDomain(line);
        t = dom ? dom.charAt(0).toUpperCase() + dom.slice(1) : line;
      }

      if (u) {
        parsed.push({
          id: String(Date.now() + Math.random()),
          title: t || u,
          url: u,
        });
      }
    }

    if (parsed.length > 0) {
      setMultiLinks(parsed);
      setShowBulkPaste(false);
      setBulkText('');
      setMultiError('');
      HapticService.selection();
    }
  };

  const handleMultiSubmit = () => {
    const validItems: Array<{ title: string; url: string; category: UrlCategory }> = [];
    const finalCategory = showCustomCategory && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : category;

    for (const item of multiLinks) {
      const trimmedUrl = item.url.trim();
      if (!trimmedUrl) continue;

      if (!isValidUrl(trimmedUrl)) {
        setMultiError(`Invalid URL format: "${trimmedUrl}"`);
        HapticService.error();
        return;
      }

      const domain = getDomain(trimmedUrl);
      const fallbackTitle = domain ? domain.charAt(0).toUpperCase() + domain.slice(1) : trimmedUrl;
      const finalTitle = item.title.trim() || fallbackTitle;

      validItems.push({
        title: finalTitle,
        url: trimmedUrl,
        category: finalCategory,
      });
    }

    if (validItems.length === 0) {
      setMultiError('Please enter at least one valid URL.');
      HapticService.error();
      return;
    }

    HapticService.success();
    if (onSaveMultiple) {
      onSaveMultiple(validItems);
    } else {
      validItems.forEach(v => onSave(v));
    }
    onClose();
  };

  const finalCategory = showCustomCategory && customCategoryInput.trim()
    ? customCategoryInput.trim()
    : category;

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={initialItem ? 'Edit Bookmark' : mode === 'multiple' ? 'Add Multiple Links' : 'Save Important Link'}
      subtitle="Keep quick access to portals, repos, and docs"
    >
      {/* Mode Switcher Segmented Control (only when adding new) */}
      {!initialItem && (
        <View style={[styles.modeToggleBar, { backgroundColor: colors.surfaceHighlight, borderColor: colors.glassBorder }]}>
          <TouchableOpacity
            style={[styles.modeToggleTab, mode === 'single' && { backgroundColor: colors.primary }]}
            onPress={() => setMode('single')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="link-outline"
              size={15}
              color={mode === 'single' ? '#FFF' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.modeToggleText, { color: mode === 'single' ? '#FFF' : colors.textSecondary }]}>
              Single Link
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeToggleTab, mode === 'multiple' && { backgroundColor: colors.primary }]}
            onPress={() => setMode('multiple')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="layers-outline"
              size={15}
              color={mode === 'multiple' ? '#FFF' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.modeToggleText, { color: mode === 'multiple' ? '#FFF' : colors.textSecondary }]}>
              Add Multiple
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Shared Category Selector */}
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

      {/* SINGLE LINK FORM */}
      {mode === 'single' && (
        <View>
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
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Screenshot / Logo / Media (Optional)</Text>
            {previewImageUri ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.glassBorder }}>
                <Image
                  source={{ uri: previewImageUri }}
                  style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#000', marginRight: 10 }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                    Media Attached
                  </Text>
                  <TouchableOpacity onPress={handlePickPreview} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                    <Text style={{ fontSize: 11, color: colors.primaryLight, marginTop: 2 }}>Tap to change</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setPreviewImageUri(undefined)} style={{ padding: 6 }}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePickPreview}
                style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.glassBorder, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: colors.glassCard }}
              >
                <Ionicons name="cloud-upload-outline" size={18} color={colors.primaryLight} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Upload Logo, Media or Screenshot</Text>
              </TouchableOpacity>
            )}
          </View>

          <Button
            title={initialItem ? 'Update URL' : 'Save URL'}
            onPress={handleSingleSubmit}
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      )}

      {/* MULTIPLE LINKS FORM */}
      {mode === 'multiple' && (
        <View>
          {/* Quick Paste Accordion Toggle */}
          <View style={styles.quickPasteHeader}>
            <TouchableOpacity
              style={[styles.quickPasteBtn, { borderColor: colors.primaryLight, backgroundColor: `${colors.primary}12` }]}
              onPress={() => setShowBulkPaste(!showBulkPaste)}
            >
              <Ionicons name={showBulkPaste ? 'chevron-up' : 'copy-outline'} size={16} color={colors.primaryLight} />
              <Text style={[styles.quickPasteBtnText, { color: colors.primaryLight }]}>
                {showBulkPaste ? 'Hide Bulk Paste Box' : 'Quick Paste Multiple URLs'}
              </Text>
            </TouchableOpacity>
          </View>

          {showBulkPaste && (
            <View style={[styles.bulkPasteCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.glassBorder }]}>
              <Text style={[styles.bulkPasteHint, { color: colors.textSecondary }]}>
                Paste one URL per line (e.g. `https://github.com` or `Google, https://google.com`):
              </Text>
              <TextInput
                style={[
                  styles.bulkTextInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                value={bulkText}
                onChangeText={setBulkText}
                placeholder="https://github.com&#10;Google, https://google.com&#10;Expo Docs - https://docs.expo.dev"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                autoCapitalize="none"
              />
              <Button
                title="Populate Links Below"
                variant="secondary"
                icon="flash-outline"
                onPress={handleParseBulkText}
                style={{ marginTop: 8 }}
              />
            </View>
          )}

          {/* Links List */}
          <View style={{ marginTop: Spacing.sm }}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Links List ({multiLinks.filter(l => l.url.trim()).length} entered)
            </Text>

            {multiError ? (
              <View style={[styles.errorBox, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{multiError}</Text>
              </View>
            ) : null}

            {multiLinks.map((row, index) => (
              <View
                key={row.id}
                style={[
                  styles.linkRowCard,
                  {
                    backgroundColor: colors.glassCard,
                    borderColor: colors.glassBorder,
                  },
                ]}
              >
                <View style={styles.linkRowHeader}>
                  <View style={[styles.rowNumberPill, { backgroundColor: `${colors.primary}20` }]}>
                    <Text style={[styles.rowNumberText, { color: colors.primaryLight }]}>#{index + 1}</Text>
                  </View>
                  <Text style={[styles.rowTitleLabel, { color: colors.textSecondary }]}>Link Entry</Text>
                  {multiLinks.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveRow(row.id)}
                      style={styles.deleteRowBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={[styles.rowInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  placeholder="Title (e.g. GitHub or auto-detected)"
                  placeholderTextColor={colors.textMuted}
                  value={row.title}
                  onChangeText={val => handleUpdateRow(row.id, 'title', val)}
                />

                <TextInput
                  style={[styles.rowInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, marginTop: 8 }]}
                  placeholder="https://example.com"
                  placeholderTextColor={colors.textMuted}
                  value={row.url}
                  onChangeText={val => handleUpdateRow(row.id, 'url', val)}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={handleAddRow}
              style={[styles.addAnotherBtn, { borderColor: colors.primaryLight, backgroundColor: `${colors.primary}12` }]}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primaryLight} />
              <Text style={[styles.addAnotherText, { color: colors.primaryLight }]}>+ Add Another Link</Text>
            </TouchableOpacity>

            <Button
              title={`Save ${multiLinks.filter(l => l.url.trim()).length || ''} Links`}
              onPress={handleMultiSubmit}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </View>
      )}
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  modeToggleBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  modeToggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  modeToggleText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
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
  quickPasteHeader: {
    marginBottom: Spacing.sm,
  },
  quickPasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 6,
  },
  quickPasteBtnText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  bulkPasteCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  bulkPasteHint: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginBottom: 6,
  },
  bulkTextInput: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  linkRowCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  linkRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowNumberPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginRight: 8,
  },
  rowNumberText: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
  },
  rowTitleLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    flex: 1,
  },
  deleteRowBtn: {
    padding: 4,
  },
  rowInput: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 6,
    marginTop: Spacing.xs,
  },
  addAnotherText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  errorText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
});
