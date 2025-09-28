import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
} from 'react-native';
import { Button, Card } from '../ui';
import { useUser } from '../../hooks/useUser';

const { width, height } = Dimensions.get('window');

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, updatePreferences, getAnalytics } = useUser();

  const handlePreferenceChange = async (key: keyof NonNullable<typeof user>['preferences'], value: any) => {
    try {
      await updatePreferences({ [key]: value });
    } catch (error) {
      console.error('Error actualizando preferencia:', error);
    }
  };

  if (!user) return null;

  const analytics = getAnalytics();

  console.log('UserProfileModal render - visible:', visible);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Card style={styles.modalContent}>
            {/* Header fijo */}
            <View style={styles.header}>
              <Text style={styles.title}>Mi Perfil</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Contenido scrolleable */}
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Información del Usuario */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Información del Usuario</Text>
                
                <View style={styles.infoDisplay}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Usuario ID:</Text>
                    <Text style={styles.infoValue}>{user.id}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Device ID:</Text>
                    <Text style={styles.infoValue}>{user.deviceId}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Instalación:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(user.installationDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Última actividad:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(user.lastActiveDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Estadísticas */}
              {analytics && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📊 Estadísticas de Uso</Text>
                  
                  <View style={styles.infoDisplay}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Días usando la app:</Text>
                      <Text style={styles.infoValue}>{analytics.daysSinceInstallation}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Veces abierta:</Text>
                      <Text style={styles.infoValue}>{analytics.totalAppOpens}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Funciones usadas:</Text>
                      <Text style={styles.infoValue}>{analytics.featuresUsed}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Preferencias */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ Preferencias</Text>
                
                <View style={styles.preferenceRow}>
                  <View style={styles.preferenceInfo}>
                    <Text style={styles.preferenceLabel}>Notificaciones</Text>
                    <Text style={styles.preferenceDescription}>
                      Recibir recordatorios de pagos y actualizaciones
                    </Text>
                  </View>
                  <Switch
                    value={user.preferences.notifications}
                    onValueChange={(value) => handlePreferenceChange('notifications', value)}
                  />
                </View>
                
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Tema</Text>
                  <View style={styles.themeOptions}>
                    {(['light', 'dark', 'auto'] as const).map((theme) => (
                      <TouchableOpacity
                        key={theme}
                        style={[
                          styles.themeOption,
                          user.preferences.theme === theme && styles.themeOptionActive
                        ]}
                        onPress={() => handlePreferenceChange('theme', theme)}
                      >
                        <Text style={[
                          styles.themeOptionText,
                          user.preferences.theme === theme && styles.themeOptionTextActive
                        ]}>
                          {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Automático'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Información sobre Suscripciones */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💎 Suscripciones</Text>
                
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionText}>
                    📱 Las suscripciones se manejan automáticamente por el sistema.
                  </Text>
                  <Text style={styles.subscriptionText}>
                    🔒 No se requiere registro - tu dispositivo se identifica automáticamente.
                  </Text>
                  <Text style={styles.subscriptionText}>
                    💳 Puedes gestionar tu suscripción desde la configuración de la app.
                  </Text>
                </View>
              </View>

              {/* Botón Cerrar */}
              <View style={styles.footer}>
                <Button
                  title="Cerrar"
                  onPress={onClose}
                  style={styles.closeButtonBottom}
                />
              </View>
            </ScrollView>
          </Card>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContainer: {
    width: width * 0.95,
    maxHeight: height * 0.9,
    maxWidth: 400,
    zIndex: 10000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoDisplay: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  preferenceRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  themeOptionActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  themeOptionText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  themeOptionTextActive: {
    color: '#fff',
  },
  subscriptionInfo: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
  },
  subscriptionText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  closeButtonBottom: {
    width: '100%',
  },
});