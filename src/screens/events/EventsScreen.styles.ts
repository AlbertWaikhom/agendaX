import { StyleSheet } from 'react-native';
import { ThemeColors, Typography, BorderRadius, Spacing } from '../../constants/theme';

export const createEventsStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
    },
    headerTitle: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.xxl,
      fontWeight: Typography.fontWeight.heavy,
      color: colors.text,
      letterSpacing: -0.4,
    },
    headerSubtitle: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.xs,
      color: colors.textMuted,
      marginTop: 2,
    },
    viewModeToggle: {
      flexDirection: 'row',
      backgroundColor: colors.glassCard,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: BorderRadius.lg,
      padding: 4,
      marginBottom: Spacing.md,
    },
    viewModeBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: BorderRadius.md,
    },
    viewModeBtnActive: {
      backgroundColor: colors.primary,
    },
    viewModeText: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.textSecondary,
    },
    viewModeTextActive: {
      color: '#FFFFFF',
    },
    listContent: {
      paddingBottom: 90,
    },
    emptyContainer: {
      backgroundColor: colors.glassCard,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xxxl,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.glassBorder,
      marginTop: Spacing.xl,
    },
    emptyIcon: {
      marginBottom: Spacing.md,
    },
    emptyTitle: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
      textAlign: 'center',
    },
    emptySub: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.sm,
      color: colors.textMuted,
      marginTop: 4,
      textAlign: 'center',
    },
  });
