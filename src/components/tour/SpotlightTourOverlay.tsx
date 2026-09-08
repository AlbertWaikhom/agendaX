import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTour, TargetLayout } from '../../context/TourContext';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';

export const SpotlightTourOverlay: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const {
    isTourActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    targets,
    nextStep,
    prevStep,
    skipTour,
  } = useTour();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(12)).current;

  // Pulse animation for spotlight halo
  useEffect(() => {
    if (!isTourActive) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [isTourActive, pulseAnim]);

  // Entrance animation for step transition
  useEffect(() => {
    if (isTourActive) {
      fadeAnim.setValue(0);
      cardTranslateY.setValue(12);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isTourActive, currentStepIndex, fadeAnim, cardTranslateY]);

  if (!isTourActive || !currentStep) {
    return null;
  }

  const targetLayout: TargetLayout = targets[currentStep.targetId] || (
    currentStep.targetId === 'fab'
      ? {
          x: screenWidth - 20 - 58,
          y: screenHeight - insets.bottom - 70 - 24 - 58,
          width: 58,
          height: 58,
        }
      : currentStep.targetId === 'navigation'
      ? {
          x: 0,
          y: screenHeight - (70 + insets.bottom),
          width: screenWidth,
          height: 70 + insets.bottom,
        }
      : currentStep.targetId === 'header'
      ? {
          x: Spacing.lg,
          y: insets.top + 8,
          width: screenWidth - Spacing.lg * 2,
          height: 72,
        }
      : {
          x: Spacing.lg,
          y: screenHeight * 0.35,
          width: screenWidth - Spacing.lg * 2,
          height: 120,
        }
  );

  // Add comfortable padding around highlighted element
  const padding = currentStep.targetId === 'fab' ? 6 : 8;
  const spotlightX = Math.max(0, targetLayout.x - padding);
  const spotlightY = Math.max(0, targetLayout.y - padding);
  const spotlightWidth = Math.min(screenWidth - spotlightX, targetLayout.width + padding * 2);
  const spotlightHeight = targetLayout.height + padding * 2;
  const spotlightRadius = currentStep.targetId === 'fab' ? 36 : 18;

  // Determine tooltip placement (above or below)
  const isBottomHalf = spotlightY + spotlightHeight > screenHeight * 0.55;
  const tooltipWidth = screenWidth - Spacing.lg * 2;

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <Animated.View style={[styles.rootContainer, { opacity: fadeAnim }]} pointerEvents="box-none">
      {/* Surrounding 4 Dark Mask Blocks */}
      {/* Top Mask */}
      <View
        pointerEvents="none"
        style={[
          styles.maskBlock,
          {
            left: 0,
            top: 0,
            right: 0,
            height: spotlightY,
          },
        ]}
      />
      {/* Bottom Mask */}
      <View
        pointerEvents="none"
        style={[
          styles.maskBlock,
          {
            left: 0,
            top: spotlightY + spotlightHeight,
            right: 0,
            bottom: 0,
          },
        ]}
      />
      {/* Left Mask */}
      <View
        pointerEvents="none"
        style={[
          styles.maskBlock,
          {
            left: 0,
            top: spotlightY,
            width: spotlightX,
            height: spotlightHeight,
          },
        ]}
      />
      {/* Right Mask */}
      <View
        pointerEvents="none"
        style={[
          styles.maskBlock,
          {
            left: spotlightX + spotlightWidth,
            top: spotlightY,
            right: 0,
            height: spotlightHeight,
          },
        ]}
      />

      {/* Spotlight Window Cutout & Animated Pulsing Halo */}
      <View
        pointerEvents="none"
        style={[
          styles.spotlightFrame,
          {
            left: spotlightX,
            top: spotlightY,
            width: spotlightWidth,
            height: spotlightHeight,
            borderRadius: spotlightRadius,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.haloRing,
            {
              borderRadius: spotlightRadius + 4,
              borderColor: colors.primaryLight,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        {/* Beacon Pin */}
        <View style={[styles.beaconBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="sparkles" size={12} color="#FFFFFF" />
        </View>
      </View>

      {/* Floating Liquid Glass Tooltip Card */}
      <Animated.View
        style={[
          styles.tooltipCard,
          {
            width: tooltipWidth,
            backgroundColor: '#0F172AFA',
            borderColor: `${colors.primary}60`,
            borderTopColor: `${colors.primaryLight}90`,
            transform: [{ translateY: cardTranslateY }],
            ...(isBottomHalf
              ? {
                  bottom: Math.min(screenHeight - spotlightY + 14, screenHeight - insets.top - 20),
                }
              : {
                  top: Math.max(spotlightY + spotlightHeight + 14, insets.top + 10),
                }),
          },
        ]}
      >
        {/* Header Tag & Skip */}
        <View style={styles.cardHeader}>
          <View style={[styles.stepTagBadge, { backgroundColor: `${colors.primary}25` }]}>
            <View style={[styles.stepDot, { backgroundColor: colors.primaryLight }]} />
            <Text style={[styles.stepTagText, { color: colors.primaryLight }]}>{currentStep.tag}</Text>
          </View>

          <TouchableOpacity onPress={skipTour} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip Tour</Text>
          </TouchableOpacity>
        </View>

        {/* Title with Icon */}
        <View style={styles.titleRow}>
          <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name={currentStep.icon} size={20} color={colors.primaryLight} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{currentStep.title}</Text>
        </View>

        {/* Body Description */}
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          {currentStep.description}
        </Text>

        {/* Pro Tip Box */}
        {currentStep.tip ? (
          <View style={[styles.tipBox, { backgroundColor: '#1E293B80', borderColor: '#334155' }]}>
            <Ionicons name="bulb-outline" size={14} color="#F59E0B" />
            <Text style={styles.tipText}>
              <Text style={{ fontWeight: '700', color: '#F59E0B' }}>Tip: </Text>
              {currentStep.tip}
            </Text>
          </View>
        ) : null}

        {/* Action Controls & Step Progress */}
        <View style={styles.controlsRow}>
          {/* Step Dots */}
          <View style={styles.dotsContainer}>
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const active = idx === currentStepIndex;
              return (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    active
                      ? [styles.dotActive, { backgroundColor: colors.primaryLight }]
                      : { backgroundColor: colors.glassBorder },
                  ]}
                />
              );
            })}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsGroup}>
            {currentStepIndex > 0 ? (
              <TouchableOpacity
                style={[styles.backBtn, { borderColor: colors.glassBorder }]}
                onPress={prevStep}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
                <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Back</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.nextBtn,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
              onPress={nextStep}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>{isLastStep ? 'Get Started 🚀' : 'Next'}</Text>
              {!isLastStep && <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  maskBlock: {
    position: 'absolute',
    backgroundColor: 'rgba(3, 7, 18, 0.82)',
  },
  spotlightFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#818CF8',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  haloRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    margin: -4,
    opacity: 0.6,
  },
  beaconBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tooltipCard: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    zIndex: 100,
    elevation: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  stepTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  skipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.xs,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  tipText: {
    fontSize: 11.5,
    color: '#CBD5E1',
    lineHeight: 16,
    flex: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
  },
  buttonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
