import React from 'react';
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
  context,
}) => {
  const isNearLimit = context.currentUsage && context.limit 
    ? context.currentUsage >= context.limit * 0.8 
    : false;


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
                <Text style={styles.loadingText}>Cargando opciones...</Text>
              </View>
            )}

            <View style={styles.packagesContainer}>
              {packages && packages.length > 0 ? (
                packages.map((pkg, index) => (
                  <TouchableOpacity 
                    key={pkg.identifier}
                    style={[
                      styles.package,
                      pkg.packageType === 'ANNUAL' && styles.recommendedPackage
                    ]}
                    onPress={() => onSelect(pkg)} 
                    disabled={loading}
                  >
                    {pkg.packageType === 'ANNUAL' && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>MEJOR OPCIÓN</Text>
                      </View>
                    )}
                    <View style={styles.packageContent}>
                      <Text style={styles.packageTitle}>{pkg.product.title}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
                        {pkg.packageType === 'ANNUAL' && (
                          <Text style={styles.pricePerMonth}>
                            /mes (${(pkg.product.price / 12).toFixed(2)})
                          </Text>
                        )}
                      </View>
                      <Text style={styles.packageDescription}>
                        {pkg.packageType === 'MONTHLY' ? 'Facturación mensual' : 'Facturación anual'}
                      </Text>
                      {pkg.packageType === 'ANNUAL' && (
                        <Text style={styles.savingsText}>Ahorras $59.89 al año</Text>
                      )}
                    </View>
                    <View style={styles.packageArrow}>
                      <Text style={styles.arrowText}>→</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                // Fallback con planes por defecto si no hay paquetes de RevenueCat
                <>
                  <TouchableOpacity 
                    style={styles.package}
                    onPress={() => {
                      const mockPackage = {
                        identifier: 'gdc_pro_monthly',
                        packageType: 'MONTHLY',
                        product: {
                          priceString: '$9.99',
                          price: 9.99,
                          title: 'Mensual',
                        }
                      };
                      onSelect(mockPackage as any);
                    }} 
                    disabled={loading}
                  >
                    <View style={styles.packageContent}>
                      <Text style={styles.packageTitle}>Mensual</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.packagePrice}>$9.99</Text>
                      </View>
                      <Text style={styles.packageDescription}>Facturación mensual</Text>
                    </View>
                    <View style={styles.packageArrow}>
                      <Text style={styles.arrowText}>→</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.package, styles.recommendedPackage]}
                    onPress={() => {
                      const mockPackage = {
                        identifier: 'gdc_pro_yearly',
                        packageType: 'ANNUAL',
                        product: {
                          priceString: '$59.99',
                          price: 59.99,
                          title: 'Anual',
                        }
                      };
                      onSelect(mockPackage as any);
                    }} 
                    disabled={loading}
                  >
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>MEJOR OPCIÓN</Text>
                    </View>
                    <View style={styles.packageContent}>
                      <Text style={styles.packageTitle}>Anual</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.packagePrice}>$59.99</Text>
                        <Text style={styles.pricePerMonth}>/mes ($5.00)</Text>
                      </View>
                      <Text style={styles.packageDescription}>Facturación anual</Text>
                      <Text style={styles.savingsText}>Ahorras $59.89 al año</Text>
                    </View>
                    <View style={styles.packageArrow}>
                      <Text style={styles.arrowText}>→</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {onStartTrial && (
              <View style={styles.trialContainer}>
                <TouchableOpacity style={styles.trialButton} onPress={onStartTrial}>
                  <Text style={styles.trialButtonText}>Probar 3 días gratis</Text>
                </TouchableOpacity>
              </View>
            )}
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
  loadingText: {
    fontSize: 14,
    color: '#7f8c8d',
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
});
