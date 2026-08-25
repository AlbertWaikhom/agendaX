import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { CategoryPill } from '../common/Badge';
import { UrlItem } from '../../types';
import { getDomain, formatDatePretty } from '../../utils';

interface UrlCardProps {
  item: UrlItem;
  onEdit: () => void;
  onDelete: () => void;
}

export const UrlCard: React.FC<UrlCardProps> = ({ item, onEdit, onDelete }) => {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);
  const domain = getDomain(item.url);

  const handleOpen = () => {
    Linking.openURL(item.url).catch(e => console.warn('Cannot open URL:', e));
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy error:', e);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.glassCard,
          borderColor: colors.glassBorder,
          borderTopColor: colors.glassSpecular,
        },
      ]}
    >
      <View style={styles.topRow}>
        {/* Favicon / Link Icon */}
        <TouchableOpacity
          onPress={handleOpen}
          style={[styles.iconCircle, { backgroundColor: `${colors.primaryLight}20`, borderColor: `${colors.primaryLight}40` }]}
        >
          <Ionicons name="globe-outline" size={20} color={colors.primaryLight} />
        </TouchableOpacity>

        {/* Title & Domain */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={handleOpen} style={styles.domainRow} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
            <Text style={[styles.domainText, { color: colors.accentBlue }]} numberOfLines={1}>
              {domain}
            </Text>
            <Ionicons name="open-outline" size={12} color={colors.accentBlue} style={styles.openIcon} />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={handleCopy}
            style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={16}
              color={copied ? colors.success : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onEdit}
            style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={[styles.actionBtn, { backgroundColor: colors.errorBg }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Note */}
      {item.note ? (
        <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.note}
        </Text>
      ) : null}

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <CategoryPill label={item.category} color={colors.accentCyan} />
        <Text style={[styles.dateText, { color: colors.textMuted }]}>
          Added {formatDatePretty(item.createdAt.split('T')[0])}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    borderWidth: 1,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -0.2,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  domainText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  openIcon: {
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  dateText: {
    fontFamily: Typography.fontFamily,
    fontSize: 11,
  },
});
