import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { PayPalProduct } from '../../services/payments';

interface PaywallContext {
  title: string;
  message: string;
  icon: string;
  featureName: string;
  currentUsage?: number;
  limit?: number;
}

interface ContextualPaywallProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (product: PayPalProduct) => void;
  loading?: boolean;
  error?: string;
  packages?: PayPalProduct[];
  context?: PaywallContext;
  onRetry?: () => void;
  onRestore?: () => void;
  pendingPayment?: any;
  onCompletePayment?: (transactionId: string, product: any) => Promise<void>;
  onCancelPayment?: (transactionId?: string, product?: any) => void | Promise<void>;
}

const { width, height } = Dimensions.get('window');

const ContextualPaywall: React.FC<ContextualPaywallProps> = ({
  visible,
  onClose,
  onSelect,
  loading = false,
  error,
  packages = [],
  context,
  onRetry,
  onRestore,
  pendingPayment,
  onCompletePayment,
  onCancelPayment
}) => {
  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toFixed(2)}`;
  };

  const monthlyProduct: PayPalProduct = {
    id: 'P-5XJ99625GT120133NNDZHG3Y', // ID real de PayPal - Plan Mensual
    name: 'Plan Mensual Premium - Gestor de Créditos',
    price: 9.99,
    currency: 'USD',
    type: 'monthly'
  };

  const yearlyProduct: PayPalProduct = {
    id: 'P-6GH417601N8335719NDZHHYI', // ID real de PayPal - Plan Anual
    name: 'Plan Anual Premium - Gestor de Créditos',
    price: 59.99,
    currency: 'USD',
    type: 'yearly'
  };

  if (!visible) return null;

  return (
      <Modal
        animationType="slide"
        transparent={true}
      visible={visible}
        onRequestClose={onClose}
      >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📊</Text>
            </View>
            <Text style={styles.title}>
              {context?.title || 'Reportes avanzados son Premium'}
            </Text>
            <Text style={styles.subtitle}>
              {context?.message || 'Desbloquea todas las funciones premium'}
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
            
            {/* Mostrar planes de PayPal si están disponibles, sino mostrar fallback */}
            {packages && packages.length > 0 ? (
              packages.map((pkg) => (
                  <TouchableOpacity 
                    key={pkg.id}
                    style={[
                    styles.planButton,
                    pkg.type === 'yearly' && styles.recommendedPlan
                    ]}
                    onPress={() => {
                    console.log('🎯 Plan PayPal seleccionado:', pkg);
                      onSelect(pkg);
                    }} 
                    disabled={loading}
                  >
                    {pkg.type === 'yearly' && (
                      <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>🔥 MEJOR OPCIÓN</Text>
                      </View>
                    )}
                  <View style={styles.planContent}>
                    <Text style={styles.planName}>
                        {pkg.type === 'yearly' ? 'Premium Anual' : 'Premium Mensual'}
                      </Text>
                    <Text style={styles.planPrice}>
                          {formatPrice(pkg.price, pkg.currency)}
                        </Text>
                    <Text style={styles.planPeriod}>
                      {pkg.type === 'yearly' ? 'por año' : 'por mes'}
                        </Text>
                        {pkg.type === 'yearly' && (
                      <Text style={styles.planPerMonth}>
                            /mes ({formatPrice(pkg.price / 12, pkg.currency)})
                          </Text>
                        )}
                      {pkg.type === 'yearly' && (
                      <Text style={styles.savingsText}>Ahorras con el plan anual</Text>
                      )}
                    </View>
                  <Text style={styles.planArrow}>→</Text>
                  </TouchableOpacity>
                ))
              ) : (
              <>
                {/* Fallback: Plan Mensual */}
                <TouchableOpacity 
                  style={styles.planButton}
                  onPress={() => {
                    console.log('🎯 Plan Mensual fallback seleccionado');
                    onSelect(monthlyProduct);
                  }}
                  disabled={loading}
                >
                  <View style={styles.planContent}>
                    <Text style={styles.planName}>Premium Mensual</Text>
                    <Text style={styles.planPrice}>
                      {formatPrice(monthlyProduct.price, monthlyProduct.currency)}
                  </Text>
                    <Text style={styles.planPeriod}>por mes</Text>
                </View>
                  <Text style={styles.planArrow}>→</Text>
                </TouchableOpacity>

                {/* Fallback: Plan Anual */}
                <TouchableOpacity 
                  style={[styles.planButton, styles.recommendedPlan]}
                  onPress={() => {
                    console.log('🎯 Plan Anual fallback seleccionado');
                    onSelect(yearlyProduct);
                  }}
                  disabled={loading}
                >
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>🔥 MEJOR OPCIÓN</Text>
                  </View>
                  <View style={styles.planContent}>
                    <Text style={styles.planName}>Premium Anual</Text>
                    <Text style={styles.planPrice}>
                      {formatPrice(yearlyProduct.price, yearlyProduct.currency)}
                    </Text>
                    <Text style={styles.planPeriod}>por año</Text>
                    <Text style={styles.planPerMonth}>
                      /mes ({formatPrice(yearlyProduct.price / 12, yearlyProduct.currency)})
                  </Text>
                    <Text style={styles.savingsText}>Ahorras con el plan anual</Text>
                  </View>
                  <Text style={styles.planArrow}>→</Text>
                </TouchableOpacity>
              </>
            )}
          </View>


          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Procesando compra...</Text>
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              {onRetry && (
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={onRetry}
                >
                  <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

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
  recommendedPlan: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  recommendedBadge: {
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
  recommendedText: {
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#34495e',
    marginTop: 10,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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

export { ContextualPaywall };