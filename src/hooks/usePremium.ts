import { useEffect, useState, useCallback } from 'react';
import Constants from 'expo-constants';
import { PurchasesService } from '../services/purchases';
import { TrialNotificationService } from '../services/trialNotifications';
import { AnalyticsService } from '../services/analytics';
import { userService } from '../services/userService';
import { DevToolsService } from '../services/devTools';

interface UsePremiumState {
  isPremium: boolean;
  loading: boolean;
  error: string | null;
  customerInfo: any | null;
  offeringsLoaded: boolean;
  trialDaysRemaining: number;
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'none';
  nextBillingDate: string | null;
  canStartTrial: boolean;
}

export function usePremium() {
  const [state, setState] = useState<UsePremiumState>({
    isPremium: false,
    loading: true,
    error: null,
    customerInfo: null,
    offeringsLoaded: false,
    trialDaysRemaining: 0,
    subscriptionStatus: 'none',
    nextBillingDate: null,
    canStartTrial: true,
  });
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    const isExpoGo = (Constants as any)?.appOwnership === 'expo';
    let sub: any;
    
    if (isExpoGo) return;
    
    // Configurar listener de forma asíncrona
    (async () => {
      try {
        const mod = await import('react-native-purchases');
        const Purchases = mod.default || mod;
        if (Purchases && Purchases.addPurchaserInfoUpdateListener) {
          sub = Purchases.addPurchaserInfoUpdateListener(async (info: any) => {
            const isPro = info.entitlements.active["pro"] != null;
            setState((s) => ({ ...s, isPremium: isPro, customerInfo: info }));
          });
        }
      } catch (error) {
        console.log('ℹ️ RevenueCat no disponible para listener');
      }
    })();
    
    return () => {
      if (sub && sub.remove) sub.remove();
    };
  }, []);

  // Función para actualizar el estado premium
  const updatePremiumState = useCallback(async () => {
    try {
      const info = await PurchasesService.getCustomerInfo();
      const isPro = info.entitlements.active["pro"] != null;
      setState((s) => {
        // Solo actualizar si el estado cambió
        if (s.isPremium !== isPro) {
          console.log('🔄 Estado premium actualizado:', { isPro, entitlements: Object.keys(info.entitlements.active) });
          return { ...s, isPremium: isPro, customerInfo: info };
        }
        return s;
      });
    } catch (error) {
      console.error('Error actualizando estado premium:', error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Inicializar herramientas de desarrollo
        await DevToolsService.initialize();
        
        // Verificar si debemos simular premium
        const shouldSimulate = DevToolsService.shouldSimulatePremium();
        
        if (shouldSimulate) {
          // Modo simulación
          setState((s) => ({ 
            ...s, 
            isPremium: true, 
            loading: false,
            subscriptionStatus: 'active',
            trialDaysRemaining: 0,
            canStartTrial: false,
          }));
          setPackages([]);
          setState((s) => ({ ...s, offeringsLoaded: true }));
          return;
        }

        // Inicializar RevenueCat si no está inicializado
        const isExpoGo = (Constants as any)?.appOwnership === 'expo';
        if (!isExpoGo) {
          const apiKey = (Constants?.expoConfig as any)?.extra?.REVENUECAT_API_KEY || (Constants?.manifest as any)?.extra?.REVENUECAT_API_KEY;
          if (apiKey && !PurchasesService.initialized) {
            await PurchasesService.initialize(apiKey);
            console.log('✅ RevenueCat inicializado en usePremium');
          }
        }

        // Cargar estado inicial
        await updatePremiumState();

        const offering = await PurchasesService.getOfferings();
        const pkgs = offering?.availablePackages ?? [];
        setPackages(pkgs);
        setState((s) => ({ ...s, offeringsLoaded: true }));
      } catch (e: any) {
        console.error('Error en usePremium:', e);
        setState((s) => ({ ...s, error: e?.message ?? 'Error cargando compras' }));
      } finally {
        setState((s) => ({ ...s, loading: false }));
      }
    })();
  }, [updatePremiumState]);

  // Listener para actualizar estado premium cuando cambie
  useEffect(() => {
    const interval = setInterval(() => {
      updatePremiumState();
    }, 10000); // Verificar cada 10 segundos (menos frecuente)

    return () => clearInterval(interval);
  }, [updatePremiumState]);

  const subscribe = useCallback(async (pkg: any) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const info = await PurchasesService.purchasePackage(pkg);
      const isPro = info.entitlements.active["pro"] != null;
      setState((s) => ({ ...s, isPremium: isPro, customerInfo: info }));
      
      // Actualizar estado premium inmediatamente
      await updatePremiumState();
      
      // Trackear conversión a premium
      if (isPro) {
        await AnalyticsService.trackPremiumConverted(pkg.identifier, pkg.product.price);
        console.log('✅ Usuario convertido a Premium');
      }
      
      return { success: true } as const;
    } catch (e: any) {
      setState((s) => ({ ...s, error: e?.message ?? 'No se pudo completar la compra' }));
      return { success: false, error: e } as const;
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [updatePremiumState]);

  const restore = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const info = await PurchasesService.restorePurchases();
      const isPro = info.entitlements.active["pro"] != null;
      setState((s) => ({ ...s, isPremium: isPro, customerInfo: info }));
      
      // Actualizar estado premium inmediatamente
      await updatePremiumState();
      
      return { success: true } as const;
    } catch (e: any) {
      setState((s) => ({ ...s, error: e?.message ?? 'No se pudo restaurar' }));
      return { success: false, error: e } as const;
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [updatePremiumState]);

  const startTrial = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // TODO: Implementar trial gratuito con RevenueCat
      // Por ahora simulamos el trial
      setState((s) => ({ 
        ...s, 
        isPremium: true, 
        subscriptionStatus: 'trial',
        trialDaysRemaining: 3,
        canStartTrial: false
      }));
      
      // Programar notificaciones de trial
      await TrialNotificationService.startTrial();
      
      // Trackear inicio de trial
      await AnalyticsService.trackTrialStarted();
      
      // RevenueCat maneja automáticamente el estado de la suscripción
      
      return { success: true } as const;
    } catch (e: any) {
      setState((s) => ({ ...s, error: e?.message ?? 'No se pudo iniciar el trial' }));
      return { success: false, error: e } as const;
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  return {
    isPremium: state.isPremium,
    loading: state.loading,
    error: state.error,
    customerInfo: state.customerInfo,
    packages,
    offeringsLoaded: state.offeringsLoaded,
    trialDaysRemaining: state.trialDaysRemaining,
    subscriptionStatus: state.subscriptionStatus,
    nextBillingDate: state.nextBillingDate,
    canStartTrial: state.canStartTrial,
    subscribe,
    restore,
    startTrial,
  };
}


