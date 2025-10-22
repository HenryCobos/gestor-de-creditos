import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Button } from '../ui';
import { PricingService, PricingPlan } from '../../services/pricing';

interface SimplePaywallProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (plan: PricingPlan) => void;
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
  context
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const plans = PricingService.getPlans();

  const handleSelectPlan = async (plan: PricingPlan) => {
    console.log('💳 Plan seleccionado:', plan);
    setSelectedPlan(plan);
    setIsProcessing(true);
    
    try {
      await onSelect(plan);
      // No cerramos aquí - el hook useContextualPaywall se encarga de cerrar si es exitoso
    } catch (error) {
      console.error('❌ Error al seleccionar plan:', error);
    } finally {
      setIsProcessing(false);
    }
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
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⭐</Text>
            </View>
            <Text style={styles.title}>
              {context?.featureName ? `${context.featureName} es Premium` : 'Funciones Premium'}
            </Text>
            <Text style={styles.subtitle}>
              Desbloquea todas las funciones premium
            </Text>
            
            {/* Barra de progreso si hay contexto */}
            {context && context.currentUsage !== undefined && context.limit !== undefined && (
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
                  {context.currentUsage} de {context.limit} utilizados
                </Text>
              </View>
            )}
          </View>

          {/* Beneficios */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Con Premium obtienes:</Text>
            
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>👥</Text>
                <Text style={styles.benefitText}>Clientes ilimitados</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>💰</Text>
                <Text style={styles.benefitText}>Préstamos ilimitados</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>📄</Text>
                <Text style={styles.benefitText}>Exportación de reportes en PDF</Text>
              </View>
            </View>
          </View>

          {/* Planes */}
          <View style={styles.plansContainer}>
            <Text style={styles.plansTitle}>Elige tu plan:</Text>
            
            {plans.map((plan) => (
              <TouchableOpacity 
                key={plan.id}
                style={[
                  styles.planButton,
                  plan.isPopular && styles.popularPlan
                ]}
                onPress={() => handleSelectPlan(plan)}
                disabled={isProcessing}
              >
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>🔥 MEJOR OPCIÓN</Text>
                  </View>
                )}
                
                <View style={styles.planContent}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>
                    USD {plan.price.toFixed(2)}
                  </Text>
                  <Text style={styles.planPeriod}>
                    {plan.period === 'yearly' ? 'por año' : 'por mes'}
                  </Text>
                  {plan.period === 'yearly' && (
                    <Text style={styles.planPerMonth}>
                      /mes (USD {(plan.price / 12).toFixed(2)})
                    </Text>
                  )}
                  {plan.period === 'yearly' && (
                    <Text style={styles.savingsText}>Ahorras con el plan anual</Text>
                  )}
                </View>
                
                <Text style={styles.planArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Trial Button - Build 156 Version */}
          <View style={styles.trialContainer}>
            <TouchableOpacity 
              style={styles.trialButton}
              onPress={() => {
                // Buscar el plan mensual para el trial
                const monthlyPlan = plans.find(p => p.period === 'monthly');
                if (monthlyPlan) {
                  handleSelectPlan(monthlyPlan);
                }
              }}
              disabled={isProcessing}
            >
              <Text style={styles.trialButtonText}>
                Iniciar prueba GRATIS de 3 días
              </Text>
            </TouchableOpacity>
            
            {/* Trial Disclosure - Build 156 Requirement */}
            <Text style={styles.trialDisclosure}>
              Después del período de prueba gratuita de 3 días, se cobrará automáticamente USD 9.99/mes. 
              Cancela en cualquier momento antes de que termine el período de prueba para evitar cargos.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.legalText}>
              Al suscribirte aceptas nuestros Términos de Uso y la Política de Privacidad. 
              La suscripción se renueva automáticamente salvo cancelación al menos 24 horas antes del fin del período. 
              La gestión y cancelación se realiza a través de PayPal. El cobro se realiza a tu cuenta de PayPal al confirmar la compra.
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Tal vez después</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: height * 0.85,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f39c12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
  },
  benefitsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 10,
    textAlign: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#34495e',
    flex: 1,
  },
  plansContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularPlan: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 15,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  popularText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  planContent: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginTop: 2,
  },
  planPeriod: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  planPerMonth: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 1,
  },
  savingsText: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
    marginTop: 3,
  },
  planArrow: {
    fontSize: 18,
    color: '#3498db',
    marginLeft: 8,
  },
  trialContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  trialButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
  },
  trialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trialDisclosure: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  legalText: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 14,
  },
  footerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  footerButtonText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
});