import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { NoteItem } from '../../types';
import { formatDatePretty } from '../../utils';
import { ModalWrapper } from '../common/ModalWrapper';
import { Button } from '../common/Button';

interface NoteDetailsModalProps {
  visible: boolean;
  note: NoteItem | null;
  onClose: () => void;
  onEdit: (note: NoteItem) => void;
  onDelete: (id: string) => void;
  onTogglePin?: (id: string) => void;
}

export const NoteDetailsModal: React.FC<NoteDetailsModalProps> = ({
  visible,
  note,
  onClose,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(`${note.title}\n\n${note.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy note error:', e);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: note.title,
        message: `📝 ${note.title}\n🏷️ ${note.category}\n\n${note.content}\n\nShared via AgendaX Notepad`,
      });
    } catch (e) {
      console.warn('Share note error:', e);
    }
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} title="Note Overview">
      {/* Header Card */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderLeftColor: note.color || colors.primary,
          },
        ]}
      >
        <View style={styles.topMeta}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: `${note.color || colors.primary}20`, borderColor: `${note.color || colors.primary}40` },
            ]}
          >
            <Text style={[styles.categoryText, { color: note.color || colors.primaryLight }]}>
              {note.category}
            </Text>
          </View>

          {note.pinned && (
            <View style={[styles.pinnedBadge, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="pin" size={12} color={colors.primaryLight} />
              <Text style={[styles.pinnedText, { color: colors.primaryLight }]}>Pinned</Text>
            </View>
          )}

          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {formatDatePretty(note.updatedAt.split('T')[0])}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{note.title}</Text>
      </View>

      {/* Note Content Box */}
      <ScrollView
        style={[styles.contentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
        contentContainerStyle={{ padding: Spacing.md }}
        showsVerticalScrollIndicator={true}
      >
        <Text style={[styles.contentText, { color: colors.text }]}>{note.content}</Text>
      </ScrollView>

      {/* Primary Action Buttons (Share, Copy, Pin) */}
      <View style={styles.actionsGrid}>
        <Button
          title={copied ? 'Copied!' : 'Copy'}
          variant="secondary"
          icon={copied ? 'checkmark' : 'copy-outline'}
          onPress={handleCopy}
          style={{ flex: 1, marginRight: 6 }}
        />
        <Button
          title="Share"
          variant="secondary"
          icon="share-social-outline"
          onPress={handleShare}
          style={{ flex: 1, marginHorizontal: 6 }}
        />
        {onTogglePin && (
          <Button
            title={note.pinned ? 'Unpin' : 'Pin'}
            variant="secondary"
            icon={note.pinned ? 'pin' : 'pin-outline'}
            onPress={() => onTogglePin(note.id)}
            style={{ flex: 1, marginLeft: 6 }}
          />
        )}
      </View>

      {/* Edit and Delete Buttons */}
      <View style={[styles.actionsGrid, { marginTop: Spacing.sm }]}>
        <Button
          title="Edit Note"
          variant="primary"
          icon="create-outline"
          onPress={() => {
            onClose();
            onEdit(note);
          }}
          style={{ flex: 1, marginRight: 6 }}
        />
        <Button
          title="Delete"
          variant="danger"
          icon="trash-outline"
          onPress={() => {
            onClose();
            onDelete(note.id);
          }}
          style={{ flex: 1, marginLeft: 6 }}
        />
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
  },
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  pinnedText: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  dateText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginLeft: 'auto',
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.heavy,
    letterSpacing: -0.3,
  },
  contentBox: {
    maxHeight: 260,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  contentText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm + 1,
    lineHeight: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
