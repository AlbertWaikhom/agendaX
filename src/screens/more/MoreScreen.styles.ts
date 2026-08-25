import { StyleSheet } from 'react-native';
import { ThemeColors, Typography, BorderRadius, Spacing } from '../../constants/theme';

export const createMoreStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: Spacing.xxxl,
    },
    header: {
      paddingVertical: Spacing.md,
      marginBottom: Spacing.sm,
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

    // User Profile Hero Glass Card
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.glassCard,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.glassBorderHighlight,
      marginBottom: Spacing.lg,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 14,
      elevation: 6,
    },
    avatarWrapper: {
      width: 54,
      height: 54,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.glassBorderHighlight,
      marginRight: Spacing.md,
    },
    avatarText: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.heavy,
      color: '#FFFFFF',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
    profileBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    workspaceId: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.xs,
      color: colors.primaryLight,
      fontWeight: Typography.fontWeight.semibold,
    },
    editNameBtn: {
      width: 36,
      height: 36,
      borderRadius: BorderRadius.sm,
      backgroundColor: colors.surfaceHighlight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Theme Switcher Section
    section: {
      marginBottom: Spacing.lg,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: Spacing.sm,
    },
    sectionTitle: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
    themesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    themeCard: {
      width: '48%',
      backgroundColor: colors.glassCard,
      borderRadius: BorderRadius.xl,
      padding: Spacing.md,
      borderWidth: 1.5,
      borderColor: colors.glassBorder,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    },
    themeCardActive: {
      borderColor: colors.primaryLight,
      backgroundColor: colors.surfaceHighlight,
    },
    themePreviewBox: {
      width: '100%',
      height: 48,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.sm,
      flexDirection: 'row',
      padding: 6,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    themeDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    themeName: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
    themeActiveTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    themeActiveText: {
      fontFamily: Typography.fontFamily,
      fontSize: 10,
      fontWeight: '700',
      color: colors.primaryLight,
    },

    // Settings Menu Rows
    menuGroup: {
      backgroundColor: colors.glassCard,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: 'hidden',
      marginBottom: Spacing.lg,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md + 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuIconBox: {
      width: 36,
      height: 36,
      borderRadius: BorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuTitle: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text,
    },
    menuSubtitle: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.xs,
      color: colors.textMuted,
      marginTop: 1,
    },

    // Version Footer
    footer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
    },
    footerAppTitle: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textSecondary,
    },
    footerTagline: {
      fontFamily: Typography.fontFamily,
      fontSize: Typography.fontSize.xs,
      color: colors.primaryLight,
      marginTop: 2,
    },
    footerVersion: {
      fontFamily: Typography.fontFamily,
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 4,
    },
  });
