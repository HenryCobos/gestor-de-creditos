import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Card } from '../ui';
import { usePremium } from '../../hooks/usePremium';
import { useContextualPaywall } from '../../hooks/useContextualPaywall';

interface TrialOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const TrialOnboarding: React.FC<TrialOnboardingProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const premium = usePremium();
  const contextualPaywall = useContextualPaywall();

  const steps = [
    {
      title: '¡Prueba Premium Gratis!',
      subtitle: '3 días completos sin compromiso',
      description: 'Descubre todas las funciones premium y ve cómo pueden transformar tu negocio.',
      icon: '🎁',
      features: [
        'Clientes y préstamos ilimitados',
        'Reportes completos con gráficos',
        'Exportación de reportes en PDF',
        'Notificaciones personalizadas',
      ],
    },
    {
      title: 'Sin Tarjeta de Crédito',
      subtitle: 'Cero compromiso, máxima flexibilidad',
      description: 'No necesitas proporcionar datos de pago. Cancela cuando quieras, sin preguntas.',
      icon: '💳',
      features: [
        'Sin tarjeta de crédito requerida',
        'Cancela en cualquier momento',
        'Sin cargos ocultos',
        'Acceso completo a todas las funciones',
      ],
    },
    {
      title: '¿Listo para Comenzar?',
      subtitle: 'Tu trial gratuito te está esperando',
      description: 'Solo toma unos segundos activar tu trial y comenzar a disfrutar de Premium.',
      icon: '🚀',
      features: [
        'Activación instantánea',
        'Acceso inmediato a Premium',
        'Recordatorios antes de que expire',
        'Fácil actualización a plan pagado',
      ],
    },
  ];

  const handleStartTrial = async () => {
    const result = await premium.startTrial();
    if (result.success) {
      onComplete();
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleStartTrial();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{currentStepData.icon}</Text>
            </View>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>
          </View>

          {/* Features */}
          <Card style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>¿Qué incluye tu trial?</Text>
            {currentStepData.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </Card>

          {/* Benefits */}
          <Card style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Beneficios del Trial</Text>
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>⏱️</Text>
                <Text style={styles.benefitTitle}>7 Días Completos</Text>
                <Text style={styles.benefitDescription}>
                  Tiempo suficiente para explorar todas las funciones
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🔄</Text>
                <Text style={styles.benefitTitle}>Fácil Cancelación</Text>
                <Text style={styles.benefitDescription}>
                  Cancela cuando quieras, sin complicaciones
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>📈</Text>
                <Text style={styles.benefitTitle}>Resultados Inmediatos</Text>
                <Text style={styles.benefitDescription}>
                  Ve el impacto en tu negocio desde el primer día
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>💬</Text>
                <Text style={styles.benefitTitle}>Soporte Incluido</Text>
                <Text style={styles.benefitDescription}>
                  Ayuda personalizada durante tu trial
                </Text>
              </View>
            </View>
          </Card>

          {/* Testimonial */}
          <Card style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>
              "El trial me permitió ver el verdadero potencial de la app. 
              En solo 3 días ya había optimizado mi proceso de préstamos."
            </Text>
            <Text style={styles.testimonialAuthor}>- María González, Prestamista</Text>
          </Card>
        </View>
      </ScrollView>

      {/* Navigation */}
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
        
        <View style={styles.buttons}>
          {currentStep > 0 && (
            <Button
              title="Anterior"
              onPress={handlePrevious}
              variant="outline"
              style={styles.navButton}
            />
          )}
          
          <Button
            title={currentStep === steps.length - 1 ? "Comenzar Trial de 3 Días" : "Siguiente"}
            onPress={handleNext}
            style={styles.primaryButton}
          />
        </View>
        
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Omitir por ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresCard: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  benefitsCard: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 16,
  },
  testimonialCard: {
    backgroundColor: '#e8f5e8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginBottom: 20,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#2c3e50',
    lineHeight: 24,
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  navigation: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#2196F3',
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});
