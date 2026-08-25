import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PageContainer } from '../../../components/page/PageContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { createOnboardingStyles } from './OnboardingScreen.styles';

export const OnboardingScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createOnboardingStyles(colors), [colors]);

  const { initializeUser } = useWorkspace();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateWorkspace = async () => {
    if (!name.trim()) {
      setError('Please enter your name or workspace alias');
      return;
    }

    setLoading(true);
    try {
      await initializeUser(name.trim());
    } catch {
      setError('Failed to initialize workspace. Please try again.');
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Branding Section */}
          <View style={styles.topSection}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../../assets/product-logo.png')}
                style={{ width: 64, height: 64 }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appTitle}>PLANORA</Text>
            <Text style={styles.tagline}>Plan. Track. Achieve.</Text>
          </View>

          {/* Features Highlights Card */}
          <View style={styles.featuresCard}>
            <View style={styles.featureRow}>
              <View style={[styles.featureIconBox, { backgroundColor: `${colors.primaryLight}20` }]}>
                <Ionicons name="checkmark-done" size={20} color={colors.primaryLight} />
              </View>
              <Text style={styles.featureText}>Task & Priority Management</Text>
            </View>

            <View style={styles.featureRow}>
              <View style={[styles.featureIconBox, { backgroundColor: `${colors.accentPurple}20` }]}>
                <Ionicons name="calendar" size={20} color={colors.accentPurple} />
              </View>
              <Text style={styles.featureText}>Calendar & Event Timeline</Text>
            </View>

            <View style={styles.featureRow}>
              <View style={[styles.featureIconBox, { backgroundColor: `${colors.accentEmerald}20` }]}>
                <Ionicons name="wallet" size={20} color={colors.accentEmerald} />
              </View>
              <Text style={styles.featureText}>Monthly Expense Tracker & Graphs</Text>
            </View>

            <View style={styles.featureRow}>
              <View style={[styles.featureIconBox, { backgroundColor: `${colors.accentCyan}20` }]}>
                <Ionicons name="shield-checkmark" size={20} color={colors.accentCyan} />
              </View>
              <Text style={styles.featureText}>100% Private Offline Local JSON Storage</Text>
            </View>
          </View>

          {/* Setup Form Section */}
          <View style={styles.formSection}>
            <Input
              label="Your Name or Alias"
              placeholder="e.g. Alex, Sarah, Founder"
              value={name}
              onChangeText={text => {
                setName(text);
                setError('');
              }}
              error={error}
              autoFocus
            />

            <Button
              title={loading ? 'Creating Workspace...' : 'Get Started'}
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleCreateWorkspace}
              style={{ marginTop: 8 }}
            />

            <Text style={styles.footerNote}>
              A unique local workspace ID will be generated for this device.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageContainer>
  );
};
