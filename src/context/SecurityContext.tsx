import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SecuritySettings, LockMode } from '../types';
import { SecurityService, defaultSecuritySettings } from '../services/securityService';

interface BiometricsInfo {
  hasHardware: boolean;
  isEnrolled: boolean;
  types: string[];
}

interface UnlockPromptState {
  visible: boolean;
  title: string;
  subtitle?: string;
  pageId?: string;
  resolve?: (success: boolean) => void;
}

interface SecurityContextType {
  securitySettings: SecuritySettings;
  isAppLocked: boolean;
  unlockedPages: string[];
  biometricsInfo: BiometricsInfo;
  activeUnlockPrompt: UnlockPromptState | null;
  unlockAppWithBiometrics: () => Promise<boolean>;
  unlockAppWithPin: (pin: string) => boolean;
  isPageLocked: (pageId: string) => boolean;
  requestPageUnlock: (pageId: string, pageTitle?: string) => Promise<boolean>;
  lockApp: () => void;
  lockPage: (pageId: string) => void;
  closeUnlockPrompt: () => void;
  updateSecuritySettings: (newSettings: Partial<SecuritySettings>) => Promise<void>;
  setCustomPin: (pin: string) => Promise<void>;
  removeCustomPin: () => Promise<void>;
  togglePageLock: (pageId: string, enabled: boolean) => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);
  const [unlockedPages, setUnlockedPages] = useState<string[]>([]);
  const [biometricsInfo, setBiometricsInfo] = useState<BiometricsInfo>({
    hasHardware: false,
    isEnrolled: false,
    types: [],
  });
  const [activeUnlockPrompt, setActiveUnlockPrompt] = useState<UnlockPromptState | null>(null);

  useEffect(() => {
    const initSecurity = async () => {
      const [settings, bio] = await Promise.all([
        SecurityService.loadSecuritySettings(),
        SecurityService.checkBiometricsCapability(),
      ]);
      setSecuritySettings(settings);
      setBiometricsInfo(bio);

      if (settings.appLockEnabled) {
        setIsAppLocked(true);
      }
    };
    initSecurity();
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        if (securitySettings.appLockEnabled) {
          setIsAppLocked(true);
        }
        setUnlockedPages([]);
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [securitySettings.appLockEnabled]);

  const updateSecuritySettings = async (newSettings: Partial<SecuritySettings>) => {
    const updated = { ...securitySettings, ...newSettings };
    setSecuritySettings(updated);
    await SecurityService.saveSecuritySettings(updated);
  };

  const setCustomPin = async (pin: string) => {
    await updateSecuritySettings({ customPin: pin });
  };

  const removeCustomPin = async () => {
    await updateSecuritySettings({ customPin: null });
  };

  const togglePageLock = async (pageId: string, enabled: boolean) => {
    let updatedLocked = [...securitySettings.lockedPages];
    if (enabled && !updatedLocked.includes(pageId)) {
      updatedLocked.push(pageId);
    } else if (!enabled) {
      updatedLocked = updatedLocked.filter(p => p !== pageId);
    }
    await updateSecuritySettings({ lockedPages: updatedLocked });
  };

  const isPageLocked = useCallback(
    (pageId: string): boolean => {
      const isTargetLocked = securitySettings.lockedPages.includes(pageId);
      if (!isTargetLocked) return false;
      return !unlockedPages.includes(pageId);
    },
    [securitySettings.lockedPages, unlockedPages]
  );

  const lockApp = () => {
    setIsAppLocked(true);
  };

  const lockPage = (pageId: string) => {
    setUnlockedPages(prev => prev.filter(p => p !== pageId));
  };

  const unlockAppWithBiometrics = async (): Promise<boolean> => {
    const res = await SecurityService.authenticateBiometric('Unlock AgendaX');
    if (res.success) {
      setIsAppLocked(false);
      return true;
    }
    return false;
  };

  const unlockAppWithPin = (pin: string): boolean => {
    const validPin = securitySettings.customPin || '1234';
    if (pin === validPin) {
      setIsAppLocked(false);
      return true;
    }
    return false;
  };

  const requestPageUnlock = (pageId: string, pageTitle: string = pageId): Promise<boolean> => {
    return new Promise(resolve => {
      if (
        securitySettings.lockMode === 'biometric_system' ||
        securitySettings.lockMode === 'both'
      ) {
        if (biometricsInfo.isEnrolled) {
          SecurityService.authenticateBiometric(`Unlock ${pageTitle}`).then(res => {
            if (res.success) {
              setUnlockedPages(prev => [...prev, pageId]);
              resolve(true);
              return;
            }
            if (securitySettings.customPin) {
              setActiveUnlockPrompt({
                visible: true,
                title: `Unlock ${pageTitle}`,
                subtitle: 'Enter your custom App PIN to continue',
                pageId,
                resolve: (success: boolean) => {
                  if (success) {
                    setUnlockedPages(prev => [...prev, pageId]);
                  }
                  resolve(success);
                },
              });
            } else {
              resolve(false);
            }
          });
          return;
        }
      }

      setActiveUnlockPrompt({
        visible: true,
        title: `Unlock ${pageTitle}`,
        subtitle: 'Enter your custom App PIN to continue',
        pageId,
        resolve: (success: boolean) => {
          if (success) {
            setUnlockedPages(prev => [...prev, pageId]);
          }
          resolve(success);
        },
      });
    });
  };

  const closeUnlockPrompt = () => {
    if (activeUnlockPrompt?.resolve) {
      activeUnlockPrompt.resolve(false);
    }
    setActiveUnlockPrompt(null);
  };

  return (
    <SecurityContext.Provider
      value={{
        securitySettings,
        isAppLocked,
        unlockedPages,
        biometricsInfo,
        activeUnlockPrompt,
        unlockAppWithBiometrics,
        unlockAppWithPin,
        isPageLocked,
        requestPageUnlock,
        lockApp,
        lockPage,
        closeUnlockPrompt,
        updateSecuritySettings,
        setCustomPin,
        removeCustomPin,
        togglePageLock,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
