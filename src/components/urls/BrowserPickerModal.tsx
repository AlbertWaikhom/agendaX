import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { BrowserService, BrowserOption, BROWSER_OPTIONS } from '../../services/browserService';
import { getDomain } from '../../utils';

interface BrowserPickerModalProps {
  visible: boolean;
  targetUrl: string;
  onClose: () => void;
  onSelect: (browserId: string, isAlways: boolean) => void;
}

export const BrowserPickerModal: React.FC<BrowserPickerModalProps> = ({
  visible,
  targetUrl,
  onClose,
  onSelect,
}) => {
  const { colors } = useTheme();
  const [browsers, setBrowsers] = useState<BrowserOption[]>(BROWSER_OPTIONS);
  const [selectedBrowserId, setSelectedBrowserId] = useState<string>('system');

  useEffect(() => {
    if (visible) {
      BrowserService.getAvailableBrowsers().then(list => {
        setBrowsers(list);
        if (list.length > 0) {
          setSelectedBrowserId(list[0].id);
        }
      });
    }
  }, [visible]);

  if (!visible) return null;

  const domain = getDomain(targetUrl);

  const handleJustOnce = () => {
    onSelect(selectedBrowserId, false);
  };

  const handleAlways = () => {
    onSelect(selectedBrowserId, true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.glassBorder,
              borderTopColor: colors.glassSpecular,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="compass-outline" size={22} color={colors.primaryLight} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>Open with Browser</Text>
              <Text style={[styles.subtitle, { color: colors.accentBlue }]} numberOfLines={1}>
                {domain || targetUrl}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Browser List */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            Choose an app to open this link:
          </Text>

          <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
            {browsers.map(b => {
              const active = selectedBrowserId === b.id;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.browserRow,
                    {
                      backgroundColor: active ? `${colors.primary}15` : colors.glassCard,
                      borderColor: active ? colors.primaryLight : colors.glassBorder,
                    },
                  ]}
                  onPress={() => setSelectedBrowserId(b.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.browserIconBox, { backgroundColor: `${b.color}20` }]}>
                    <Ionicons name={b.icon} size={20} color={b.color} />
                  </View>
                  <Text style={[styles.browserName, { color: colors.text }]}>{b.name}</Text>
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={active ? colors.primaryLight : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Action Buttons: Just Once vs Always */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.btn, styles.justOnceBtn, { borderColor: colors.border }]}
              onPress={handleJustOnce}
              activeOpacity={0.8}
            >
              <Text style={[styles.justOnceText, { color: colors.text }]}>Just Once</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.alwaysBtn, { backgroundColor: colors.primary }]}
              onPress={handleAlways}
              activeOpacity={0.8}
            >
              <Text style={styles.alwaysText}>Always</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  subtitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  listScroll: {
    maxHeight: 250,
    marginBottom: Spacing.md,
  },
  browserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 8,
  },
  browserIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  browserName: {
    flex: 1,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.xs,
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  justOnceBtn: {
    borderWidth: 1,
  },
  justOnceText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  alwaysBtn: {},
  alwaysText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
