import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useSecurity } from '../../context/SecurityContext';

interface PageLockGuardProps {
  pageId: string;
  pageTitle: string;
  children: React.ReactNode;
}

export const PageLockGuard: React.FC<PageLockGuardProps> = ({
  pageId,
  pageTitle,
  children,
}) => {
  const { colors } = useTheme();
  const { isPageLocked, requestPageUnlock } = useSecurity();

  const locked = isPageLocked(pageId);

  if (!locked) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.lockCard,
          {
            backgroundColor: colors.glassCard,
            borderColor: colors.glassBorder,
            borderTopColor: colors.glassSpecular,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20`, borderColor: colors.glassBorderHighlight }]}>
          <Ionicons name="lock-closed" size={36} color={colors.primaryLight} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{pageTitle} is Locked</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          This section is protected with your security settings. Tap below to authenticate with Fingerprint, Face ID, or PIN.
        </Text>

        <TouchableOpacity
          style={[
            styles.unlockButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
          onPress={() => requestPageUnlock(pageId, pageTitle)}
          activeOpacity={0.8}
        >
          <Ionicons name="finger-print-outline" size={20} color="#FFFFFF" />
          <Text style={styles.unlockButtonText}>Unlock {pageTitle}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  lockCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.heavy,
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xxl,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 50,
    borderRadius: BorderRadius.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  unlockButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
