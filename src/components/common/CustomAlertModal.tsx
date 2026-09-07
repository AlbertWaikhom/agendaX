import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive' | 'primary';
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  buttons?: AlertButton[];
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const CustomAlertModal: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  icon,
  iconColor,
  buttons = [{ text: 'OK', style: 'primary' }],
  onClose,
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.dialogCard,
                {
                  backgroundColor: colors.modalBackground,
                  borderColor: colors.glassBorder,
                  borderTopColor: colors.glassSpecular,
                },
              ]}
            >
              {/* Icon Header */}
              {!!icon && (
                <View
                  style={[
                    styles.iconWrapper,
                    {
                      backgroundColor: `${iconColor || colors.primary}20`,
                      borderColor: `${iconColor || colors.primary}40`,
                    },
                  ]}
                >
                  <Ionicons name={icon} size={28} color={iconColor || colors.primaryLight} />
                </View>
              )}

              {/* Title & Message */}
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              {message ? (
                <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {buttons.map((btn, index) => {
                  const isPrimary = btn.style === 'primary';
                  const isDestructive = btn.style === 'destructive';
                  const isCancel = btn.style === 'cancel';

                  let btnBg = colors.surfaceHighlight;
                  let textColor = colors.text;
                  let borderColor = colors.glassBorder;

                  if (isPrimary) {
                    btnBg = colors.primary;
                    textColor = '#FFFFFF';
                    borderColor = colors.primaryLight;
                  } else if (isDestructive) {
                    btnBg = colors.errorBg;
                    textColor = colors.error;
                    borderColor = `${colors.error}40`;
                  } else if (isCancel) {
                    btnBg = colors.surface;
                    textColor = colors.textMuted;
                  }

                  return (
                    <TouchableOpacity
                      key={`${btn.text}-${index}`}
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: btnBg,
                          borderColor: borderColor,
                        },
                      ]}
                      onPress={() => {
                        onClose();
                        if (btn.onPress) btn.onPress();
                      }}
                      activeOpacity={0.75}
                    >
                      {!!btn.icon && (
                        <Ionicons
                          name={btn.icon}
                          size={18}
                          color={textColor}
                          style={{ marginRight: 6 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.buttonText,
                          {
                            color: textColor,
                            fontWeight: isPrimary || isDestructive ? '700' : '600',
                          },
                        ]}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dialogCard: {
    width: Math.min(width - 48, 380),
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.heavy,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
  },
  message: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
    marginTop: Spacing.xs,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  buttonText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.fontSize.sm,
  },
});
