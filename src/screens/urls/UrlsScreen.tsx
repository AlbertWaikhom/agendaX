import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UrlCategories } from '../../constants/categories';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { UrlService } from '../../services/urlService';
import { UrlItem } from '../../types';
import { PageContainer } from '../../../components/page/PageContainer';
import { Input } from '../../components/common/Input';
import { UrlCard } from '../../components/urls/UrlCard';
import { PageLockGuard } from '../../components/security/PageLockGuard';
import { UrlFormModal } from '../../components/urls/UrlFormModal';
import { CustomAlertModal, AlertButton } from '../../components/common/CustomAlertModal';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { createUrlsStyles } from './UrlsScreen.styles';

export const UrlsScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createUrlsStyles(colors), [colors]);

  const { urls, addUrl, updateUrl, deleteUrl } = useWorkspace();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUrl, setEditingUrl] = useState<UrlItem | null>(null);

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

  const displayedUrls = useMemo(() => {
    return UrlService.filterUrls(urls, searchQuery, selectedCategory);
  }, [urls, searchQuery, selectedCategory]);

  const handleEdit = (url: UrlItem) => {
    setEditingUrl(url);
    setShowModal(true);
  };

  const confirmDeleteUrl = (url: UrlItem) => {
    setAlertConfig({
      visible: true,
      title: 'Delete Bookmark',
      message: `Are you sure you want to delete "${url.title}" (${url.url})?`,
      icon: 'trash-outline',
      iconColor: colors.error,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Link',
          style: 'destructive',
          icon: 'trash-outline',
          onPress: () => {
            deleteUrl(url.id);
          },
        },
      ],
    });
  };

  const handleSave = async (data: any) => {
    if (editingUrl) {
      await updateUrl(editingUrl.id, data);
    } else {
      await addUrl(data);
    }
  };

  return (
    <PageContainer>
      <PageLockGuard pageId="Urls" pageTitle="Important Links">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Important Links</Text>
            <Text style={styles.headerSubtitle}>{urls.length} saved URLs & workspaces</Text>
          </View>
        </View>

        {/* Search */}
        <Input
          placeholder="Search URLs by title or link..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search-outline"
          clearable
          containerStyle={{ marginBottom: 12 }}
        />

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

          {UrlCategories.map(cat => {
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

        {/* URLs List */}
        <FlatList
          data={displayedUrls}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <UrlCard
              item={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => confirmDeleteUrl(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="link-outline" size={48} color={colors.textMuted} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No saved links found</Text>
              <Text style={styles.emptySub}>
                {searchQuery ? 'Try clearing your search query' : 'Tap the + button to save your first important URL.'}
              </Text>
            </View>
          }
        />
      </View>

      <FloatingActionButton
        onPress={() => {
          setEditingUrl(null);
          setShowModal(true);
        }}
      />

      <UrlFormModal
        visible={showModal}
        initialItem={editingUrl}
        onClose={() => {
          setShowModal(false);
          setEditingUrl(null);
        }}
        onSave={handleSave}
      />

      {/* Custom Liquid Glass Alert Modal for Bookmark Deletion */}
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
