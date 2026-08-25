import { StyleSheet } from 'react-native';
import { ThemeColors, Typography, BorderRadius, Spacing } from '../../constants/theme';

export const createNotificationsStyles = (colors: ThemeColors) =>
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
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.glassCard,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.heavy,
      color: colors.text,
      letterSpacing: -0.4,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerActionBtn: {
      paddingHorizontal: Spacing.sm + 2,
      paddingVertical: 6,
      borderRadius: BorderRadius.sm,
      backgroundColor: colors.surfaceHighlight,
    },
    headerActionText: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.primaryLight,
    },
    listContent: {
      paddingBottom: 40,
    },
    notifItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.glassCard,
      borderRadius: BorderRadius.xl,
      padding: Spacing.md + 2,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      marginBottom: Spacing.sm + 2,
      gap: 12,
    },
    notifItemUnread: {
      borderColor: colors.primaryLight,
      backgroundColor: colors.surfaceHighlight,
    },
    notifIconBox: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    notifContent: {
      flex: 1,
    },
    notifTitle: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
    notifMessage: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 18,
    },
    notifTime: {
      fontFamily: Typography.fontFamily,
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 4,
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
