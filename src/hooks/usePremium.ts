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
        console.log('🚀 Inicializando usePremium...');
        
        // Inicializar herramientas de desarrollo
        await DevToolsService.initialize();
        
        // Verificar si debemos simular premium
        const shouldSimulate = DevToolsService.shouldSimulatePremium();
        console.log('🔧 Modo simulación:', shouldSimulate);
        
        if (shouldSimulate) {
          // Modo simulación
          console.log('🎭 Activando modo simulación premium');
          setState((s) => ({ 
            ...s, 
            isPremium: true, 
            loading: false,
            subscriptionStatus: 'active',
            trialDaysRemaining: 0,
            canStartTrial: false,
            offeringsLoaded: true,
          }));
          setPackages([]);
          console.log('✅ Modo simulación configurado');
          return;
        }

        // Inicializar RevenueCat si no está inicializado
        const isExpoGo = (Constants as any)?.appOwnership === 'expo';
        console.log('📱 Entorno:', { isExpoGo, isDev: __DEV__ });
        
        if (!isExpoGo) {
          const apiKey = (Constants?.expoConfig as any)?.extra?.REVENUECAT_API_KEY || (Constants?.manifest as any)?.extra?.REVENUECAT_API_KEY;
          console.log('🔑 API Key disponible:', !!apiKey);
          if (apiKey && !PurchasesService.initialized) {
            await PurchasesService.initialize(apiKey);
            console.log('✅ RevenueCat inicializado en usePremium');
          }
        }

        // Cargar estado inicial
        console.log('📊 Cargando estado premium...');
        await updatePremiumState();

        console.log('📦 Obteniendo ofertas...');
        const offering = await PurchasesService.getOfferings();
        const pkgs = offering?.availablePackages ?? [];
        console.log('📦 Paquetes obtenidos:', pkgs.length);
        setPackages(pkgs);
        setState((s) => ({ ...s, offeringsLoaded: true }));
        console.log('✅ usePremium inicializado correctamente');
      } catch (e: any) {
        console.error('❌ Error en usePremium:', e);
        setState((s) => ({ ...s, error: e?.message ?? 'Error cargando compras' }));
      } finally {
        console.log('🏁 Finalizando inicialización de usePremium');
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
    console.log('🛒 subscribe llamado con:', pkg);
    setState((s) => ({ ...s, loading: true, error: null }));
    
    // Timeout de seguridad para resetear loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout de seguridad - reseteando loading');
      setState((s) => ({ ...s, loading: false }));
    }, 10000); // 10 segundos timeout
    
    try {
      // Verificar si el paquete es válido
      if (!pkg) {
        throw new Error('No se seleccionó un paquete de suscripción');
      }
      
      console.log('🛒 Iniciando suscripción con paquete:', pkg.identifier || pkg.id);
      
      const info = await PurchasesService.purchasePackage(pkg);
      const isPro = info.entitlements.active["pro"] != null;
      console.log('🛒 Resultado de compra:', { isPro, entitlements: Object.keys(info.entitlements.active) });
      
      setState((s) => ({ ...s, isPremium: isPro, customerInfo: info }));
      
      // Actualizar estado premium inmediatamente
      await updatePremiumState();
      
      // Trackear conversión a premium
      if (isPro) {
        await AnalyticsService.trackPremiumConverted(pkg.identifier || pkg.id, pkg.product?.price || pkg.price);
        console.log('✅ Usuario convertido a Premium');
      }
      
      return { success: true } as const;
    } catch (e: any) {
      console.error('❌ Error en suscripción:', e);
      setState((s) => ({ ...s, error: e?.message ?? 'No se pudo completar la compra' }));
      return { success: false, error: e } as const;
    } finally {
      clearTimeout(timeoutId);
      console.log('🏁 Finalizando suscripción - reseteando loading');
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
    console.log('🎁 startTrial llamado');
    setState((s) => ({ ...s, loading: true, error: null }));
    
    // Timeout de seguridad para resetear loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout de seguridad - reseteando loading');
      setState((s) => ({ ...s, loading: false }));
    }, 10000); // 10 segundos timeout
    
    try {
      // En producción, el trial gratuito debe ser una suscripción real con período de prueba
      // Buscar el paquete con trial gratuito (generalmente el mensual)
      const trialPackage = packages.find(pkg => 
        pkg.packageType === 'MONTHLY' || 
        pkg.identifier.includes('monthly') ||
        pkg.product?.productIdentifier?.includes('monthly')
      );
      
      console.log('🎁 Paquetes disponibles:', packages.length);
      console.log('🎁 Trial package encontrado:', !!trialPackage);
      
      if (!trialPackage) {
        console.log('⚠️ No se encontró paquete de RevenueCat, usando trial simulado');
        // Si no hay paquetes reales, simular el trial
        setState((s) => ({ 
          ...s, 
          isPremium: true, 
          subscriptionStatus: 'trial',
          trialDaysRemaining: 3,
          canStartTrial: false,
          loading: false
        }));
        
        // Programar notificaciones de trial
        await TrialNotificationService.startTrial();
        
        // Trackear inicio de trial
        await AnalyticsService.trackTrialStarted();
        
        console.log('✅ Trial gratuito simulado iniciado exitosamente');
        return { success: true } as const;
      }
      
      console.log('🎁 Iniciando trial gratuito con paquete:', trialPackage.identifier);
      
      // Iniciar compra del paquete con trial gratuito
      const info = await PurchasesService.purchasePackage(trialPackage);
      const isPro = info.entitlements.active["pro"] != null;
      console.log('🎁 Resultado de trial:', { isPro, entitlements: Object.keys(info.entitlements.active) });
      
      setState((s) => ({ 
        ...s, 
        isPremium: isPro, 
        customerInfo: info,
        subscriptionStatus: isPro ? 'trial' : 'none',
        trialDaysRemaining: isPro ? 3 : 0,
        canStartTrial: !isPro
      }));
      
      // Actualizar estado premium inmediatamente
      await updatePremiumState();
      
      if (isPro) {
        // Programar notificaciones de trial
        await TrialNotificationService.startTrial();
        
        // Trackear inicio de trial
        await AnalyticsService.trackTrialStarted();
        
        console.log('✅ Trial gratuito iniciado exitosamente');
      }
      
      return { success: true } as const;
    } catch (e: any) {
      console.error('❌ Error iniciando trial gratuito:', e);
      setState((s) => ({ ...s, error: e?.message ?? 'No se pudo iniciar el trial gratuito' }));
      return { success: false, error: e } as const;
    } finally {
      clearTimeout(timeoutId);
      console.log('🏁 Finalizando trial - reseteando loading');
      setState((s) => ({ ...s, loading: false }));
    }
  }, [packages, updatePremiumState]);

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


