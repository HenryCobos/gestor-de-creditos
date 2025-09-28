import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@creditos_app:onboarding_completed';
const FIRST_LAUNCH_KEY = '@creditos_app:first_launch';

interface OnboardingState {
  isFirstLaunch: boolean;
  isOnboardingCompleted: boolean;
  currentStep: number;
  hasSeenPaywall: boolean;
  hasStartedTrial: boolean;
  onboardingStartTime?: string;
  onboardingEndTime?: string;
}

interface OnboardingActions {
  startOnboarding: () => void;
  completeOnboarding: () => void;
  setCurrentStep: (step: number) => void;
  markPaywallSeen: () => void;
  markTrialStarted: () => void;
  resetOnboarding: () => void;
  trackOnboardingEvent: (event: string, data?: any) => void;
}

export function useOnboarding(): OnboardingState & OnboardingActions {
  const [state, setState] = useState<OnboardingState>({
    isFirstLaunch: false,
    isOnboardingCompleted: false,
    currentStep: 0,
    hasSeenPaywall: false,
    hasStartedTrial: false,
  });

  // Cargar estado inicial
  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      const [isFirstLaunch, isOnboardingCompleted, hasSeenPaywall, hasStartedTrial] = await Promise.all([
        AsyncStorage.getItem(FIRST_LAUNCH_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem('@creditos_app:paywall_seen'),
        AsyncStorage.getItem('@creditos_app:trial_started'),
      ]);

      setState({
        isFirstLaunch: isFirstLaunch === null,
        isOnboardingCompleted: isOnboardingCompleted === 'true',
        currentStep: 0,
        hasSeenPaywall: hasSeenPaywall === 'true',
        hasStartedTrial: hasStartedTrial === 'true',
      });
    } catch (error) {
      console.error('Error cargando estado de onboarding:', error);
    }
  };

  const startOnboarding = useCallback(async () => {
    try {
      const startTime = new Date().toISOString();
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
      setState(prev => ({
        ...prev,
        isFirstLaunch: false,
        onboardingStartTime: startTime,
      }));
      
      // Track event
      trackOnboardingEvent('onboarding_started', { startTime });
    } catch (error) {
      console.error('Error iniciando onboarding:', error);
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      const endTime = new Date().toISOString();
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      
      setState(prev => {
        const duration = prev.onboardingStartTime 
          ? new Date(endTime).getTime() - new Date(prev.onboardingStartTime).getTime()
          : 0;
        
        // Track event
        trackOnboardingEvent('onboarding_completed', { 
          endTime,
          duration
        });
        
        return {
          ...prev,
          isOnboardingCompleted: true,
          onboardingEndTime: endTime,
        };
      });
    } catch (error) {
      console.error('Error completando onboarding:', error);
    }
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
    trackOnboardingEvent('step_changed', { step });
  }, []);

  const markPaywallSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem('@creditos_app:paywall_seen', 'true');
      setState(prev => ({ ...prev, hasSeenPaywall: true }));
      trackOnboardingEvent('paywall_seen');
    } catch (error) {
      console.error('Error marcando paywall como visto:', error);
    }
  }, []);

  const markTrialStarted = useCallback(async () => {
    try {
      await AsyncStorage.setItem('@creditos_app:trial_started', 'true');
      setState(prev => ({ ...prev, hasStartedTrial: true }));
      trackOnboardingEvent('trial_started');
    } catch (error) {
      console.error('Error marcando trial como iniciado:', error);
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_KEY),
        AsyncStorage.removeItem('@creditos_app:paywall_seen'),
        AsyncStorage.removeItem('@creditos_app:trial_started'),
        AsyncStorage.removeItem('@creditos_app:onboarding_events'),
      ]);
      
      setState({
        isFirstLaunch: true,
        isOnboardingCompleted: false,
        currentStep: 0,
        hasSeenPaywall: false,
        hasStartedTrial: false,
      });
      
      trackOnboardingEvent('onboarding_reset');
    } catch (error) {
      console.error('Error reseteando onboarding:', error);
    }
  }, []);

  const trackOnboardingEvent = useCallback(async (event: string, data?: any) => {
    try {
      const eventsKey = '@creditos_app:onboarding_events';
      const existingEvents = await AsyncStorage.getItem(eventsKey);
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      
      const newEvent = {
        event,
        timestamp: new Date().toISOString(),
        data,
      };
      
      events.push(newEvent);
      
      // Mantener solo los últimos 100 eventos
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      await AsyncStorage.setItem(eventsKey, JSON.stringify(events));
    } catch (error) {
      console.error('Error trackeando evento de onboarding:', error);
    }
  }, []);

  return {
    ...state,
    startOnboarding,
    completeOnboarding,
    setCurrentStep,
    markPaywallSeen,
    markTrialStarted,
    resetOnboarding,
    trackOnboardingEvent,
  };
}
