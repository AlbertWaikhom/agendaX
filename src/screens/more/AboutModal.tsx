import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { ModalWrapper } from '../../components/common/ModalWrapper';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(e => console.warn('Cannot open URL:', e));
  };

  return (
    <ModalWrapper visible={visible} onClose={onClose} title="About AgendaX">
      <View style={styles.header}>
        <Image
          source={require('../../../assets/product-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[styles.tagline, { color: colors.primaryLight }]}>Plan. Track. Achieve.</Text>
        <Text style={[styles.version, { color: colors.textMuted }]}>Version 1.01 • Production Release</Text>
      </View>

      {/* Developer Profile Card */}
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
        <View style={styles.devHeaderRow}>
          <View style={[styles.devIconBox, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="code-slash" size={20} color={colors.primaryLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.devLabel, { color: colors.textMuted }]}>DEVELOPED BY</Text>
            <Text style={[styles.devName, { color: colors.text }]}>Waikhom Albert Mangang</Text>
          </View>
        </View>

        {/* Social Links Row */}
        <View style={styles.socialButtonsRow}>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: `${colors.surfaceHighlight}`, borderColor: colors.glassBorder }]}
            onPress={() => handleOpenLink('https://github.com/AlbertWaikhom/')}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-github" size={18} color={colors.text} />
            <Text style={[styles.socialBtnText, { color: colors.text }]}>GitHub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: '#0077B520', borderColor: '#0077B550' }]}
            onPress={() => handleOpenLink('https://www.linkedin.com/in/waikhom-albert-mangang-9b4362246/')}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-linkedin" size={18} color="#0077B5" />
            <Text style={[styles.socialBtnText, { color: '#0077B5' }]}>LinkedIn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: '#E1306C20', borderColor: '#E1306C50' }]}
            onPress={() => handleOpenLink('https://www.instagram.com/albert_waikhom/')}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-instagram" size={18} color="#E1306C" />
            <Text style={[styles.socialBtnText, { color: '#E1306C' }]}>Instagram</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Privacy & Architecture */}
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Architecture</Text>
        <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
          AgendaX is engineered with a strict <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>Local-First</Text> architecture.
          {'\n\n'}
          • Zero remote server or cloud database dependency.{'\n'}
          • 100% of your tasks, events, expenses, and URLs are kept in isolated local JSON storage on this device.{'\n'}
          • Biometric, fingerprint, face ID, and custom PIN security protection.{'\n'}
          • Full JSON data export and restore capability anytime.
        </Text>
      </View>

      {/* Core Modules */}
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Core Features</Text>
        <View style={styles.bulletRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
            Task Manager with priorities, categories, and reminders
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Ionicons name="calendar" size={16} color={colors.accentPurple} />
          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
            Interactive Calendar Strip with Event Inspector
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Ionicons name="wallet" size={16} color={colors.accentEmerald} />
          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
            Monthly Expenses with 6-Month Comparison Graphs
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Ionicons name="link" size={16} color={colors.accentCyan} />
          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
            Important Link Vault with clipboard integration
          </Text>
        </View>
        <View style={styles.bulletRow}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
            Biometrics & Page-wise PIN Security Locks
          </Text>
        </View>
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoImage: {
    width: 220,
    height: 60,
    marginBottom: 4,
  },
  tagline: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 1,
    marginTop: 2,
  },
  version: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginTop: 4,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  devHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  devIconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  devName: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.heavy,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  socialBtnText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 8,
  },
  sectionBody: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  bulletText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.xs,
    marginLeft: 8,
    flex: 1,
  },
});
