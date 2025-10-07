import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, Switch, TouchableOpacity } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, LoadingSpinner, LimitIndicator } from '../../components';
import { ContextualPaywall } from '../../components/paywall/ContextualPaywall';
import { NotificationService } from '../../services/notifications';
import { AutoBackupService } from '../../services/autoBackup';
import { usePremium } from '../../hooks/usePremium';
import { useContextualPaywall } from '../../hooks/useContextualPaywall';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useUser } from '../../hooks/useUser';
import { UserProfileModal } from '../../components';
import { ReviewService } from '../../services/reviewService';

export function ConfiguracionScreen() {
  const { state, actualizarConfiguracion } = useApp();
  const premium = usePremium();
  const contextualPaywall = useContextualPaywall();
  const onboarding = useOnboarding();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [permisosNotificaciones, setPermisosNotificaciones] = useState({
    granted: false,
    canAskAgain: false,
    status: 'unknown'
  });
  
  // Estados locales para la configuración
  const [config, setConfig] = useState(state.configuracion);
  const [reviewStats, setReviewStats] = useState<any>(null);

  useEffect(() => {
    verificarPermisos();
    // Cargar stats también en TestFlight para debugging
    loadReviewStats();
  }, []);

  const loadReviewStats = async () => {
    const stats = await ReviewService.getReviewStats();
    setReviewStats(stats);
  };

  const verificarPermisos = async () => {
    const permisos = await NotificationService.verificarPermisos();
    setPermisosNotificaciones(permisos);
  };

  const handleSolicitarPermisos = async () => {
    try {
      await NotificationService.initialize();
      await verificarPermisos();
      Alert.alert('Éxito', 'Permisos de notificación concedidos');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron obtener los permisos de notificación');
    }
  };

  const handleGuardarConfiguracion = async () => {
    setIsLoading(true);
    try {
      await actualizarConfiguracion(config);
      Alert.alert('Éxito', 'Configuración guardada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Procesando..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Premium */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {premium.isPremium ? '✅ Premium Activo' : '🚀 Actualizar a Premium'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {premium.isPremium 
                ? 'Disfruta de todas las funciones sin límites' 
                : 'Desbloquea todas las funciones y elimina los límites'
              }
            </Text>
          </View>
          {!premium.isPremium && (
            <Button
              title="Ver Planes"
              onPress={() => contextualPaywall.showPaywall('reportes_avanzados')}
              size="small"
              style={styles.headerButton}
            />
          )}
        </View>
      </Card>

      {/* Límites - Solo si no es premium */}
      {!premium.isPremium && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>📊 Límites Actuales</Text>
          <View style={styles.limitsContainer}>
            <LimitIndicator
              current={state.clientes.length}
              limit={10}
              label="Clientes"
              icon="👥"
              onUpgrade={() => contextualPaywall.showPaywall('create_cliente')}
            />
            <LimitIndicator
              current={state.prestamos.filter(p => p.estado === 'activo').length}
              limit={10}
              label="Préstamos Activos"
              icon="💰"
              onUpgrade={() => contextualPaywall.showPaywall('create_prestamo')}
            />
          </View>
        </Card>
      )}

      {/* Perfil de Usuario */}
      <Card style={styles.card}>
        <TouchableOpacity 
          style={styles.userInfoContainer}
          onPress={() => {
            console.log('Opening user profile modal...');
            setShowUserProfile(true);
          }}
        >
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Usuario Anónimo</Text>
            <Text style={styles.userStatus}>🎯 Identificado por dispositivo</Text>
            {user && (
              <Text style={styles.userDetails}>
                Usuario desde: {new Date(user.installationDate).toLocaleDateString()}
              </Text>
            )}
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* Configuración de Notificaciones */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>🔔 Notificaciones</Text>
        
        <View style={styles.configItem}>
          <View style={styles.configInfo}>
            <Text style={styles.configLabel}>Recordatorios de Pago</Text>
            <Text style={styles.configDescription}>
              Recibir notificaciones sobre cuotas próximas a vencer
            </Text>
          </View>
          <Switch
            value={config.recordatoriosPago}
            onValueChange={(value) => setConfig({ ...config, recordatoriosPago: value })}
          />
        </View>

        {config.recordatoriosPago && (
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Días de Anticipación</Text>
            <View style={styles.numberInputContainer}>
              <Input
                value={config.diasAnticipacion.toString()}
                onChangeText={(value) => setConfig({ ...config, diasAnticipacion: parseInt(value) || 3 })}
                placeholder="3"
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {!permisosNotificaciones.granted && (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              {permisosNotificaciones.status === 'denied' 
                ? '❌ Notificaciones deshabilitadas' 
                : '⚠️ Permisos de notificación requeridos'
              }
            </Text>
            <Button
              title="Habilitar Notificaciones"
              onPress={handleSolicitarPermisos}
              size="small"
              variant="outline"
              style={styles.permissionButton}
            />
          </View>
        )}
      </Card>

      {/* Configuración de Backup */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>☁️ Respaldo Automático</Text>
        
        <View style={styles.configItem}>
          <View style={styles.configInfo}>
            <Text style={styles.configLabel}>Backup Automático</Text>
            <Text style={styles.configDescription}>
              Respalda tus datos automáticamente cada 24 horas
            </Text>
          </View>
          <Switch
            value={config.respaldoAutomatico}
            onValueChange={(value) => setConfig({ ...config, respaldoAutomatico: value })}
          />
        </View>

        <View style={styles.configItem}>
          <View style={styles.configInfo}>
            <Text style={styles.configLabel}>Estado del Backup</Text>
            <Text style={styles.configValue}>
              {config.respaldoAutomatico ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
      </Card>


      {/* Botón Guardar */}
      <Card style={styles.card}>
        <Button
          title="💾 Guardar Configuración"
          onPress={handleGuardarConfiguracion}
          size="large"
          loading={isLoading}
        />
      </Card>

      {/* Debug: Sistema de Reseñas - Visible también en TestFlight */}
      {reviewStats && (
        <Card style={StyleSheet.flatten([styles.card, styles.debugCard])}>
          <Text style={styles.sectionTitle}>🔍 Debug: Sistema de Reseñas</Text>
          
          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configLabel}>Solicitudes enviadas</Text>
              <Text style={styles.configDescription}>{reviewStats.requestCount} / 3 máximo</Text>
            </View>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configLabel}>Reseña dada</Text>
              <Text style={styles.configDescription}>{reviewStats.reviewGiven ? 'Sí ✅' : 'No'}</Text>
            </View>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configLabel}>Usuario rechazó</Text>
              <Text style={styles.configDescription}>{reviewStats.declined ? 'Sí' : 'No'}</Text>
            </View>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configLabel}>Préstamos completados</Text>
              <Text style={styles.configDescription}>{reviewStats.loansCompleted}</Text>
            </View>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configLabel}>Pagos marcados</Text>
              <Text style={styles.configDescription}>{reviewStats.paymentsMarked}</Text>
            </View>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configLabel}>Reportes exportados</Text>
              <Text style={styles.configDescription}>{reviewStats.reportsExported}</Text>
            </View>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configLabel}>Aperturas de app</Text>
              <Text style={styles.configDescription}>{reviewStats.appOpens}</Text>
            </View>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configLabel}>Días desde Premium</Text>
              <Text style={styles.configDescription}>{reviewStats.daysSincePremium ?? 'No Premium'}</Text>
            </View>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configLabel}>Última solicitud</Text>
              <Text style={styles.configDescription}>
                {reviewStats.lastRequestDate ? new Date(reviewStats.lastRequestDate).toLocaleDateString() : 'Nunca'}
              </Text>
            </View>
          </View>

          <Button
            title="🔄 Resetear Sistema de Reseñas"
            onPress={async () => {
              Alert.alert(
                'Confirmar Reset',
                '¿Resetear todas las estadísticas de reseñas? (Solo para testing)',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Resetear',
                    style: 'destructive',
                    onPress: async () => {
                      await ReviewService.resetAll();
                      await loadReviewStats();
                      Alert.alert('✅', 'Sistema de reseñas reseteado');
                    }
                  }
                ]
              );
            }}
            variant="outline"
            size="small"
            style={{ marginTop: 12 }}
          />

          <Button
            title="⭐ Forzar Solicitud de Reseña (Testing)"
            onPress={async () => {
              const success = await ReviewService.requestReview('usage_milestone');
              Alert.alert(
                success ? '✅ Reseña Solicitada' : '❌ No se pudo solicitar',
                success 
                  ? 'Deberías ver el prompt nativo de iOS' 
                  : 'Revisa los logs en consola para ver por qué no se mostró'
              );
              await loadReviewStats();
            }}
            variant="outline"
            size="small"
            style={{ marginTop: 8 }}
          />
        </Card>
      )}

      <View style={styles.bottomSpacing} />
      
      {/* Modal de Perfil de Usuario */}
      <UserProfileModal
        visible={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
      
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  headerButton: {
    marginLeft: 10,
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  limitsContainer: {
    gap: 12,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  userDetails: {
    fontSize: 12,
    color: '#95a5a6',
  },
  arrow: {
    fontSize: 20,
    color: '#bdc3c7',
    marginLeft: 10,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  configInfo: {
    flex: 1,
    marginRight: 16,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  configValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  numberInputContainer: {
    width: 80,
  },
  permissionContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  permissionText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 8,
  },
  permissionButton: {
    alignSelf: 'flex-start',
  },
  bottomSpacing: {
    height: 32,
  },
  debugCard: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
});