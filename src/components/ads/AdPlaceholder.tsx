import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

interface AdPlaceholderProps {
  type: 'banner' | 'intersticial';
  style?: any;
  onPress?: () => void;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  type,
  style,
  onPress
}) => {
  if (type === 'banner') {
    return (
      <View style={[styles.bannerContainer, style]}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>📺 ANUNCIO BANNER</Text>
          <Text style={styles.bannerSubtitle}>320x50 - Aquí aparecerá un banner de AdMob</Text>
          <View style={styles.bannerDemo}>
            <View style={styles.demoIcon}>
              <Text style={styles.demoIconText}>🏪</Text>
            </View>
            <View style={styles.demoContent}>
              <Text style={styles.demoTitle}>Tu Negocio Aquí</Text>
              <Text style={styles.demoDescription}>Promociona tu producto</Text>
            </View>
            <TouchableOpacity style={styles.demoButton}>
              <Text style={styles.demoButtonText}>VER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Placeholder para intersticial (se mostraría como overlay)
  return (
    <View style={styles.interstitialContainer}>
      <View style={styles.interstitialContent}>
        <Text style={styles.interstitialTitle}>📱 ANUNCIO INTERSTICIAL</Text>
        <Text style={styles.interstitialSubtitle}>Pantalla completa - Se muestra entre navegaciones</Text>
        
        <View style={styles.interstitialDemo}>
          <View style={styles.interstitialHeader}>
            <Text style={styles.interstitialAppName}>App Increíble</Text>
            <TouchableOpacity style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.interstitialBody}>
            <View style={styles.interstitialIcon}>
              <Text style={styles.interstitialIconText}>🎮</Text>
            </View>
            <Text style={styles.interstitialAppTitle}>¡Descarga Ahora!</Text>
            <Text style={styles.interstitialAppDesc}>
              La mejor app para gestionar tu tiempo
            </Text>
            <TouchableOpacity style={styles.interstitialButton}>
              <Text style={styles.interstitialButtonText}>INSTALAR</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {onPress && (
          <TouchableOpacity style={styles.testButton} onPress={onPress}>
            <Text style={styles.testButtonText}>🎯 Simular Intersticial</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Banner Styles
  bannerContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  bannerContent: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196f3',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    width: width - 32,
    minHeight: 70,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 10,
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.7,
  },
  bannerDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  demoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#ff9800',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  demoIconText: {
    fontSize: 16,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  demoDescription: {
    fontSize: 10,
    color: '#666',
  },
  demoButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Intersticial Styles
  interstitialContainer: {
    margin: 16,
  },
  interstitialContent: {
    backgroundColor: '#fff3e0',
    borderWidth: 2,
    borderColor: '#ff9800',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
  },
  interstitialTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f57c00',
    textAlign: 'center',
    marginBottom: 4,
  },
  interstitialSubtitle: {
    fontSize: 12,
    color: '#f57c00',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  interstitialDemo: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  interstitialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  interstitialAppName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 12,
  },
  interstitialBody: {
    padding: 24,
    alignItems: 'center',
  },
  interstitialIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#e91e63',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  interstitialIconText: {
    fontSize: 32,
  },
  interstitialAppTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  interstitialAppDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  interstitialButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 6,
  },
  interstitialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 