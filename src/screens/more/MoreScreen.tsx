import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useSecurity } from '../../context/SecurityContext';
import { PageContainer } from '../../../components/page/PageContainer';
import { PageLockGuard } from '../../components/security/PageLockGuard';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ModalWrapper } from '../../components/common/ModalWrapper';
import { BackupRestoreModal } from './BackupRestoreModal';
import { AboutModal } from './AboutModal';
import { ThemeSelectorModal, THEME_OPTIONS } from './ThemeSelectorModal';
import { SecuritySettingsModal } from '../../components/security/SecuritySettingsModal';
import { ThemeMode } from '../../types';
import { FileStorage } from '../../storage/fileStorage';
import { RINGTONE_OPTIONS } from '../../services/notificationService';
import { UpdateService, UpdateCheckResult, CURRENT_APP_VERSION } from '../../services/updateService';
import { CustomAlertModal, AlertButton } from '../../components/common/CustomAlertModal';
import { createMoreStyles } from './MoreScreen.styles';

export const MoreScreen: React.FC = () => {
  const { theme, colors, setTheme } = useTheme();
  const styles = useMemo(() => createMoreStyles(colors), [colors]);

  const {
    user,
    settings,
    updateUser,
    updateUserAvatar,
    removeUserAvatar,
    triggerTestNotification,
    updateSettings,
    clearWorkspace,
  } = useWorkspace();

  const { securitySettings } = useSecurity();

  const [showEditName, setShowEditName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [copiedId, setCopiedId] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAppSettingsModal, setShowAppSettingsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isTestingSound, setIsTestingSound] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

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

  const handleCopyId = async () => {
    if (user?.id) {
      await Clipboard.setStringAsync(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(e => console.warn('Cannot open URL:', e));
  };

  const handleSaveName = async () => {
    if (nameInput.trim()) {
      await updateUser(nameInput.trim());
      setShowEditName(false);
    }
  };

  const handleAvatarPress = () => {
    if (user?.avatarUri) {
      setAlertConfig({
        visible: true,
        title: 'Profile Picture',
        message: 'Customize your local profile photo or avatar',
        icon: 'camera',
        iconColor: colors.primaryLight,
        buttons: [
          {
            text: 'Upload New Photo',
            style: 'primary',
            icon: 'image-outline',
            onPress: () => handlePickAvatar(),
          },
          {
            text: 'Remove Photo',
            style: 'destructive',
            icon: 'trash-outline',
            onPress: async () => {
              await removeUserAvatar();
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
      });
    } else {
      handlePickAvatar();
    }
  };

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setAlertConfig({
          visible: true,
          title: 'Permission Required',
          message: 'Please allow gallery access to set your profile picture.',
          icon: 'lock-closed-outline',
          iconColor: colors.warning,
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        setAlertConfig({
          visible: true,
          title: 'File Too Large',
          message: `The selected photo is ${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB. Maximum allowed size is 10 MB.`,
          icon: 'alert-circle-outline',
          iconColor: colors.error,
        });
        return;
      }

      await FileStorage.ensureDirectoriesAsync();
      const imagesDir = FileStorage.getMediaDirectory('images');
      const storedFileName = `profile_${user?.id || 'default'}.jpg`;
      const destFile = new File(imagesDir, storedFileName);

      if (Platform.OS !== 'web') {
        const sourceFile = new File(asset.uri);
        if (sourceFile.exists) {
          sourceFile.copy(destFile);
        }
      }

      const finalUri = Platform.OS === 'web' ? asset.uri : destFile.uri;
      await updateUserAvatar(finalUri);
      setAlertConfig({
        visible: true,
        title: 'Profile Updated',
        message: 'Your profile picture has been saved successfully.',
        icon: 'checkmark-circle-outline',
        iconColor: colors.success,
      });
    } catch (e: any) {
      console.warn('[MoreScreen] Avatar pick error:', e);
      setAlertConfig({
        visible: true,
        title: 'Upload Failed',
        message: e?.message || 'Could not save profile picture',
        icon: 'close-circle-outline',
        iconColor: colors.error,
      });
    }
  };

  const handleTestSound = async (soundId: string, soundName: string) => {
    setIsTestingSound(true);
    await updateSettings({ reminderSound: soundId });
    await triggerTestNotification(soundId, soundName);
    setTimeout(() => setIsTestingSound(false), 1500);
  };

  const handleCheckUpdates = async () => {
    setIsCheckingUpdate(true);
    const result = await UpdateService.checkForUpdates();
    setIsCheckingUpdate(false);

    if (result.hasUpdate) {
      setAlertConfig({
        visible: true,
        title: ` Update Available: v${result.latestVersion}`,
        message: `${result.releaseTitle}\n\n${result.releaseNotes?.substring(0, 180)}...\n\nClick below to download the latest APK from GitHub.`,
        icon: 'arrow-down-circle',
        iconColor: colors.accentEmerald,
        buttons: [
          {
            text: `Download v${result.latestVersion} APK`,
            style: 'primary',
            icon: 'download-outline',
            onPress: () => handleOpenLink(result.downloadUrl),
          },
          {
            text: 'View on GitHub',
            style: 'default',
            icon: 'logo-github',
            onPress: () => handleOpenLink('https://github.com/AlbertWaikhom/agendaX/releases'),
          },
          {
            text: 'Later',
            style: 'cancel',
          },
        ],
      });
    } else if (result.isError) {
      setAlertConfig({
        visible: true,
        title: 'Offline / Network Unavailable',
        message: 'Could not connect to GitHub to check for updates. AgendaX is running 100% offline.',
        icon: 'cloud-offline-outline',
        iconColor: colors.textMuted,
        buttons: [
          {
            text: 'Open GitHub Directly',
            style: 'default',
            onPress: () => handleOpenLink('https://github.com/AlbertWaikhom/agendaX/releases'),
          },
          { text: 'OK', style: 'primary' },
        ],
      });
    } else {
      setAlertConfig({
        visible: true,
        title: 'You are Up to Date! ✨',
        message: `You are running the latest version of AgendaX (v${CURRENT_APP_VERSION}) with full offline SQLite storage.`,
        icon: 'checkmark-done-circle',
        iconColor: colors.success,
        buttons: [{ text: 'Great', style: 'primary' }],
      });
    }
  };

  const handleClearAllData = () => {
    setAlertConfig({
      visible: true,
      title: ' Wipe All Data',
      message: 'This will permanently delete your local SQLite database, tasks, events, expenses, attachments, and settings.\n\nThis action cannot be undone.',
      icon: 'trash',
      iconColor: colors.error,
      buttons: [
        {
          text: 'Wipe Everything',
          style: 'destructive',
          icon: 'trash-outline',
          onPress: async () => {
            await clearWorkspace();
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    });
  };

  return (
    <PageContainer>
      <PageLockGuard pageId="Settings" pageTitle="Settings & Security">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Page Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Workspace & Settings</Text>
            <Text style={styles.headerSubtitle}>Customize themes, profile, alerts & security</Text>
          </View>

          {/* User Profile Glass Hero Card */}
          <View style={styles.profileCard}>
            <TouchableOpacity
              style={[styles.avatarWrapper, { backgroundColor: user?.avatarColor || colors.primary }]}
              onPress={handleAvatarPress}
              activeOpacity={0.8}
            >
              {user?.avatarUri ? (
                <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </Text>
              )}
              <View style={styles.avatarCameraBadge}>
                <Ionicons name="camera" size={10} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Workspace User'}</Text>
              <TouchableOpacity style={styles.profileBadge} onPress={handleCopyId} activeOpacity={0.7}>
                <Ionicons name="finger-print" size={14} color={colors.primaryLight} />
                <Text style={styles.workspaceId}>{user?.id || 'AGX-LOCAL'}</Text>
                <Ionicons
                  name={copiedId ? 'checkmark-circle' : 'copy-outline'}
                  size={14}
                  color={copiedId ? colors.success : colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.editNameBtn}
              onPress={() => {
                setNameInput(user?.name || '');
                setShowEditName(true);
              }}
            >
              <Ionicons name="pencil" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Settings Group */}
          <View style={styles.menuGroup}>
            {/* App Theme Selector */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => setShowThemeModal(true)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="color-palette-outline" size={18} color={colors.primaryLight} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>App Theme & Accents</Text>
                  <Text style={styles.menuSubtitle}>
                    {THEME_OPTIONS.find(t => t.id === theme)?.name || 'Sunset Amber'} • AgendaX Liquid Effect
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: THEME_OPTIONS.find(t => t.id === theme)?.accent || colors.primary,
                  }}
                />
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
            {/* Security & Lock Feature */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => setShowSecurityModal(true)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: `${colors.accentEmerald}20` }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.accentEmerald} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Security & App Lock</Text>
                  <Text style={styles.menuSubtitle}>
                    {securitySettings.appLockEnabled
                      ? 'Full App Lock Active'
                      : securitySettings.lockedPages.length > 0
                        ? `${securitySettings.lockedPages.length} pages protected`
                        : 'Fingerprint, Face ID & Custom PIN'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Backup & Restore */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => setShowBackupModal(true)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="cloud-download-outline" size={18} color={colors.primaryLight} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>SQLite Backup & Restore</Text>
                  <Text style={styles.menuSubtitle}>Export offline database or restore ZIP/JSON</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Preferences & Alarm Ringtone */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => setShowAppSettingsModal(true)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: `${colors.accentPurple}20` }]}>
                  <Ionicons name="notifications-circle-outline" size={18} color={colors.accentPurple} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Alarms, Alerts & Ringtones</Text>
                  <Text style={styles.menuSubtitle}>Offline audio tones & control panel alerts</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Online Version & Update Checker */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleCheckUpdates}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#38BDF820' }]}>
                  {isCheckingUpdate ? (
                    <ActivityIndicator size="small" color="#38BDF8" />
                  ) : (
                    <Ionicons name="sparkles" size={18} color="#38BDF8" />
                  )}
                </View>
                <View>
                  <Text style={styles.menuTitle}>Check for GitHub Updates</Text>
                  <Text style={styles.menuSubtitle}>Online release lookup • Current: v{CURRENT_APP_VERSION}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Direct APK Download URL */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleOpenLink('https://github.com/AlbertWaikhom/agendaX/releases/download/v1.01/agendaX-v1.01.apk')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#34D39920' }]}>
                  <Ionicons name="logo-android" size={18} color="#34D399" />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Download Standalone APK (v1.01)</Text>
                  <Text style={styles.menuSubtitle}>100% Offline APK file (~90 MB direct link)</Text>
                </View>
              </View>
              <Ionicons name="download-outline" size={18} color="#34D399" />
            </TouchableOpacity>

            {/* About AgendaX */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => setShowAboutModal(true)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: `${colors.accentCyan}20` }]}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.accentCyan} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>About AgendaX</Text>
                  <Text style={styles.menuSubtitle}>Offline architecture, features & developer info</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Reset Workspace */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              activeOpacity={0.7}
              onPress={handleClearAllData}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: colors.errorBg }]}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </View>
                <View>
                  <Text style={[styles.menuTitle, { color: colors.error }]}>Reset Workspace</Text>
                  <Text style={styles.menuSubtitle}>Permanently wipe all SQLite database data</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>

          {/* Developer Profile Card */}
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.glassCard,
                borderColor: colors.glassBorder,
                borderTopColor: colors.glassSpecular,
                flexDirection: 'column',
                alignItems: 'stretch',
                marginVertical: 12,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <View style={[styles.avatarWrapper, { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22 }]}>
                <Ionicons name="code-slash" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.8 }}>
                  DEVELOPED BY
                </Text>
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 16, fontWeight: '800', color: colors.text }}>
                  Waikhom Albert Mangang
                </Text>
              </View>
            </View>

            {/* Social Links Buttons */}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: colors.surfaceHighlight,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                }}
                onPress={() => handleOpenLink('https://github.com/AlbertWaikhom/')}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-github" size={16} color={colors.text} />
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 12, fontWeight: '700', color: colors.text }}>GitHub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: '#0077B520',
                  borderWidth: 1,
                  borderColor: '#0077B550',
                }}
                onPress={() => handleOpenLink('https://www.linkedin.com/in/waikhom-albert-mangang-9b4362246/')}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-linkedin" size={16} color="#0077B5" />
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 12, fontWeight: '700', color: '#0077B5' }}>LinkedIn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: '#E1306C20',
                  borderWidth: 1,
                  borderColor: '#E1306C50',
                }}
                onPress={() => handleOpenLink('https://www.instagram.com/albert_waikhom/')}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-instagram" size={16} color="#E1306C" />
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 12, fontWeight: '700', color: '#E1306C' }}>Instagram</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerAppTitle}>AgendaX</Text>
            <Text style={styles.footerTagline}>Plan. Track. Achieve.</Text>
            <Text style={styles.footerVersion}>v{CURRENT_APP_VERSION} • 100% Offline SQLite Engine</Text>
          </View>
        </ScrollView>

        {/* Edit Name Modal */}
        <ModalWrapper
          visible={showEditName}
          onClose={() => setShowEditName(false)}
          title="Edit Display Name"
          subtitle="Update your workspace username"
        >
          <Input
            label="Your Name"
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Enter your name"
            autoFocus
          />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <Button title="Cancel" variant="secondary" onPress={() => setShowEditName(false)} style={{ flex: 1 }} />
            <Button title="Save Name" variant="primary" onPress={handleSaveName} style={{ flex: 1 }} />
          </View>
        </ModalWrapper>

        {/* Security & Privacy Modal */}
        <SecuritySettingsModal visible={showSecurityModal} onClose={() => setShowSecurityModal(false)} />

        {/* Theme Selector Modal */}
        <ThemeSelectorModal
          visible={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          currentTheme={theme}
          onSelectTheme={newTheme => {
            setTheme(newTheme);
            updateSettings({ theme: newTheme });
          }}
        />

        {/* Backup & Restore Modal */}
        <BackupRestoreModal visible={showBackupModal} onClose={() => setShowBackupModal(false)} />

        {/* About Modal */}
        <AboutModal visible={showAboutModal} onClose={() => setShowAboutModal(false)} />

        {/* App Preferences & Alarms Modal */}
        <ModalWrapper
          visible={showAppSettingsModal}
          onClose={() => setShowAppSettingsModal(false)}
          title="Alarms & Preferences"
          subtitle="Configure system alarms, ringtones, and alerts"
        >
          <View style={{ gap: 18, paddingVertical: 8 }}>
            {/* Notification Toggle */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 15, fontWeight: '600', color: colors.text }}>
                  System Notifications & Alarms
                </Text>
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 12, color: colors.textMuted }}>
                  High-priority alerts in Android notification center & lockscreen
                </Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={val => updateSettings({ notificationsEnabled: val })}
                trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Haptic Feedback Toggle */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 15, fontWeight: '600', color: colors.text }}>
                  Haptic Feedback
                </Text>
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 12, color: colors.textMuted }}>
                  Tactile vibration on interactions
                </Text>
              </View>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={val => updateSettings({ hapticFeedback: val })}
                trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Alarm Ringtone Selector */}
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontFamily: 'SF Pro Display', fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                Offline Alarm Ringtone
              </Text>
              <Text style={{ fontFamily: 'SF Pro Display', fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
                Select offline sound tone for scheduled task and event alerts
              </Text>

              <View style={styles.ringtoneGrid}>
                {RINGTONE_OPTIONS.map(opt => {
                  const isSelected = (settings.reminderSound || 'default') === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.ringtoneItem, isSelected && styles.ringtoneItemActive]}
                      onPress={async () => {
                        await updateSettings({ reminderSound: opt.id });
                        handleTestSound(opt.id, opt.name);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.ringtoneItemLeft}>
                        <Ionicons
                          name={opt.icon as any}
                          size={18}
                          color={isSelected ? colors.primaryLight : colors.textMuted}
                        />
                        <Text style={[styles.ringtoneItemText, isSelected && styles.ringtoneItemTextActive]}>
                          {opt.name}
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={isSelected ? colors.primary : colors.textMuted}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Test Alert Sound Button */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 14,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: `${colors.primary}25`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}50`,
                }}
                onPress={() => {
                  const currentOpt = RINGTONE_OPTIONS.find(o => o.id === (settings.reminderSound || 'default'));
                  handleTestSound(currentOpt?.id || 'default', currentOpt?.name || 'Default Alarm');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="volume-high" size={18} color={colors.primaryLight} />
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 13, fontWeight: '700', color: colors.primaryLight }}>
                  {isTestingSound ? 'Playing Tone & Notification...' : 'Play Ringtone & Show Notification'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ModalWrapper>

        {/* Global Custom Alert Dialog */}
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
