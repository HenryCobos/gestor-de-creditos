import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Button } from '../ui';
import { PricingService, PricingPlan } from '../../services/pricing';

interface SimplePaywallProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (plan: PricingPlan) => void;
  onStartTrial: () => void;
  context?: {
    currentUsage?: number;
    limit?: number;
    featureName?: string;
  };
}

const { width, height } = Dimensions.get('window');

export const SimplePaywall: React.FC<SimplePaywallProps> = ({
  visible,
  onClose,
  onSelect,
  onStartTrial,
  context
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const plans = PricingService.getPlans();

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    onSelect(plan);
  };

  const handleStartTrial = () => {
    onStartTrial();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.container}>
          {/* Header fijo */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🚀</Text>
            </View>
            <Text style={styles.title}>¡Casi alcanzas el límite!</Text>
            <Text style={styles.subtitle}>
              {context?.currentUsage !== undefined && context?.limit !== undefined && context?.featureName 
                ? `Has usado ${context.currentUsage} de ${context.limit} ${context.featureName.toLowerCase()}`
                : 'Mejora a Premium para acceso ilimitado'
              }
            </Text>
          </View>

          {/* Contenido scrolleable */}
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            bounces={false}
          >
            {/* Progress Bar */}
            {context?.currentUsage !== undefined && context?.limit !== undefined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(context.currentUsage / context.limit) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round((context.currentUsage / context.limit) * 100)}% utilizado
                </Text>
              </View>
            )}

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Con Premium obtienes:</Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✅</Text>
                <Text style={styles.benefitText}>Clientes y préstamos ilimitados</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✅</Text>
                <Text style={styles.benefitText}>Reportes completos con gráficos</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✅</Text>
                <Text style={styles.benefitText}>Exportación de reportes en PDF</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✅</Text>
                <Text style={styles.benefitText}>Notificaciones personalizadas</Text>
              </View>
            </View>

            {/* Plans */}
            <View style={styles.plansContainer}>
              <Text style={styles.plansTitle}>Elige tu plan:</Text>
              
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    plan.isPopular && styles.popularPlan,
                    selectedPlan?.id === plan.id && styles.selectedPlan
                  ]}
                  onPress={() => handleSelectPlan(plan)}
                >
                  {plan.isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>MEJOR OPCIÓN</Text>
                    </View>
                  )}
                  
                  <View style={styles.planContent}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.planPrice}>
                        {PricingService.formatPrice(plan.price)}
                      </Text>
                      {plan.period === 'yearly' && (
                        <Text style={styles.pricePerMonth}>
                          /mes ({PricingService.formatPrice(PricingService.getPricePerMonth(plan.price))})
                        </Text>
                      )}
                    </View>
                    {plan.savings && (
                      <Text style={styles.savingsText}>
                        Ahorras {PricingService.formatPrice(plan.savings)} al año
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.planArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Trial Option */}
            <View style={styles.trialContainer}>
              <Text style={styles.trialText}>¿No estás seguro?</Text>
              <TouchableOpacity style={styles.trialButton} onPress={handleStartTrial}>
                <Text style={styles.trialButtonText}>Probar 3 días gratis</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer fijo */}
          <View style={styles.footer}>
            <View style={styles.legalContainer}>
              <Text style={styles.legalText}>
                Al suscribirte aceptas nuestros
                {' '}<Text style={styles.link} onPress={() => {
                  const { Linking } = require('react-native');
                  Linking.openURL('https://gestordecreditos.netlify.app/TERMINOS_SERVICIO.md');
                }}>Términos de Uso</Text>
                {' '}y la{' '}
                <Text style={styles.link} onPress={() => {
                  const { Linking } = require('react-native');
                  Linking.openURL('https://gestordecreditos.netlify.app/POLITICA_PRIVACIDAD.md');
                }}>Política de Privacidad</Text>.
              </Text>
            </View>
            <TouchableOpacity style={styles.laterButton} onPress={onClose}>
              <Text style={styles.laterButtonText}>Tal vez después</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    height: height * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexGrow: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f39c12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f39c12',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 6,
  },
  benefitIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  plansContainer: {
    marginBottom: 16,
  },
  plansTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  popularPlan: {
    borderColor: '#3498db',
    backgroundColor: '#f8f9ff',
  },
  selectedPlan: {
    borderColor: '#27ae60',
    backgroundColor: '#f0fff4',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  planContent: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#27ae60',
  },
  pricePerMonth: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  savingsText: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
    marginTop: 4,
  },
  planArrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 18,
    color: '#3498db',
    fontWeight: '600',
  },
  trialContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trialText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  trialButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  trialButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  legalContainer: {
    paddingBottom: 8,
  },
  legalText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  link: {
    color: '#1976D2',
    textDecorationLine: 'underline',
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  laterButtonText: {
    color: '#95a5a6',
    fontSize: 14,
    fontWeight: '500',
  },
});
