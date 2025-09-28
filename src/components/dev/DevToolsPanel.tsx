import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Switch } from 'react-native';
import { Card, Button, Input } from '../ui';
import { useDevTools } from '../../hooks/useDevTools';

export const DevToolsPanel: React.FC = () => {
  const { config, setSimulatePremium, setOverrideLimits, reset } = useDevTools();
  const [tempLimits, setTempLimits] = useState({
    maxClientes: config.overrideLimits.maxClientes.toString(),
    maxPrestamosActivos: config.overrideLimits.maxPrestamosActivos.toString(),
  });

  const handleSaveLimits = () => {
    const newLimits = {
      maxClientes: parseInt(tempLimits.maxClientes) || 10,
      maxPrestamosActivos: parseInt(tempLimits.maxPrestamosActivos) || 10,
    };

    if (newLimits.maxClientes < 1 || newLimits.maxPrestamosActivos < 1) {
      Alert.alert('Error', 'Los límites deben ser mayor a 0');
      return;
    }

    setOverrideLimits(newLimits);
    Alert.alert('Éxito', 'Límites actualizados');
  };

  const handleReset = () => {
    Alert.alert(
      'Resetear Configuración',
      '¿Estás seguro de que quieres resetear la configuración de desarrollo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Resetear', 
          style: 'destructive',
          onPress: () => {
            reset();
            setTempLimits({
              maxClientes: '10',
              maxPrestamosActivos: '10',
            });
          }
        }
      ]
    );
  };

  if (!config.showDevControls) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>🛠️ Herramientas de Desarrollo</Text>
      
      {/* Simular Premium */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado Premium</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>
            Simular Premium: {config.simulatePremium ? '✅ ACTIVADO' : '❌ DESACTIVADO'}
          </Text>
          <Switch
            value={config.simulatePremium}
            onValueChange={setSimulatePremium}
            trackColor={{ false: '#f4f3f4', true: '#4CAF50' }}
            thumbColor={config.simulatePremium ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Límites Personalizados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Límites Personalizados</Text>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Máx. Clientes:</Text>
          <Input
            value={tempLimits.maxClientes}
            onChangeText={(text) => setTempLimits(prev => ({ ...prev, maxClientes: text }))}
            keyboardType="numeric"
            placeholder="10"
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Máx. Préstamos:</Text>
          <Input
            value={tempLimits.maxPrestamosActivos}
            onChangeText={(text) => setTempLimits(prev => ({ ...prev, maxPrestamosActivos: text }))}
            keyboardType="numeric"
            placeholder="10"
          />
        </View>


        <Button
          title="Aplicar Límites"
          onPress={handleSaveLimits}
          size="small"
          style={styles.button}
        />
      </View>

      {/* Información Actual */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado Actual</Text>
        <Text style={styles.infoText}>
          • Premium: {config.simulatePremium ? 'SIMULADO' : 'REAL'}
        </Text>
        <Text style={styles.infoText}>
          • Límite Clientes: {config.overrideLimits.maxClientes}
        </Text>
        <Text style={styles.infoText}>
          • Límite Préstamos: {config.overrideLimits.maxPrestamosActivos}
        </Text>
      </View>

      {/* Botón Reset */}
      <Button
        title="🔄 Resetear Todo"
        onPress={handleReset}
        variant="outline"
        size="small"
        style={StyleSheet.flatten([styles.button, styles.resetButton])}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#856404',
    width: 120,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ffc107',
    borderWidth: 1,
  },
  button: {
    marginTop: 8,
  },
  resetButton: {
    borderColor: '#dc3545',
  },
  infoText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
});
