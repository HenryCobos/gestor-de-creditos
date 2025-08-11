import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { BannerAd as GoogleBannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AdMobService } from '../../services/admobService';
import { AdPlaceholder } from './AdPlaceholder';

interface BannerAdProps {
  size?: BannerAdSize;
  style?: any;
  onError?: (error: string) => void;
  onReceiveAd?: () => void;
  showPlaceholder?: boolean;
}

export const BannerAd: React.FC<BannerAdProps> = ({
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
  style,
  onError,
  onReceiveAd,
  showPlaceholder = true
}) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  const handleAdReceived = () => {
    setIsAdLoaded(true);
    setAdError(null);
    onReceiveAd?.();
    console.log('📺 Banner cargado exitosamente');
  };

  const handleAdFailedToLoad = (error: any) => {
    setIsAdLoaded(false);
    setAdError(error?.message || error || 'Error desconocido');
    onError?.(error?.message || error || 'Error desconocido');
    console.warn('⚠️ Error al cargar banner:', error);
  };

  // Si AdMob no está disponible, mostrar placeholder si está habilitado
  if (!AdMobService.isAdMobAvailable()) {
    if (showPlaceholder) {
      return <AdPlaceholder type="banner" style={style} />;
    }
    return null;
  }

  // Si hay error y placeholders están habilitados, mostrar placeholder
  if (adError && showPlaceholder) {
    return <AdPlaceholder type="banner" style={style} />;
  }

  // Si hay error y placeholders están deshabilitados, no mostrar nada
  if (adError && !showPlaceholder) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <GoogleBannerAd
        unitId={AdMobService.getBannerAdUnitId()}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false, // Cumple con GDPR si el usuario da consentimiento
        }}
        onAdLoaded={handleAdReceived}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
      
      {/* Indicador de carga opcional */}
      {!isAdLoaded && !adError && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando anuncio...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  banner: {
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width - 20,
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  topBanner: {
    marginTop: 0,
    marginBottom: 10,
  },
  bottomBanner: {
    marginTop: 10,
    marginBottom: 0,
  },
});

// Componente especializado para banner superior
export const TopBannerAd: React.FC<Omit<BannerAdProps, 'size'>> = (props) => (
  <BannerAd 
    {...props} 
    size={BannerAdSize.BANNER} 
    style={[styles.topBanner, props.style]}
  />
);

// Componente especializado para banner inferior
export const BottomBannerAd: React.FC<Omit<BannerAdProps, 'size'>> = (props) => (
  <BannerAd 
    {...props} 
    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} 
    style={[styles.bottomBanner, props.style]}
  />
);