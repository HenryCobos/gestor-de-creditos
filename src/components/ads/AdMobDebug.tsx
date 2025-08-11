import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AdMobService } from '../../services/admobService';
import { useInterstitialAds } from '../../hooks/useInterstitialAds';

export const AdMobDebug: React.FC = () => {
  const [admobStatus, setAdmobStatus] = useState({
    isAvailable: false,
    isInterstitialReady: false,
  });

  const { getAvailabilityInfo, showInterstitial } = useInterstitialAds();

  useEffect(() => {
    const checkStatus = () => {
      setAdmobStatus({
        isAvailable: AdMobService.isAdMobAvailable(),
        isInterstitialReady: AdMobService.isInterstitialReady(),
      });
    };

    checkStatus();
    
    // Verificar cada 3 segundos
    const interval = setInterval(checkStatus, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleTestInterstitial = async () => {
    const info = getAvailabilityInfo();
    
    if (info.canShow) {
      const success = await showInterstitial();
      Alert.alert(
        'Resultado del Test',
        success ? '✅ Intersticial mostrado' : '❌ Error al mostrar intersticial'
      );
    } else {
      Alert.alert(
        'No Disponible',
        `❌ No se puede mostrar: ${info.reason}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Estado de AdMob</Text>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.label}>AdMob Disponible:</Text>
          <Text style={[styles.status, admobStatus.isAvailable ? styles.success : styles.error]}>
            {admobStatus.isAvailable ? '✅ SÍ' : '❌ NO'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.label}>Intersticial Listo:</Text>
          <Text style={[styles.status, admobStatus.isInterstitialReady ? styles.success : styles.error]}>
            {admobStatus.isInterstitialReady ? '✅ SÍ' : '❌ NO'}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, !admobStatus.isAvailable && styles.buttonDisabled]}
        onPress={handleTestInterstitial}
        disabled={!admobStatus.isAvailable}
      >
        <Text style={styles.buttonText}>🎯 Probar Intersticial</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        💡 Si AdMob no está disponible, es normal en Expo Go. 
        Los anuncios funcionarán completamente al compilar la app.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#495057',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  success: {
    color: '#28a745',
  },
  error: {
    color: '#dc3545',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
}); 