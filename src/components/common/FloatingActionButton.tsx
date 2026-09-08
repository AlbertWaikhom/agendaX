import React, { forwardRef } from 'react';
import { TouchableOpacity, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  onLayout?: () => void;
}

export const FloatingActionButton = forwardRef<View, FloatingActionButtonProps>(({
  onPress,
  icon = 'add',
  style,
  onLayout,
}, ref) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      ref={ref as any}
      activeOpacity={0.85}
      onPress={onPress}
      onLayout={onLayout}
      style={[styles.fab, { shadowColor: colors.primary }, style]}
      accessibilityRole="button"
      accessibilityLabel="Create item"
    >
      <View style={[styles.gradient, { backgroundColor: colors.primary }]}>
        <Ionicons name={icon} size={28} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: BorderRadius.full,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
});
