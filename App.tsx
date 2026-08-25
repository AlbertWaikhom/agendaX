import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WorkspaceProvider } from './src/context/WorkspaceContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SecurityProvider, useSecurity } from './src/context/SecurityContext';
import { LockScreenOverlay } from './src/components/security/LockScreenOverlay';
import { AppNavigator } from './src/navigation/AppNavigator';

const AppContent: React.FC = () => {
  const { isDark } = useTheme();
  const { isAppLocked, activeUnlockPrompt, closeUnlockPrompt } = useSecurity();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />

      {/* Full App Lock Screen */}
      <LockScreenOverlay
        visible={isAppLocked}
        title="AgendaX Protected"
        subtitle="Authenticate to access your workspace"
        isAppLockModal
      />

      {/* Dynamic Page Unlock Prompt */}
      {activeUnlockPrompt && (
        <LockScreenOverlay
          visible={activeUnlockPrompt.visible}
          title={activeUnlockPrompt.title}
          subtitle={activeUnlockPrompt.subtitle}
          onSuccess={() => {
            activeUnlockPrompt.resolve?.(true);
            closeUnlockPrompt();
          }}
          onCancel={() => {
            closeUnlockPrompt();
          }}
        />
      )}
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SecurityProvider>
          <WorkspaceProvider>
            <AppContent />
          </WorkspaceProvider>
        </SecurityProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
