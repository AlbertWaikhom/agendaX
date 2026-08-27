import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { colors } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    let bg = colors.primary;
    let borderColor = 'transparent';
    let borderWidth = 0;

    if (variant === 'secondary') {
      bg = colors.surfaceHighlight;
      borderColor = colors.border;
      borderWidth = 1;
    } else if (variant === 'outline') {
      bg = 'transparent';
      borderColor = colors.primary;
      borderWidth = 1.5;
    } else if (variant === 'danger') {
      bg = colors.error;
    } else if (variant === 'ghost') {
      bg = 'transparent';
    }

    let paddingVertical = Spacing.md;
    let paddingHorizontal = Spacing.xl;

    if (size === 'sm') {
      paddingVertical = Spacing.xs + 2;
      paddingHorizontal = Spacing.md;
    } else if (size === 'lg') {
      paddingVertical = Spacing.lg;
      paddingHorizontal = Spacing.xxl;
    }

    return {
      backgroundColor: bg,
      borderColor,
      borderWidth,
      paddingVertical,
      paddingHorizontal,
      borderRadius: BorderRadius.md,
      opacity: disabled || loading ? 0.6 : 1,
      width: fullWidth ? '100%' : undefined,
    };
  };

  const getTextStyle = (): TextStyle => {
    let color = '#FFFFFF';
    if (variant === 'outline') color = colors.primaryLight;
    if (variant === 'ghost') color = colors.textSecondary;
    if (variant === 'secondary') color = colors.text;

    let fontSize = Typography.fontSize.md;
    if (size === 'sm') fontSize = Typography.fontSize.sm;
    if (size === 'lg') fontSize = Typography.fontSize.lg;

    return {
      color,
      fontSize,
      fontWeight: Typography.fontWeight.semibold,
    };
  };

  const iconColor = (getTextStyle().color as string) || '#FFF';
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[styles.button, getContainerStyle(), style]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {Boolean(icon && iconPosition === 'left') && (
            <Ionicons name={icon!} size={iconSize} color={iconColor} style={styles.leftIcon} />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {Boolean(icon && iconPosition === 'right') && (
            <Ionicons name={icon!} size={iconSize} color={iconColor} style={styles.rightIcon} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
