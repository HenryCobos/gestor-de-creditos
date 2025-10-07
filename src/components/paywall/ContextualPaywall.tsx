import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Card, Button, PremiumBadge } from '../ui';

// Definir tipo local para evitar import directo
interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: {
    priceString: string;
    price: number;
    title: string;
  };
}

interface ContextualPaywallProps {
  visible: boolean;
  onClose: () => void;
  packages: PurchasesPackage[];
  loading: boolean;
  onSelect: (pkg: PurchasesPackage) => void;
  onRestore: () => void;
  onStartTrial?: () => void;
  onRetry?: () => void;
  error?: string | null;
  context: {
    title: string;
    message: string;
    icon: string;
    featureName: string;
    currentUsage?: number;
    limit?: number;
  };
}

const { width, height } = Dimensions.get('window');

export const ContextualPaywall: React.FC<ContextualPaywallProps> = ({
  visible,
  onClose,
  packages,
  loading,
  onSelect,
  onRestore,
  onStartTrial,
  onRetry,
  error,
  context,
}) => {
  const isNearLimit = context.currentUsage && context.limit 
    ? context.currentUsage >= context.limit * 0.8 
    : false;
  
  const [showSuccess, setShowSuccess] = useState(false);


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header fijo */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{context.icon}</Text>
            </View>
            <Text style={styles.title}>{context.title}</Text>
            <Text style={styles.message}>{context.message}</Text>
            
            {isNearLimit && context.currentUsage && context.limit && (
              <View style={styles.limitWarning}>
                <Text style={styles.limitText}>
                  Has usado {context.currentUsage} de {context.limit} {context.featureName.toLowerCase()}
                </Text>
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

          {/* Contenido scrolleable */}
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContainer}
            bounces={false}
          >
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Desbloquea límites con Premium</Text>
              
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🚀</Text>
                <Text style={styles.benefitText}>
                  Clientes y préstamos ilimitados
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>📊</Text>
                <Text style={styles.benefitText}>
                  Reportes completos con gráficos
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>☁️</Text>
                <Text style={styles.benefitText}>
                  Exportación de reportes en PDF
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🔔</Text>
                <Text style={styles.benefitText}>
                  Notificaciones personalizadas
                </Text>
              </View>
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner}>
                  <Text style={styles.loadingSpinnerText}>⟳</Text>
                </View>
                <Text style={styles.loadingText}>Procesando compra...</Text>
                <Text style={styles.loadingSubText}>Por favor espera mientras procesamos tu suscripción</Text>
              </View>
            )}

            {error && !error.includes('already') && !error.includes('suscrito') && !error.includes('subscribed') && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorSubText}>
                  Por favor, verifica tu conexión e intenta de nuevo
                </Text>
                {onRetry && (
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={onRetry}
                  >
                    <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={() => {
                    console.log('🔍 DEBUG INFO:');
                    console.log('📦 Packages:', packages);
                    console.log('📦 Packages length:', packages?.length);
                    console.log('📦 Packages details:', packages?.map(pkg => ({
                      identifier: pkg.identifier,
                      packageType: pkg.packageType,
                      price: pkg.product?.priceString,
                      title: pkg.product?.title
                    })));
                    console.log('⚠️ Error:', error);
                    console.log('🔄 Loading:', loading);
                    alert('Logs enviados a la consola. Revisa la consola de desarrollo.');
                  }}
                >
                  <Text style={styles.debugButtonText}>🔍 Ver Logs</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Mostrar error si no hay productos válidos pero no hay error específico */}
            {!error && packages && packages.length > 0 && !packages.every(pkg => 
              pkg && pkg.identifier && pkg.packageType && pkg.product
            ) && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>Faltan algunos datos de los productos</Text>
                <Text style={styles.errorSubText}>
                  Intentaremos igualmente mostrar los planes disponibles
                </Text>
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

            {/* Oculto en producción/TestFlight */}
            {__DEV__ && (
              <TouchableOpacity 
                style={styles.debugInfoButton}
                onPress={() => {
                  console.log('🔍 DEBUG INFO COMPLETO:');
                  console.log('📦 Packages:', packages);
                  console.log('📦 Packages length:', packages?.length);
                  console.log('📦 Packages details:', packages?.map(pkg => ({
                    identifier: pkg.identifier,
                    packageType: pkg.packageType,
                    price: pkg.product?.priceString,
                    title: pkg.product?.title
                  })));
                  console.log('⚠️ Error:', error);
                  console.log('🔄 Loading:', loading);
                  console.log('🎯 Context:', context);
                  alert(`Estado actual:\n- Productos: ${packages?.length || 0}\n- Error: ${error || 'Ninguno'}\n- Cargando: ${loading}\n\nRevisa la consola para más detalles.`);
                }}
              >
                <Text style={styles.debugInfoButtonText}>🔍 Estado del Paywall</Text>
              </TouchableOpacity>
            )}

            <View style={styles.packagesContainer}>
              {(() => {
                console.log('🔍 ContextualPaywall - packages recibidos:', packages);
                console.log('🔍 ContextualPaywall - packages.length:', packages?.length);
                console.log('🔍 ContextualPaywall - packages detalle:', packages?.map(pkg => ({
                  identifier: pkg.identifier,
                  packageType: pkg.packageType,
                  price: pkg.product?.priceString,
                  title: pkg.product?.title
                })));
                
                // Verificar si hay productos válidos
                const hasValidPackages = packages && packages.length > 0 && packages.every(pkg => 
                  pkg && pkg.identifier && pkg.packageType && pkg.product
                );
                
                console.log('🔍 ContextualPaywall - hasValidPackages:', hasValidPackages);
                return hasValidPackages;
              })() ? (
                packages.map((pkg, index) => (
                  <TouchableOpacity 
                    key={pkg.identifier}
                    style={[
                      styles.package,
                      pkg.packageType === 'ANNUAL' && styles.recommendedPackage
                    ]}
                    onPress={() => {
                      onSelect(pkg);
                    }} 
                    disabled={loading}
                  >
                    {pkg.packageType === 'ANNUAL' && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>MEJOR OPCIÓN</Text>
                      </View>
                    )}
                    <View style={styles.packageContent}>
                      <Text style={styles.packageTitle}>
                        {pkg.packageType === 'ANNUAL' ? 'Premium Anual' : 'Premium Mensual'}
                      </Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.packagePrice}>
                          {pkg.product?.price && pkg.product?.currencyCode
                            ? formatPrice(pkg.product.price, pkg.product.currencyCode)
                            : pkg.product?.priceString || `$${pkg.product?.price?.toFixed(2) || '0.00'}`}
                        </Text>
                        <Text style={styles.pricePeriod}>
                          {pkg.packageType === 'ANNUAL' ? ' por año' : ' por mes'}
                        </Text>
                        {pkg.packageType === 'ANNUAL' && pkg.product.price && pkg.product.currencyCode && (
                          <Text style={styles.pricePerMonth}>
                            /mes ({formatPrice(pkg.product.price / 12, pkg.product.currencyCode)})
                          </Text>
                        )}
                      </View>
                      <Text style={styles.packageDescription}>
                        {pkg.packageType === 'MONTHLY' ? 'Facturación mensual' : 'Facturación anual'}
                      </Text>
                      <Text style={styles.subscriptionInfo}>
                        Suscripción auto-renovable {pkg.packageType === 'ANNUAL' ? 'anual' : 'mensual'}
                      </Text>
                      {pkg.packageType === 'ANNUAL' && pkg.product.price && pkg.product.currencyCode && (
                        <Text style={styles.savingsText}>
                          {(() => {
                            // Calcular ahorro: (precio mensual * 12) - precio anual
                            const monthlyPkg = packages.find(p => p.packageType === 'MONTHLY');
                            if (monthlyPkg && monthlyPkg.product && monthlyPkg.product.price) {
                              const savings = (monthlyPkg.product.price * 12) - pkg.product.price;
                              if (savings > 0) {
                                return `Ahorras ${formatPrice(savings, pkg.product.currencyCode)} al año`;
                              }
                            }
                            return 'Ahorra con el plan anual';
                          })()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.packageArrow}>
                      <Text style={styles.arrowText}>→</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                // Sin paquetes reales: solo informar, sin botones simulados
                <View style={styles.noPackagesContainer}>
                  <Text style={styles.noPackagesText}>
                    Los planes de suscripción no están disponibles en este momento.
                  </Text>
                  <Text style={styles.noPackagesSubText}>
                    Verifica la conexión o vuelve a intentarlo más tarde.
                  </Text>
                </View>
              )}
            </View>

            {onStartTrial && (
              <View style={styles.trialContainer}>
                <TouchableOpacity 
                  style={[styles.trialButton, loading && styles.trialButtonDisabled]} 
                  onPress={onStartTrial}
                  disabled={loading}
                >
                  <Text style={styles.trialButtonText}>
                    {loading ? 'Procesando...' : 'Probar 3 días gratis'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Overlay de éxito */}
          {showSuccess && (
            <View style={styles.successOverlay}>
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTitle}>¡Compra exitosa!</Text>
                <Text style={styles.successMessage}>
                  Ya tienes acceso Premium. Disfruta de todas las funciones.
                </Text>
              </View>
            </View>
          )}

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
              <Text style={styles.legalSubText}>
                La suscripción se renueva automáticamente salvo cancelación al menos 24 horas antes del fin del
                período. La gestión y cancelación se realiza en Ajustes de Apple ID. El cobro se realiza a tu cuenta
                de iTunes al confirmar la compra.
              </Text>
            </View>

            <TouchableOpacity onPress={onRestore} style={styles.restoreButton}>
              <Text style={styles.restoreText}>Restaurar compras</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Tal vez después</Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  limitWarning: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
    width: '100%',
  },
  limitText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f39c12',
    borderRadius: 3,
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
    color: '#495057',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingSpinnerText: {
    fontSize: 20,
    color: '#3498db',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 4,
  },
  loadingSubText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorSubText: {
    fontSize: 12,
    color: '#721c24',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#721c24',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 8,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  debugInfoButton: {
    backgroundColor: '#17a2b8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 16,
  },
  debugInfoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  packagesContainer: {
    marginBottom: 16,
  },
  package: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recommendedPackage: {
    borderColor: '#3498db',
    backgroundColor: '#f8f9ff',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -6,
    right: 12,
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  packageContent: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3498db',
    marginRight: 4,
  },
  pricePerMonth: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  pricePeriod: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
    fontWeight: '500',
  },
  subscriptionInfo: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  packageDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  savingsText: {
    fontSize: 11,
    color: '#27ae60',
    fontWeight: '600',
  },
  packageArrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 18,
    color: '#3498db',
    fontWeight: '600',
  },
  trialContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
  trialButtonDisabled: {
    opacity: 0.5,
    borderColor: '#95a5a6',
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
  legalSubText: {
    fontSize: 11,
    color: '#8a8a8a',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  link: {
    color: '#1976D2',
    textDecorationLine: 'underline',
  },
  restoreButton: {
    marginBottom: 12,
  },
  restoreText: {
    color: '#7f8c8d',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeText: {
    color: '#95a5a6',
    fontSize: 14,
  },
  noPackagesContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  noPackagesText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  noPackagesSubText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
