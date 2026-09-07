import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WorkspaceProvider } from './src/context/WorkspaceContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SecurityProvider, useSecurity } from './src/context/SecurityContext';
import { LockScreenOverlay } from './src/components/security/LockScreenOverlay';
import { AppNavigator } from './src/navigation/AppNavigator';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught crash:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>AgendaX Workspace Recovery</Text>
          <Text style={styles.errorSubtitle}>
            An unexpected error occurred while launching. Your local SQLite data is completely safe.
          </Text>
          <ScrollView style={styles.errorBox}>
            <Text style={styles.errorText}>
              {this.state.error?.message || 'Unknown runtime error'}
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.retryBtn} onPress={this.handleRestart} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Re-open Workspace</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <SecurityProvider>
            <WorkspaceProvider>
              <AppContent />
            </WorkspaceProvider>
          </SecurityProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  errorBox: {
    maxHeight: 160,
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#F43F5E',
    fontFamily: 'monospace',
  },
  retryBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
