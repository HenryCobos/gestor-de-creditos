import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { OnboardingScreen } from './OnboardingScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { ContextualPaywall } from '../paywall/ContextualPaywall';
import { useOnboarding } from '../../hooks/useOnboarding';
import { usePremium } from '../../hooks/usePremium';
import { useContextualPaywall } from '../../hooks/useContextualPaywall';

interface OnboardingFlowProps {
  children: React.ReactNode;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ children }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const onboarding = useOnboarding();
  const premium = usePremium();
  const contextualPaywall = useContextualPaywall();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    if (onboarding.isFirstLaunch) {
      // Primera vez que abre la app
      setShowWelcome(true);
    } else if (!onboarding.isOnboardingCompleted) {
      // Ha abierto la app antes pero no completó el onboarding
      setShowOnboarding(true);
    }
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setShowOnboarding(true);
    onboarding.startOnboarding();
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    onboarding.completeOnboarding();
  };

  const handleLearnMore = () => {
    // Mostrar información adicional o navegar a una pantalla de información
    console.log('Learn more clicked');
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    onboarding.completeOnboarding();
  };

  // Si el usuario ya completó el onboarding, mostrar la app normal
  if (onboarding.isOnboardingCompleted) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {children}
      
      {/* Pantalla de Bienvenida */}
      <Modal
        visible={showWelcome}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <WelcomeScreen
          onGetStarted={handleWelcomeComplete}
          onLearnMore={handleLearnMore}
        />
      </Modal>

      {/* Flujo de Onboarding */}
      <Modal
        visible={showOnboarding}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <OnboardingScreen
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      </Modal>

      {/* Paywall Contextual */}
      <ContextualPaywall
        visible={contextualPaywall.visible}
        onClose={contextualPaywall.hidePaywall}
        packages={contextualPaywall.packages}
        loading={contextualPaywall.loading}
        error={contextualPaywall.error}
        onSelect={contextualPaywall.handleSubscribe}
        onRestore={contextualPaywall.handleRestore}
        onStartTrial={contextualPaywall.handleStartTrial}
        onRetry={contextualPaywall.handleRetry}
        context={contextualPaywall.context || {
          title: '',
          message: '',
          icon: '',
          featureName: '',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  });
