import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// ===== CONFIGURACIÓN DE ADMOB =====

const AD_UNIT_IDS = {
  // IDs de producción para iOS
  BANNER_IOS: 'ca-app-pub-4349408589058649/8514512662',
  INTERSTITIAL_IOS: 'ca-app-pub-4349408589058649/4802482459',
  
  // IDs de prueba (para desarrollo)
  BANNER_TEST: TestIds.BANNER,
  INTERSTITIAL_TEST: TestIds.INTERSTITIAL,
};

// ===== CLASE PRINCIPAL DE ADMOB =====

export class AdMobService {
  private static isInitialized = false;
  private static interstitialAd: InterstitialAd | null = null;

  /**
   * Inicializa el servicio de AdMob
   */
  static async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('AdMob ya está inicializado');
        return;
      }

      // Configurar dispositivo de prueba para desarrollo
      if (__DEV__) {
        console.log('✅ AdMob configurado en modo desarrollo');
      }

      this.isInitialized = true;
      console.log('✅ AdMob inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar AdMob:', error);
      throw error;
    }
  }

  /**
   * Obtiene el ID del banner según la plataforma
   */
  static getBannerAdUnitId(): string {
    if (__DEV__) {
      return AD_UNIT_IDS.BANNER_TEST;
    }
    
    return Platform.OS === 'ios' 
      ? AD_UNIT_IDS.BANNER_IOS 
      : AD_UNIT_IDS.BANNER_TEST;
  }

  /**
   * Obtiene el ID del interstitial según la plataforma
   */
  static getInterstitialAdUnitId(): string {
    if (__DEV__) {
      return AD_UNIT_IDS.INTERSTITIAL_TEST;
    }
    
    return Platform.OS === 'ios' 
      ? AD_UNIT_IDS.INTERSTITIAL_IOS 
      : AD_UNIT_IDS.INTERSTITIAL_TEST;
  }

  /**
   * Carga un anuncio intersticial
   */
  static async loadInterstitialAd(): Promise<void> {
    try {
      if (!this.isInitialized) return;
      
      const adUnitId = this.getInterstitialAdUnitId();
      this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId);
      
      // Configurar event listeners
      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('🎯 Intersticial cargado');
      });
      
      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.warn('⚠️ Error en intersticial:', error);
      });
      
      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('📱 Intersticial cerrado');
        // Recargar para el próximo uso
        this.loadInterstitialAd();
      });
      
      // Cargar el anuncio
      await this.interstitialAd.load();
      
    } catch (error) {
      console.warn('⚠️ Error cargando intersticial:', error);
    }
  }

  /**
   * Muestra un anuncio intersticial
   */
  static async showInterstitialAd(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.interstitialAd) {
        console.log('📱 Intersticial no disponible');
        return false;
      }
      
      const isLoaded = this.interstitialAd.loaded;
      if (isLoaded) {
        await this.interstitialAd.show();
        return true;
      } else {
        console.log('📱 Intersticial no cargado');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Error mostrando intersticial:', error);
      return false;
    }
  }

  /**
   * Verifica si el intersticial está listo
   */
  static isInterstitialReady(): boolean {
    return this.isInitialized && this.interstitialAd?.loaded === true;
  }

  /**
   * Limpia recursos de AdMob
   */
  static cleanup(): void {
    try {
      if (this.interstitialAd) {
        this.interstitialAd = null;
      }
      console.log('🧹 AdMob limpiado');
    } catch (error) {
      console.warn('⚠️ Error limpiando AdMob:', error);
    }
  }
}

// Exportar constantes útiles
export const BANNER_SIZES = BannerAdSize;
export { BannerAd, BannerAdSize, TestIds };