import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useWorkspace } from './WorkspaceContext';

export interface TargetLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TourStep {
  id: string;
  title: string;
  description: string;
  tag: string;
  icon: keyof typeof Ionicons.glyphMap;
  targetId: string;
  tip?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'header',
    targetId: 'header',
    title: 'Profile & Command Center',
    description: 'Personalize your workspace, customize liquid theme accents, and review system notifications.',
    tag: 'STEP 1 OF 5 • COMMAND CENTER',
    icon: 'person-circle-outline',
    tip: 'Tap your avatar anytime to update profile details or photo.',
  },
  {
    id: 'progress',
    targetId: 'progress',
    title: "Today's Focus & Progress",
    description: "Track your real-time daily completion rate, streak habits, and current priority agenda items.",
    tag: 'STEP 2 OF 5 • FOCUS TRACKER',
    icon: 'flame-outline',
    tip: 'Completing checklist items dynamically charges your daily progress ring.',
  },
  {
    id: 'bento',
    targetId: 'bento',
    title: 'Bento Metrics & Insights',
    description: 'At-a-glance overview of pending tasks, scheduled calendar blocks, and monthly spending in ₹ INR.',
    tag: 'STEP 3 OF 5 • SMART METRICS',
    icon: 'grid-outline',
    tip: 'Tap any bento card to jump directly into that dedicated workspace.',
  },
  {
    id: 'fab',
    targetId: 'fab',
    title: 'Instant Quick Action (+)',
    description: 'Quickly create tasks, schedule calendar events, log expenses, save URLs, or draft notes in one tap.',
    tag: 'STEP 4 OF 5 • QUICK HUB',
    icon: 'add-circle-outline',
    tip: 'Floating button stays accessible for frictionless thought capture.',
  },
  {
    id: 'navigation',
    targetId: 'navigation',
    title: 'Dedicated Offline Suites',
    description: 'Switch between Tasks, Calendar, Expenses, URL Bookmarks, Notes, and Settings with biometric privacy.',
    tag: 'STEP 5 OF 5 • SUITES & VAULT',
    icon: 'layers-outline',
    tip: 'Everything is 100% offline-first with zero cloud dependencies.',
  },
];

interface TourContextType {
  isTourActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  totalSteps: number;
  targets: Record<string, TargetLayout>;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  finishTour: () => void;
  registerTarget: (targetId: string, layout: TargetLayout) => void;
  unregisterTarget: (targetId: string) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateSettings } = useWorkspace();
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targets, setTargets] = useState<Record<string, TargetLayout>>({});

  const registerTarget = useCallback((targetId: string, layout: TargetLayout) => {
    setTargets(prev => {
      const existing = prev[targetId];
      if (
        existing &&
        Math.abs(existing.x - layout.x) < 2 &&
        Math.abs(existing.y - layout.y) < 2 &&
        Math.abs(existing.width - layout.width) < 2 &&
        Math.abs(existing.height - layout.height) < 2
      ) {
        return prev;
      }
      return { ...prev, [targetId]: layout };
    });
  }, []);

  const unregisterTarget = useCallback((targetId: string) => {
    setTargets(prev => {
      if (!prev[targetId]) return prev;
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
  }, []);

  const startTour = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCurrentStepIndex(0);
    setIsTourActive(true);
  }, []);

  const skipTour = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsTourActive(false);
    try {
      await updateSettings({ hasCompletedTour: true });
    } catch (e) {
      console.warn('[TourContext] Failed to persist skip status:', e);
    }
  }, [updateSettings]);

  const finishTour = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setIsTourActive(false);
    try {
      await updateSettings({ hasCompletedTour: true });
    } catch (e) {
      console.warn('[TourContext] Failed to persist tour completion:', e);
    }
  }, [updateSettings]);

  const nextStep = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      finishTour();
    }
  }, [currentStepIndex, finishTour]);

  const prevStep = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const currentStep = useMemo(() => {
    if (!isTourActive) return null;
    return TOUR_STEPS[currentStepIndex] || null;
  }, [isTourActive, currentStepIndex]);

  const value = useMemo(
    () => ({
      isTourActive,
      currentStepIndex,
      currentStep,
      totalSteps: TOUR_STEPS.length,
      targets,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      finishTour,
      registerTarget,
      unregisterTarget,
    }),
    [
      isTourActive,
      currentStepIndex,
      currentStep,
      targets,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      finishTour,
      registerTarget,
      unregisterTarget,
    ]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
