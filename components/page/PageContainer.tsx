import React from 'react';
import { View, StyleSheet, StatusBar, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';

interface PageContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  withTopInset?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  style,
  noPadding = false,
  withTopInset = true,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: withTopInset ? Math.max(insets.top, 16) : 0,
          paddingBottom: Math.max(insets.bottom, 16),
          paddingHorizontal: noPadding ? 0 : 16,
        },
        style,
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
