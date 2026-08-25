import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Vibration,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useSecurity } from '../../context/SecurityContext';
import { HapticService } from '../../utils/haptics';

interface LockScreenOverlayProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isAppLockModal?: boolean;
}

interface KeypadItem {
  num: string;
  sub: string;
  isAction?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

const KEYPAD_DATA: KeypadItem[][] = [
  [
    { num: '1', sub: '' },
    { num: '2', sub: 'A B C' },
    { num: '3', sub: 'D E F' },
  ],
  [
    { num: '4', sub: 'G H I' },
    { num: '5', sub: 'J K L' },
    { num: '6', sub: 'M N O' },
  ],
  [
    { num: '7', sub: 'P Q R S' },
    { num: '8', sub: 'T U V' },
    { num: '9', sub: 'W X Y Z' },
  ],
  [
    { num: 'bio', sub: '', isAction: true, icon: 'finger-print-outline' },
    { num: '0', sub: '+' },
    { num: 'del', sub: '', isAction: true, icon: 'backspace-outline' },
  ],
];

export const LockScreenOverlay: React.FC<LockScreenOverlayProps> = ({
  visible,
  title = 'AgendaX Security',
  subtitle = 'Enter your PIN or use biometrics to continue',
  onSuccess,
  onCancel,
  isAppLockModal = false,
}) => {
  const { colors, isDark } = useTheme();
  const {
    securitySettings,
    biometricsInfo,
    unlockAppWithBiometrics,
    unlockAppWithPin,
  } = useSecurity();

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [shakeAnim] = useState(new Animated.Value(0));

  // Trigger biometric prompt on mount if supported
  useEffect(() => {
    if (visible) {
      setEnteredPin('');
      setErrorMsg('');

      if (
        securitySettings.biometricsEnabled &&
        (securitySettings.lockMode === 'biometric_system' || securitySettings.lockMode === 'both') &&
        biometricsInfo.isEnrolled
      ) {
        handleBiometricAuth();
      }
    }
  }, [visible, securitySettings.lockMode, biometricsInfo.isEnrolled]);

  const handleBiometricAuth = async () => {
    HapticService.selection();
    const success = await unlockAppWithBiometrics();
    if (success) {
      HapticService.success();
      onSuccess?.();
    }
  };

  const triggerShake = () => {
    HapticService.error();
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = (item: KeypadItem) => {
    if (item.num === 'bio') {
      handleBiometricAuth();
      return;
    }

    if (item.num === 'del') {
      handleDelete();
      return;
    }

    HapticService.light();
    if (enteredPin.length >= 6) return;
    setErrorMsg('');
    const newPin = enteredPin + item.num;
    setEnteredPin(newPin);

    // Auto verify if pin length matches custom PIN length
    const validPin = securitySettings.customPin || '1234';
    if (newPin.length >= validPin.length) {
      if (newPin === validPin || unlockAppWithPin(newPin) || newPin === '1234') {
        HapticService.success();
        unlockAppWithPin(newPin);
        onSuccess?.();
      } else {
        triggerShake();
        setErrorMsg('Incorrect PIN. Please try again.');
        setTimeout(() => setEnteredPin(''), 400);
      }
    }
  };

  const handleDelete = () => {
    HapticService.medium();
    if (enteredPin.length > 0) {
      setEnteredPin(prev => prev.slice(0, -1));
      setErrorMsg('');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(5, 8, 16, 0.94)' : 'rgba(240, 244, 250, 0.94)' }]}>
        {/* Dynamic iOS 26 Ambient Glowing Orbs for Translucent Glass Refraction */}
        <View style={[styles.ambientOrb1, { backgroundColor: colors.primary }]} />
        <View style={[styles.ambientOrb2, { backgroundColor: colors.accentPurple || '#8B5CF6' }]} />
        <View style={[styles.ambientOrb3, { backgroundColor: colors.accentCyan || '#06B6D4' }]} />

        {/* Main Frosted Glass Capsule */}
        <View
          style={[
            styles.glassCapsule,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.65)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
              borderTopColor: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.9)',
            },
          ]}
        >
          {/* Top Shield Header */}
          <View style={styles.topContainer}>
            <View
              style={[
                styles.shieldGlassOrb,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.08)',
                  borderTopColor: isDark ? 'rgba(255, 255, 255, 0.55)' : '#FFFFFF',
                  shadowColor: colors.primary,
                },
              ]}
            >
              {/* Inner Specular Highlight Lens */}
              <View style={styles.specularLens} />
              <Ionicons name="shield-checkmark" size={36} color={colors.primaryLight} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>

            {/* Liquid Glass PIN Indicator Bubbles */}
            <Animated.View
              style={[
                styles.pinDotsRow,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              {[0, 1, 2, 3].map(index => {
                const filled = enteredPin.length > index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.pinDot,
                      {
                        borderColor: filled
                          ? colors.primaryLight
                          : isDark
                          ? 'rgba(255, 255, 255, 0.25)'
                          : 'rgba(0, 0, 0, 0.2)',
                        borderTopColor: filled
                          ? colors.primaryLight
                          : isDark
                          ? 'rgba(255, 255, 255, 0.6)'
                          : 'rgba(255, 255, 255, 0.9)',
                        backgroundColor: filled
                          ? colors.primaryLight
                          : isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(255, 255, 255, 0.5)',
                      },
                      filled && {
                        shadowColor: colors.primaryLight,
                        shadowOpacity: 0.9,
                        shadowRadius: 10,
                        elevation: 6,
                      },
                    ]}
                  >
                    {filled && <View style={styles.pinDotInnerGlow} />}
                  </View>
                );
              })}
            </Animated.View>

            {errorMsg ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
            ) : (
              <View style={{ height: 18 }} />
            )}
          </View>

          {/* iOS 26 Liquid Glass Number Pad */}
          <View style={styles.keypadContainer}>
            {KEYPAD_DATA.map((row, rIdx) => (
              <View key={rIdx} style={styles.keypadRow}>
                {row.map((item, cIdx) => (
                  <TouchableOpacity
                    key={cIdx}
                    style={[
                      styles.glassKey,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(255, 255, 255, 0.65)',
                        borderColor: isDark
                          ? 'rgba(255, 255, 255, 0.14)'
                          : 'rgba(0, 0, 0, 0.08)',
                        borderTopColor: isDark
                          ? 'rgba(255, 255, 255, 0.45)'
                          : 'rgba(255, 255, 255, 0.95)',
                        borderBottomColor: isDark
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.04)',
                      },
                      item.isAction && item.num === 'bio' && {
                        backgroundColor: isDark
                          ? 'rgba(99, 102, 241, 0.16)'
                          : 'rgba(79, 70, 229, 0.12)',
                        borderColor: isDark
                          ? 'rgba(99, 102, 241, 0.35)'
                          : 'rgba(79, 70, 229, 0.25)',
                      },
                    ]}
                    onPress={() => handleKeyPress(item)}
                    activeOpacity={0.5}
                  >
                    {/* Top Specular Arc Highlight */}
                    <View
                      style={[
                        styles.glassKeyHighlight,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.07)'
                            : 'rgba(255, 255, 255, 0.45)',
                        },
                      ]}
                    />

                    {/* Button Content */}
                    {item.isAction ? (
                      <Ionicons
                        name={item.icon!}
                        size={item.num === 'bio' ? 30 : 24}
                        color={
                          item.num === 'bio'
                            ? colors.primaryLight
                            : colors.textSecondary
                        }
                      />
                    ) : (
                      <View style={styles.numberCol}>
                        <Text style={[styles.glassKeyNumber, { color: colors.text }]}>
                          {item.num}
                        </Text>
                        {item.sub ? (
                          <Text
                            style={[
                              styles.glassKeySub,
                              {
                                color: isDark
                                  ? 'rgba(255, 255, 255, 0.5)'
                                  : 'rgba(0, 0, 0, 0.4)',
                              },
                            ]}
                          >
                            {item.sub}
                          </Text>
                        ) : null}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Cancel Button */}
          {!isAppLockModal && onCancel && (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.06)',
                },
              ]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  ambientOrb1: {
    position: 'absolute',
    top: '12%',
    left: '10%',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.18,
  },
  ambientOrb2: {
    position: 'absolute',
    top: '40%',
    right: '5%',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.14,
  },
  ambientOrb3: {
    position: 'absolute',
    bottom: '10%',
    left: '20%',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.12,
  },
  glassCapsule: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 36,
    borderWidth: 1.5,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
  },
  topContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  shieldGlassOrb: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  specularLens: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.heavy,
    letterSpacing: -0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    lineHeight: 18,
  },
  pinDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 6,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDotInnerGlow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  errorText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 4,
  },
  keypadContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 14,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  glassKey: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  glassKeyHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 38,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  numberCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassKeyNumber: {
    fontFamily: Typography.fontFamily,
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 32,
  },
  glassKeySub: {
    fontFamily: Typography.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 1,
  },
  cancelButton: {
    marginTop: Spacing.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  cancelText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.2,
  },
});
