import { useState, useEffect, useCallback, useRef } from 'react';
import { AdMobService } from '../services/admobService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  LAST_INTERSTITIAL: 'lastInterstitialShown',
  DAILY_INTERSTITIALS: 'dailyInterstitialCount',
  LAST_RESET_DATE: 'lastResetDate',
};

// Políticas de AdMob
const AD_POLICIES = {
  MIN_INTERSTITIAL_INTERVAL: 30 * 1000, // 30 segundos mínimo entre intersticiales
  MAX_DAILY_INTERSTITIALS: 20, // Máximo 20 intersticiales por día
};

interface InterstitialState {
  isReady: boolean;
  isLoading: boolean;
  lastShown: number | null;
  dailyCount: number;
}

export const useInterstitialAds = () => {
  const [state, setState] = useState<InterstitialState>({
    isReady: false,
    isLoading: false,
    lastShown: null,
    dailyCount: 0,
  });

  const initializationRef = useRef(false);

  // Inicializar datos del almacenamiento
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;
    
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [lastShown, dailyCount, lastResetDate] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LAST_INTERSTITIAL),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_INTERSTITIALS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE),
      ]);

      const today = new Date().toDateString();
      const storedDate = lastResetDate || '';

      // Resetear contador diario si es un nuevo día
      const currentDailyCount = storedDate === today ? parseInt(dailyCount || '0', 10) : 0;
      
      if (storedDate !== today) {
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.DAILY_INTERSTITIALS, '0'],
          [STORAGE_KEYS.LAST_RESET_DATE, today],
        ]);
      }

      setState(prev => ({
        ...prev,
        lastShown: lastShown ? parseInt(lastShown, 10) : null,
        dailyCount: currentDailyCount,
        isReady: AdMobService.isInterstitialReady(),
      }));
    } catch (error) {
      console.error('Error al cargar datos de intersticiales:', error);
    }
  };

  // Verificar si se puede mostrar un intersticial
  const canShowInterstitial = useCallback((): boolean => {
    // Si AdMob no está disponible, no mostrar intersticiales
    if (!AdMobService.isAdMobAvailable()) {
      return false;
    }

    const now = Date.now();
    
    // Verificar límite diario
    if (state.dailyCount >= AD_POLICIES.MAX_DAILY_INTERSTITIALS) {
      console.log('📊 Límite diario de intersticiales alcanzado');
      return false;
    }

    // Verificar intervalo mínimo
    if (state.lastShown && (now - state.lastShown) < AD_POLICIES.MIN_INTERSTITIAL_INTERVAL) {
      const remainingTime = Math.ceil((AD_POLICIES.MIN_INTERSTITIAL_INTERVAL - (now - state.lastShown)) / 1000);
      console.log(`⏰ Intersticial disponible en ${remainingTime} segundos`);
      return false;
    }

    // Verificar si el anuncio está listo
    if (!AdMobService.isInterstitialReady()) {
      console.log('⚠️ Intersticial no está listo');
      return false;
    }

    return true;
  }, [state.lastShown, state.dailyCount]);

  // Mostrar intersticial con validaciones
  const showInterstitial = useCallback(async (context?: string): Promise<boolean> => {
    try {
      // Si AdMob no está disponible, simular éxito pero no mostrar nada
      if (!AdMobService.isAdMobAvailable()) {
        console.log('📱 AdMob no disponible, omitiendo intersticial');
        return false;
      }

      if (!canShowInterstitial()) {
        return false;
      }

      setState(prev => ({ ...prev, isLoading: true }));

      const success = await AdMobService.showInterstitialAd();
      
      if (success) {
        const now = Date.now();
        const newDailyCount = state.dailyCount + 1;

        // Actualizar estado local
        setState(prev => ({
          ...prev,
          lastShown: now,
          dailyCount: newDailyCount,
          isReady: false,
          isLoading: false,
        }));

        // Guardar en almacenamiento
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.LAST_INTERSTITIAL, now.toString()],
          [STORAGE_KEYS.DAILY_INTERSTITIALS, newDailyCount.toString()],
        ]);

        console.log(`✅ Intersticial mostrado exitosamente${context ? ` en: ${context}` : ''}`);
        return true;
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Error al mostrar intersticial:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [canShowInterstitial, state.dailyCount]);

  // Funciones de conveniencia para diferentes contextos
  const showOnNavigation = useCallback(() => showInterstitial('navigation'), [showInterstitial]);
  const showOnAction = useCallback(() => showInterstitial('user_action'), [showInterstitial]);
  const showOnAppResume = useCallback(() => showInterstitial('app_resume'), [showInterstitial]);

  // Verificar disponibilidad con contexto
  const getAvailabilityInfo = useCallback(() => {
    const now = Date.now();
    const canShow = canShowInterstitial();
    
    let reason = '';
    if (!canShow) {
      if (!AdMobService.isAdMobAvailable()) {
        reason = 'AdMob no disponible';
      } else if (state.dailyCount >= AD_POLICIES.MAX_DAILY_INTERSTITIALS) {
        reason = `Límite diario alcanzado (${state.dailyCount}/${AD_POLICIES.MAX_DAILY_INTERSTITIALS})`;
      } else if (state.lastShown && (now - state.lastShown) < AD_POLICIES.MIN_INTERSTITIAL_INTERVAL) {
        const remainingTime = Math.ceil((AD_POLICIES.MIN_INTERSTITIAL_INTERVAL - (now - state.lastShown)) / 1000);
        reason = `Espera ${remainingTime} segundos`;
      } else if (!AdMobService.isInterstitialReady()) {
        reason = 'Anuncio no está listo';
      }
    }

    return {
      canShow,
      reason,
      dailyCount: state.dailyCount,
      maxDaily: AD_POLICIES.MAX_DAILY_INTERSTITIALS,
      isReady: AdMobService.isInterstitialReady(),
      isAdMobAvailable: AdMobService.isAdMobAvailable(),
    };
  }, [canShowInterstitial, state.dailyCount, state.lastShown]);

  return {
    // Estado
    isReady: state.isReady && canShowInterstitial(),
    isLoading: state.isLoading,
    dailyCount: state.dailyCount,
    
    // Acciones
    showInterstitial,
    showOnNavigation,
    showOnAction,
    showOnAppResume,
    
    // Información
    canShow: canShowInterstitial(),
    getAvailabilityInfo,
  };
};