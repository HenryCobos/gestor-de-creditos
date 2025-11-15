import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, Switch, TouchableOpacity, Linking, Share } from 'react-native';
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

  const handleAbrirLanding = async () => {
    const url = 'https://henrycobos.github.io/gestor-creditos-landing';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se puede abrir el enlace');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el sitio web');
    }
  };

  const handleCompartirLanding = async () => {
    try {
      await Share.share({
        message: '¡Descarga Gestor de Créditos! La app definitiva para prestamistas y otorgantes de crédito. Cronogramas automáticos, reportes PDF y control total de tu negocio. https://henrycobos.github.io/gestor-creditos-landing',
        url: 'https://henrycobos.github.io/gestor-creditos-landing',
        title: 'Gestor de Créditos - App para Prestamistas'
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir');
    }
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

      {/* Información de Contacto */}
      <Card style={styles.card}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactTitle}>📧 Contacto y Soporte</Text>
        </View>
        
        <View style={styles.contactItem}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Correo de Soporte</Text>
            <Text style={styles.contactValue}>Apper2025@icloud.com</Text>
            <Text style={styles.contactDescription}>
              Contáctanos para soporte técnico, sugerencias o reportar problemas
            </Text>
          </View>
        </View>
      </Card>

      {/* Enlaces Útiles */}
      <Card style={styles.card}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactTitle}>🔗 Enlaces Útiles</Text>
        </View>
        
        <View style={styles.linkItem}>
          <View style={styles.linkInfo}>
            <Text style={styles.linkLabel}>Sitio Web Oficial</Text>
            <Text style={styles.linkDescription}>
              Visita nuestra landing page para más información y descarga
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={handleAbrirLanding}
          >
            <Text style={styles.linkButtonText}>Abrir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linkItem}>
          <View style={styles.linkInfo}>
            <Text style={styles.linkLabel}>Compartir App</Text>
            <Text style={styles.linkDescription}>
              Comparte Gestor de Créditos con otros prestamistas
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={handleCompartirLanding}
          >
            <Text style={styles.linkButtonText}>Compartir</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Panel de debug removido para producción - El sistema de reseñas sigue funcionando en segundo plano */}

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
        error={contextualPaywall.error || undefined}
        onSelect={contextualPaywall.handleSubscribe}
        onRestore={contextualPaywall.handleRestore}
        onRetry={contextualPaywall.handleRetry}
        context={contextualPaywall.context || {
          title: '',
          message: '',
          icon: '',
          featureName: '',
        }}
        pendingPayment={contextualPaywall.pendingPayment}
        onCompletePayment={contextualPaywall.onCompletePayment}
        onCancelPayment={contextualPaywall.onCancelPayment}
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
  contactHeader: {
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkInfo: {
    flex: 1,
    marginRight: 12,
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 12,
    color: '#666',
  },
  linkButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  linkButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});