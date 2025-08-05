import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, Switch, TouchableOpacity } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, LoadingSpinner, OptionSelector } from '../../components';
import { NotificationService } from '../../services/notifications';
import { StorageService } from '../../services/storage';

export function ConfiguracionScreen() {
  const { state, dispatch, actualizarConfiguracion } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [permisosNotificaciones, setPermisosNotificaciones] = useState({
    granted: false,
    canAskAgain: false,
    status: 'unknown'
  });
  
  // Estados locales para la configuración
  const [config, setConfig] = useState(state.configuracion);

  useEffect(() => {
    verificarPermisos();
  }, []);

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
      console.error('Error al guardar configuración:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetearConfiguracion = () => {
    Alert.alert(
      'Resetear Configuración',
      '¿Estás seguro de que quieres restablecer toda la configuración a los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: () => {
            const defaultConfig = {
              moneda: 'COP',
              formatoFecha: 'dd/MM/yyyy',
              recordatoriosPago: true,
              diasAnticipacion: 3,
              horaRecordatorio: '09:00',
              respaldoAutomatico: false,
              tema: 'claro' as const
            };
            setConfig(defaultConfig);
          }
        }
      ]
    );
  };

  const handleCrearRespaldo = async () => {
    setIsLoading(true);
    try {
      const backupString = await StorageService.createBackup();
      // En una app real, aquí podrías compartir el archivo o guardarlo en almacenamiento externo
      Alert.alert(
        'Respaldo Creado',
        `Respaldo creado exitosamente.\n\nTamaño: ${(backupString.length / 1024).toFixed(2)} KB\n\nEn una versión completa, este respaldo se guardaría en tu dispositivo o se compartiría por email.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el respaldo');
      console.error('Error al crear respaldo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiarDatos = () => {
    Alert.alert(
      '⚠️ Eliminar Todos los Datos',
      'Esta acción eliminará TODOS tus clientes, préstamos, cuotas y pagos. Esta acción NO SE PUEDE DESHACER.\n\n¿Estás completamente seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'ELIMINAR TODO',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmación Final',
              'Última oportunidad para cancelar. ¿Realmente quieres eliminar todos los datos?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'SÍ, ELIMINAR',
                  style: 'destructive',
                  onPress: async () => {
                    setIsLoading(true);
                    try {
                      await StorageService.clearAllData();
                      // Reinicializar el estado de la app
                      dispatch({ type: 'RESET_APP' });
                      Alert.alert('Datos Eliminados', 'Todos los datos han sido eliminados correctamente');
                    } catch (error) {
                      Alert.alert('Error', 'No se pudieron eliminar todos los datos');
                      console.error('Error al limpiar datos:', error);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const formatearTamaño = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <LoadingSpinner text="Procesando..." />;
  }

  return (
    <ScrollView style={styles.container}>
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
          <>
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

            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Hora de Recordatorio</Text>
              <View style={styles.timeInputContainer}>
                <Input
                  value={config.horaRecordatorio}
                  onChangeText={(value) => setConfig({ ...config, horaRecordatorio: value })}
                  placeholder="09:00"
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.permisosSection}>
          <Text style={styles.permisosTitle}>Estado de Permisos</Text>
          <View style={styles.permisosInfo}>
            <Text style={[
              styles.permisosStatus,
              { color: permisosNotificaciones.granted ? '#4CAF50' : '#F44336' }
            ]}>
              {permisosNotificaciones.granted ? '✅ Concedidos' : '❌ No concedidos'}
            </Text>
            {!permisosNotificaciones.granted && (
              <Button
                title="Solicitar Permisos"
                onPress={handleSolicitarPermisos}
                size="small"
                variant="outline"
              />
            )}
          </View>
        </View>
      </Card>

      {/* Configuración General */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>⚙️ General</Text>
        
        <OptionSelector
          title="Moneda"
          variant="cards"
          options={[
            { key: 'COP', label: 'Peso Colombiano', icon: '🇨🇴' },
            { key: 'USD', label: 'Dólar', icon: '🇺🇸' },
            { key: 'EUR', label: 'Euro', icon: '🇪🇺' }
          ]}
          selectedKey={config.moneda}
          onSelect={(key) => setConfig({ ...config, moneda: key })}
          style={styles.optionSelector}
        />

        <OptionSelector
          title="Formato de Fecha"
          variant="buttons"
          options={[
            { key: 'dd/MM/yyyy', label: 'DD/MM/AAAA', icon: '📅' },
            { key: 'MM/dd/yyyy', label: 'MM/DD/AAAA', icon: '🗓️' },
            { key: 'yyyy-MM-dd', label: 'AAAA-MM-DD', icon: '📆' }
          ]}
          selectedKey={config.formatoFecha}
          onSelect={(key) => setConfig({ ...config, formatoFecha: key })}
          style={styles.optionSelector}
        />

        <OptionSelector
          title="Tema de la Aplicación"
          variant="cards"
          options={[
            { key: 'claro', label: 'Claro', icon: '☀️', color: '#FF9800' },
            { key: 'oscuro', label: 'Oscuro', icon: '🌙', color: '#424242' },
            { key: 'sistema', label: 'Sistema', icon: '📱', color: '#2196F3' }
          ]}
          selectedKey={config.tema}
          onSelect={(key) => setConfig({ ...config, tema: key as any })}
          style={styles.optionSelector}
        />
      </Card>

      {/* Respaldo y Sincronización */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>💾 Respaldo de Datos</Text>
        
        <View style={styles.configItem}>
          <View style={styles.configInfo}>
            <Text style={styles.configLabel}>Respaldo Automático</Text>
            <Text style={styles.configDescription}>
              Crear respaldos automáticamente cada semana
            </Text>
          </View>
          <Switch
            value={config.respaldoAutomatico}
            onValueChange={(value) => setConfig({ ...config, respaldoAutomatico: value })}
          />
        </View>

        <View style={styles.backupActions}>
          <Button
            title="📤 Crear Respaldo Manual"
            onPress={handleCrearRespaldo}
            variant="outline"
            style={styles.backupButton}
          />
          <Button
            title="📥 Restaurar desde Respaldo"
            onPress={() => Alert.alert('Próximamente', 'Esta funcionalidad estará disponible pronto')}
            variant="outline"
            style={styles.backupButton}
          />
        </View>
      </Card>

      {/* Información de la App */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>ℹ️ Información</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Versión</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Clientes</Text>
          <Text style={styles.infoValue}>{state.clientes.length}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Préstamos</Text>
          <Text style={styles.infoValue}>{state.prestamos.length}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Cuotas</Text>
          <Text style={styles.infoValue}>{state.cuotas.length}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Pagos</Text>
          <Text style={styles.infoValue}>{state.pagos.length}</Text>
        </View>
      </Card>

      {/* Zona de Peligro */}
      <Card style={styles.dangerCard}>
        <Text style={styles.sectionTitle}>⚠️ Zona de Peligro</Text>
        
        <Button
          title="🔄 Resetear Configuración"
          onPress={handleResetearConfiguracion}
          variant="outline"
          style={styles.warningButton}
        />
        
        <Button
          title="🗑️ Eliminar Todos los Datos"
          onPress={handleLimpiarDatos}
          variant="outline"
          style={styles.dangerButton}
        />
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

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  configInfo: {
    flex: 1,
    marginRight: 16,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  configDescription: {
    fontSize: 14,
    color: '#666',
  },
  numberInput: {
    width: 80,
    textAlign: 'center',
  },
  timeInput: {
    width: 100,
    textAlign: 'center',
  },
  permisosSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  permisosTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  permisosInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permisosStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionSelector: {
    marginBottom: 16,
  },
  backupActions: {
    gap: 12,
  },
  backupButton: {
    marginBottom: 0,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dangerZone: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  dangerCard: {
    margin: 16,
    marginBottom: 0,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  numberInputContainer: {
    width: 80,
  },
  timeInputContainer: {
    width: 100,
  },
  warningButton: {
    marginBottom: 12,
    borderColor: '#FF9800',
  },
  dangerButton: {
    marginBottom: 12,
    borderColor: '#F44336',
  },
  bottomSpacing: {
    height: 32,
  },
});