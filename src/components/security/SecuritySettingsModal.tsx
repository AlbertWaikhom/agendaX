import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useSecurity } from '../../context/SecurityContext';
import { LockMode } from '../../types';
import { Input } from '../common/Input';

interface SecuritySettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const {
    securitySettings,
    biometricsInfo,
    updateSecuritySettings,
    setCustomPin,
    removeCustomPin,
    togglePageLock,
  } = useSecurity();

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [pinError, setPinError] = useState('');

  const handleSavePin = async () => {
    if (pinInput.length < 4 || pinInput.length > 6) {
      setPinError('PIN must be 4 to 6 digits');
      return;
    }
    if (pinInput !== pinConfirmInput) {
      setPinError('PINs do not match');
      return;
    }

    await setCustomPin(pinInput);
    setPinInput('');
    setPinConfirmInput('');
    setPinError('');
    setShowPinSetup(false);
    Alert.alert('Success', 'Custom App PIN has been set successfully.');
  };

  const handleRemovePin = () => {
    Alert.alert('Remove PIN', 'Are you sure you want to remove your custom App PIN?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeCustomPin();
          if (securitySettings.lockMode === 'custom_pin') {
            await updateSecuritySettings({ lockMode: 'biometric_system' });
          }
        },
      },
    ]);
  };

  const lockModes: { id: LockMode; title: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
      id: 'biometric_system',
      title: 'System Lock / Biometrics',
      desc: biometricsInfo.types.length > 0 ? `Use ${biometricsInfo.types.join(', ')}` : 'Use Android Screen Lock',
      icon: 'finger-print-outline',
    },
    {
      id: 'custom_pin',
      title: 'Manual Custom PIN',
      desc: 'Set a passcode different from your device lock',
      icon: 'keypad-outline',
    },
    {
      id: 'both',
      title: 'Biometrics + PIN Fallback',
      desc: 'Prompt Fingerprint/Face ID with manual PIN fallback',
      icon: 'shield-checkmark-outline',
    },
  ];

  const protectablePages: { id: string; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'Settings', title: 'Settings & Security', icon: 'settings-outline' },
    { id: 'Expenses', title: 'Monthly Expenses', icon: 'wallet-outline' },
    { id: 'Urls', title: 'Important Links & Workspaces', icon: 'link-outline' },
    { id: 'Tasks', title: 'Tasks & Schedule', icon: 'checkbox-outline' },
    { id: 'Events', title: 'Calendar Events', icon: 'calendar-outline' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.contentCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.glassBorder,
              borderTopColor: colors.glassSpecular,
            },
          ]}
        >
          {/* Top Bar Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="lock-closed" size={20} color={colors.primaryLight} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Security & Privacy</Text>
                <Text style={[styles.headerSub, { color: colors.textMuted }]}>
                  Biometrics, System Lock & Page Locks
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceHighlight }]}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Biometric Hardware Status Card */}
            <View
              style={[
                styles.infoBadge,
                {
                  backgroundColor: biometricsInfo.hasHardware ? `${colors.accentEmerald}15` : `${colors.error}15`,
                  borderColor: biometricsInfo.hasHardware ? `${colors.accentEmerald}40` : `${colors.error}40`,
                },
              ]}
            >
              <Ionicons
                name={biometricsInfo.hasHardware ? 'shield-checkmark' : 'alert-circle-outline'}
                size={20}
                color={biometricsInfo.hasHardware ? colors.accentEmerald : colors.error}
              />
              <Text
                style={[
                  styles.infoBadgeText,
                  { color: biometricsInfo.hasHardware ? colors.accentEmerald : colors.error },
                ]}
              >
                {biometricsInfo.hasHardware
                  ? `Hardware Ready: ${biometricsInfo.types.join(', ')} Supported`
                  : 'Biometric hardware unavailable on this device'}
              </Text>
            </View>

            {/* Whole App Lock Toggle */}
            <View
              style={[
                styles.settingRow,
                { backgroundColor: colors.glassCard, borderColor: colors.glassBorder },
              ]}
            >
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Full App Lock</Text>
                <Text style={[styles.settingDesc, { color: colors.textMuted }]}>
                  Require authentication whenever AgendaX is opened
                </Text>
              </View>
              <Switch
                value={securitySettings.appLockEnabled}
                onValueChange={val => updateSecuritySettings({ appLockEnabled: val })}
                thumbColor="#FFFFFF"
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {/* Lock Mode Selector */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Authentication Method
            </Text>

            {lockModes.map(mode => {
              const active = securitySettings.lockMode === mode.id;
              return (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modeCard,
                    {
                      backgroundColor: colors.glassCard,
                      borderColor: active ? colors.primaryLight : colors.glassBorder,
                      borderTopColor: active ? colors.primaryLight : colors.glassSpecular,
                    },
                    active && { backgroundColor: `${colors.primary}12` },
                  ]}
                  onPress={() => updateSecuritySettings({ lockMode: mode.id })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.modeIconBox, { backgroundColor: `${colors.primary}20` }]}>
                    <Ionicons name={mode.icon} size={22} color={colors.primaryLight} />
                  </View>
                  <View style={styles.modeTextCol}>
                    <Text style={[styles.modeTitle, { color: colors.text }]}>{mode.title}</Text>
                    <Text style={[styles.modeDesc, { color: colors.textMuted }]}>{mode.desc}</Text>
                  </View>
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={active ? colors.primaryLight : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}

            {/* Custom PIN Section */}
            {(securitySettings.lockMode === 'custom_pin' || securitySettings.lockMode === 'both') && (
              <View
                style={[
                  styles.pinConfigCard,
                  { backgroundColor: colors.glassCard, borderColor: colors.glassBorder },
                ]}
              >
                <View style={styles.pinConfigHeader}>
                  <View>
                    <Text style={[styles.pinConfigTitle, { color: colors.text }]}>Custom App Passcode</Text>
                    <Text style={[styles.pinConfigSub, { color: colors.textMuted }]}>
                      {securitySettings.customPin ? 'PIN is configured (4-6 digits)' : 'No manual PIN configured yet'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.pinActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => setShowPinSetup(true)}
                  >
                    <Text style={styles.pinActionBtnText}>
                      {securitySettings.customPin ? 'Change PIN' : 'Set PIN'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {securitySettings.customPin && (
                  <TouchableOpacity onPress={handleRemovePin} style={styles.removePinBtn}>
                    <Ionicons name="trash-outline" size={14} color={colors.error} />
                    <Text style={[styles.removePinText, { color: colors.error }]}>Remove Custom PIN</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Page-wise Lock Guardians */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Page-wise Lock (Protect Specific Sections)
            </Text>

            {protectablePages.map(page => {
              const isLocked = securitySettings.lockedPages.includes(page.id);
              return (
                <View
                  key={page.id}
                  style={[
                    styles.pageLockRow,
                    { backgroundColor: colors.glassCard, borderColor: colors.glassBorder },
                  ]}
                >
                  <View style={styles.pageLockLeft}>
                    <View style={[styles.pageLockIconBox, { backgroundColor: `${colors.primary}20` }]}>
                      <Ionicons name={page.icon} size={18} color={colors.primaryLight} />
                    </View>
                    <Text style={[styles.pageLockTitle, { color: colors.text }]}>{page.title}</Text>
                  </View>

                  <Switch
                    value={isLocked}
                    onValueChange={val => togglePageLock(page.id, val)}
                    thumbColor="#FFFFFF"
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Nested PIN Setup Sub-Modal */}
        {showPinSetup && (
          <Modal visible={showPinSetup} transparent animationType="fade">
            <View style={styles.subModalContainer}>
              <View
                style={[
                  styles.subModalCard,
                  { backgroundColor: colors.surface, borderColor: colors.glassBorder },
                ]}
              >
                <Text style={[styles.subModalTitle, { color: colors.text }]}>Set Custom App PIN</Text>
                <Text style={[styles.subModalDesc, { color: colors.textMuted }]}>
                  Enter a 4-6 digit numeric passcode to protect your workspace
                </Text>

                <Input
                  placeholder="Enter 4-6 digit PIN"
                  value={pinInput}
                  onChangeText={setPinInput}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={6}
                  icon="keypad-outline"
                />

                <Input
                  placeholder="Confirm PIN"
                  value={pinConfirmInput}
                  onChangeText={setPinConfirmInput}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={6}
                  icon="checkmark-circle-outline"
                  error={pinError}
                />

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                    onPress={() => {
                      setShowPinSetup(false);
                      setPinError('');
                    }}
                  >
                    <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSavePin}
                  >
                    <Text style={styles.modalSaveText}>Save PIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  contentCard: {
    maxHeight: '90%',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderWidth: 1,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.heavy,
  },
  headerSub: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: 40,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  infoBadgeText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  settingDesc: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.heavy,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  modeIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  modeTextCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  modeTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  modeDesc: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  pinConfigCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginVertical: Spacing.sm,
  },
  pinConfigHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pinConfigTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  pinConfigSub: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  pinActionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  pinActionBtnText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  removePinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  removePinText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  pageLockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  pageLockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageLockIconBox: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageLockTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  subModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  subModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    borderWidth: 1,
  },
  subModalTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.heavy,
    marginBottom: 4,
    textAlign: 'center',
  },
  subModalDesc: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  modalSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
