import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { NotificationRecord } from '../../types';
import { formatDatePretty } from '../../utils';
import { PageContainer } from '../../../components/page/PageContainer';
import { CustomAlertModal, AlertButton } from '../../components/common/CustomAlertModal';
import { createNotificationsStyles } from './NotificationsScreen.styles';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useMemo(() => createNotificationsStyles(colors), [colors]);

  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useWorkspace();

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

  const unreadCount = notifications.filter(n => !n.read).length;

  const confirmClearAll = () => {
    setAlertConfig({
      visible: true,
      title: 'Clear Notifications',
      message: 'Are you sure you want to remove all notifications?',
      icon: 'trash-outline',
      iconColor: colors.error,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          icon: 'trash-outline',
          onPress: () => clearAllNotifications(),
        },
      ],
    });
  };

  const confirmDeleteOne = (item: NotificationRecord) => {
    setAlertConfig({
      visible: true,
      title: 'Delete Notification',
      message: `Delete "${item.title}"?`,
      icon: 'trash-outline',
      iconColor: colors.error,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(item.id),
        },
      ],
    });
  };

  const renderItem = ({ item }: { item: NotificationRecord }) => {
    let iconName: keyof typeof Ionicons.glyphMap = 'notifications-outline';
    let iconColor = colors.primaryLight;

    if (item.type === 'task') {
      iconName = 'checkmark-circle-outline';
      iconColor = colors.accentBlue;
    } else if (item.type === 'event') {
      iconName = 'calendar-outline';
      iconColor = colors.accentPurple;
    } else if (item.type === 'system') {
      iconName = 'sparkles-outline';
      iconColor = colors.accentPink;
    }

    const dateStr = item.timestamp ? formatDatePretty(item.timestamp.split('T')[0]) : 'Recently';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => markNotificationAsRead(item.id)}
        style={[styles.notifItem, !item.read && styles.notifItemUnread]}
      >
        <View style={[styles.notifIconBox, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>

        <View style={styles.notifContent}>
          <Text style={styles.notifTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notifMessage}>{item.message}</Text>
          <Text style={styles.notifTime}>{dateStr}</Text>
        </View>

        <TouchableOpacity
          onPress={() => confirmDeleteOne(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <PageContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                {unreadCount} unread • {notifications.length} total
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.headerActionBtn} onPress={markAllNotificationsAsRead}>
                <Text style={styles.headerActionText}>Read All</Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity style={styles.headerActionBtn} onPress={confirmClearAll}>
                <Text style={[styles.headerActionText, { color: colors.error }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySub}>All your reminders and schedule updates will appear here.</Text>
            </View>
          }
        />

        {/* Custom Alert Modal for Notifications */}
        <CustomAlertModal
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          icon={alertConfig.icon}
          iconColor={alertConfig.iconColor}
          buttons={alertConfig.buttons}
          onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        />
      </View>
    </PageContainer>
  );
};
