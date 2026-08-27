import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
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
import { SecuritySettingsModal } from '../../components/security/SecuritySettingsModal';
import { ThemeMode } from '../../types';
import { createMoreStyles } from './MoreScreen.styles';

const THEME_OPTIONS: { id: ThemeMode; name: string; bg: string; accent: string; previewCard: string }[] = [
  {
    id: 'dark',
    name: 'Liquid Dark',
    bg: '#070A12',
    accent: '#6366F1',
    previewCard: '#111827',
  },
  {
    id: 'light',
    name: 'Crystal Light',
    bg: '#F8FAFC',
    accent: '#4F46E5',
    previewCard: '#FFFFFF',
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    bg: '#040711',
    accent: '#06B6D4',
    previewCard: '#0B132B',
  },
  {
    id: 'sunset',
    name: 'Sunset Amber',
    bg: '#0D0806',
    accent: '#F97316',
    previewCard: '#20140F',
  },
];

export const MoreScreen: React.FC = () => {
  const { theme, colors, setTheme } = useTheme();
  const styles = useMemo(() => createMoreStyles(colors), [colors]);

  const {
    user,
    settings,
    updateUser,
    updateSettings,
    clearWorkspace,
  } = useWorkspace();

  const { securitySettings } = useSecurity();

  const [showEditName, setShowEditName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [copiedId, setCopiedId] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAppSettingsModal, setShowAppSettingsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

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

  const handleClearAllData = () => {
    Alert.alert(
      '🚨 WIPE ALL DATA',
      'This will permanently delete your local workspace, all tasks, events, expenses, and saved URLs.\n\nThis action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe Everything',
          style: 'destructive',
          onPress: async () => {
            await clearWorkspace();
          },
        },
      ]
    );
  };

  return (
    <PageContainer>
      <PageLockGuard pageId="Settings" pageTitle="Settings & Security">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Page Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Workspace & Settings</Text>
            <Text style={styles.headerSubtitle}>Customize themes, preferences, and security</Text>
          </View>

          {/* User Profile Glass Hero Card */}
          <View style={styles.profileCard}>
            <View style={[styles.avatarWrapper, { backgroundColor: user?.avatarColor || colors.primary }]}>
              <Text style={styles.avatarText}>
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>

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

          {/* Liquid Glass Theme Switcher Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="color-palette-outline" size={18} color={colors.primaryLight} />
              <Text style={styles.sectionTitle}>App Theme (iOS 26 Liquid Glass)</Text>
            </View>

            <View style={styles.themesGrid}>
              {THEME_OPTIONS.map(opt => {
                const isSelected = theme === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      setTheme(opt.id);
                      updateSettings({ theme: opt.id });
                    }}
                    style={[styles.themeCard, isSelected && styles.themeCardActive]}
                  >
                    <View style={[styles.themePreviewBox, { backgroundColor: opt.bg, borderColor: opt.accent, borderWidth: 1 }]}>
                      <View style={[styles.themeDot, { backgroundColor: opt.accent }]} />
                      <View style={[styles.themeDot, { backgroundColor: opt.previewCard }]} />
                    </View>
                    <Text style={styles.themeName}>{opt.name}</Text>
                    {isSelected && (
                      <View style={styles.themeActiveTag}>
                        <Ionicons name="checkmark-circle" size={12} color={colors.primaryLight} />
                        <Text style={styles.themeActiveText}>Active</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Security & Features Settings Group */}
          <View style={styles.menuGroup}>
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
                  <Text style={styles.menuTitle}>JSON Backup & Restore</Text>
                  <Text style={styles.menuSubtitle}>Export offline workspace or restore from file</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => setShowAppSettingsModal(true)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: `${colors.accentPurple}20` }]}>
                  <Ionicons name="options-outline" size={18} color={colors.accentPurple} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Preferences & Alerts</Text>
                  <Text style={styles.menuSubtitle}>Sound, badges, and notifications</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

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
                  <Text style={styles.menuTitle}>About agendax (AgendaX)</Text>
                  <Text style={styles.menuSubtitle}>Local architecture & developer info</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

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
                  <Text style={styles.menuSubtitle}>Permanently wipe all local device data</Text>
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
            <Text style={styles.footerAppTitle}>agendax</Text>
            <Text style={styles.footerTagline}>Plan. Track. Achieve.</Text>
            <Text style={styles.footerVersion}>v1.01 • 100% Offline Local Engine</Text>
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

        {/* Backup & Restore Modal */}
        <BackupRestoreModal visible={showBackupModal} onClose={() => setShowBackupModal(false)} />

        {/* About Modal */}
        <AboutModal visible={showAboutModal} onClose={() => setShowAboutModal(false)} />

        {/* App Preferences Modal */}
        <ModalWrapper
          visible={showAppSettingsModal}
          onClose={() => setShowAppSettingsModal(false)}
          title="Preferences"
          subtitle="Adjust local app options"
        >
          <View style={{ gap: 16, paddingVertical: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 15, fontWeight: '600', color: colors.text }}>
                  Notifications
                </Text>
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 12, color: colors.textMuted }}>
                  Allow local schedule alerts
                </Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={val => updateSettings({ notificationsEnabled: val })}
                trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 15, fontWeight: '600', color: colors.text }}>
                  Haptic Feedback
                </Text>
                <Text style={{ fontFamily: 'SF Pro Display', fontSize: 12, color: colors.textMuted }}>
                  Vibration on button presses
                </Text>
              </View>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={val => updateSettings({ hapticFeedback: val })}
                trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ModalWrapper>
      </PageLockGuard>
    </PageContainer>
  );
};
