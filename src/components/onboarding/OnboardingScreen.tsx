import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ScrollView, 
  TouchableOpacity,
  Image,
  StatusBar 
} from 'react-native';
import { Button } from '../ui';
import { ContextualPaywall } from '../paywall/ContextualPaywall';
import { usePremium } from '../../hooks/usePremium';
import { useContextualPaywall } from '../../hooks/useContextualPaywall';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image?: string;
  isPremium?: boolean;
  showPaywall?: boolean;
  actionText?: string;
  onAction?: () => void;
}

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const premium = usePremium();
  const contextualPaywall = useContextualPaywall();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '¡Bienvenido a Gestor de Créditos!',
      subtitle: 'La herramienta profesional para tu negocio de préstamos',
      description: 'Gestiona clientes, préstamos y cuotas de manera eficiente. Todo en una sola aplicación.',
      icon: '💼',
    },
    {
      id: 'features',
      title: 'Funciones Principales',
      subtitle: 'Todo lo que necesitas para gestionar préstamos',
      description: 'Registra clientes, crea préstamos, genera cronogramas automáticamente y lleva el control de pagos.',
      icon: '⚡',
    },
    {
      id: 'premium_benefits',
      title: 'Desbloquea Premium',
      subtitle: 'Potencia tu negocio con funciones avanzadas',
      description: 'Clientes ilimitados, reportes completos, exportación en PDF y mucho más.',
      icon: '💎',
      isPremium: true,
      showPaywall: true,
      actionText: 'Ver Beneficios Premium',
    },
    {
      id: 'trial',
      title: 'Prueba Gratis',
      subtitle: '3 días gratis para explorar Premium',
      description: 'Prueba todas las funciones premium sin compromiso. Cancela cuando quieras.',
      icon: '🎁',
      isPremium: true,
      actionText: 'Comenzar Trial Gratis',
    },
    {
      id: 'ready',
      title: '¡Estás listo!',
      subtitle: 'Comienza a gestionar tus préstamos',
      description: 'Ya tienes todo configurado. ¡Es hora de crear tu primer préstamo!',
      icon: '🚀',
      actionText: 'Empezar a Usar',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({
        x: nextStep * width,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      scrollViewRef.current?.scrollTo({
        x: prevStep * width,
        animated: true,
      });
    }
  };

  const handleAction = () => {
    const step = steps[currentStep];
    
    if (step.showPaywall) {
      contextualPaywall.showPaywall('reportes_avanzados', {
        title: 'Desbloquea Premium',
        message: 'Disfruta de todas las funciones premium sin límites.',
        icon: '💎',
        featureName: 'Premium',
      });
    } else if (step.id === 'trial') {
      premium.startTrial();
    } else if (step.id === 'ready') {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const getButtonText = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'welcome':
        return 'Comenzar';
      case 'features':
        return 'Continuar';
      case 'premium_benefits':
        return 'Continuar';
      case 'trial':
        return 'Continuar';
      case 'ready':
        return 'Empezar a Usar';
      default:
        return currentStep === steps.length - 1 ? "Empezar a Usar" : "Continuar";
    }
  };

  const renderStep = (step: OnboardingStep, index: number) => (
    <View key={step.id} style={styles.stepContainer}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{step.icon}</Text>
          {step.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.subtitle}>{step.subtitle}</Text>
        <Text style={styles.description}>{step.description}</Text>
        
        {step.actionText && (
          <Button
            title={step.actionText}
            onPress={handleAction}
            style={step.isPremium ? {...styles.actionButton, ...styles.premiumButton} : styles.actionButton}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      
      {/* Header con progreso */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} de {steps.length}
          </Text>
        </View>
        
        {currentStep < steps.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Omitir</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contenido principal */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {steps.map(renderStep)}
      </ScrollView>

      {/* Navegación */}
      <View style={styles.navigation}>
        <View style={styles.dots}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.activeDot
              ]}
            />
          ))}
        </View>
        
        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <Button
              title="Anterior"
              onPress={handlePrevious}
              variant="outline"
              style={{...styles.navButton, ...styles.previousButton}}
              textStyle={styles.previousButtonText}
            />
          )}
          
          <Button
            title={getButtonText()}
            onPress={handleNext}
            style={{...styles.navButton, ...styles.nextButton}}
            textStyle={styles.nextButtonText}
          />
        </View>
      </View>

      {/* Paywall Contextual */}
      <ContextualPaywall
        visible={contextualPaywall.visible}
        onClose={contextualPaywall.hidePaywall}
        packages={contextualPaywall.packages}
        loading={contextualPaywall.loading}
        error={contextualPaywall.error}
        onSelect={(pkg) => {
          // Convertir PurchasesPackage a PricingPlan para handleSubscribe
          const plan = {
            id: pkg.identifier,
            name: pkg.packageType === 'MONTHLY' ? 'Mensual' : 'Anual',
            price: pkg.product.price,
            period: pkg.packageType === 'MONTHLY' ? 'monthly' as const : 'yearly' as const,
            revenueCatId: pkg.identifier,
            features: [], // Características del plan
          };
          contextualPaywall.handleSubscribe(plan);
        }}
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
    backgroundColor: '#2196F3',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginRight: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  icon: {
    fontSize: 60,
  },
  premiumBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  navigation: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  nextButton: {
    backgroundColor: '#fff',
  },
  nextButtonText: {
    color: '#2196F3',
    fontWeight: '700',
  },
  previousButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#fff',
    borderWidth: 2,
  },
  previousButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
