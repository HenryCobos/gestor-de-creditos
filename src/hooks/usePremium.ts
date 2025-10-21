import { useEffect, useState, useCallback } from 'react';
import Constants from 'expo-constants';
import { PayPalService, PayPalProduct } from '../services/payments';
import { TrialNotificationService } from '../services/trialNotifications';
import { AnalyticsService } from '../services/analytics';
import { userService } from '../services/userService';
import { DevToolsService } from '../services/devTools';
import { ReviewService } from '../services/reviewService';

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
  expiryDate?: string;
  productType?: string;
  pendingPayment?: {
    product: PayPalProduct;
    result: any;
  };
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
    expiryDate: undefined,
    productType: undefined,
    pendingPayment: undefined,
  });
  const [packages, setPackages] = useState<PayPalProduct[]>([]);

  useEffect(() => {
    // Inicializar PayPal service
    (async () => {
      try {
        await PayPalService.initialize();
        console.log('✅ PayPal service initialized in usePremium');
      } catch (error) {
        console.log('ℹ️ PayPal service not available');
      }
    })();
  }, []);

  // Función para actualizar el estado premium
  const updatePremiumState = useCallback(async () => {
    try {
      console.log('🔄 Actualizando estado premium con PayPal...');
      
      const premiumStatus = await PayPalService.getPremiumStatus();
      
      console.log('📊 Estado premium detectado:', premiumStatus);
      
      setState((s) => {
        console.log('🔄 Estado premium actualizado:', { 
          anterior: s.isPremium, 
          nuevo: premiumStatus.isPremium,
          cambió: s.isPremium !== premiumStatus.isPremium 
        });
        return { 
          ...s, 
          isPremium: premiumStatus.isPremium, 
          customerInfo: premiumStatus,
          expiryDate: premiumStatus.expiryDate,
          productType: premiumStatus.productType
        };
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

        // Inicializar PayPal si no está inicializado
        console.log('📱 Entorno:', { isDev: __DEV__ });
        
        await PayPalService.initialize();
        console.log('✅ PayPal inicializado en usePremium');

        // Cargar estado inicial
        console.log('📊 Cargando estado premium...');
        await updatePremiumState();

        console.log('📦 Obteniendo productos PayPal...');
        const pkgs = PayPalService.getProducts();
        console.log('📦 Productos obtenidos:', pkgs.length);
        
        console.log('📦 Detalles COMPLETOS de productos:', JSON.stringify(pkgs.map((pkg: PayPalProduct) => ({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          currency: pkg.currency,
          type: pkg.type
        })), null, 2));
        
        console.log('💰 ANÁLISIS DE PRECIOS:');
        pkgs.forEach((pkg: PayPalProduct) => {
          console.log(`  - ${pkg.type}:`);
          console.log(`    name: "${pkg.name}"`);
          console.log(`    price: ${pkg.price}`);
          console.log(`    currency: "${pkg.currency}"`);
        });
        
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

  // Permitir recargar explícitamente las ofertas (para botón Reintentar)
  const reloadOfferings = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loading: true }));
      const pkgs = PayPalService.getProducts();
      setPackages(pkgs);
    } catch (e: any) {
      setState((s) => ({ ...s, error: e?.message ?? 'Error recargando productos' }));
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  // Listener para actualizar estado premium cuando cambie
  useEffect(() => {
    const interval = setInterval(() => {
      updatePremiumState();
    }, 10000); // Verificar cada 10 segundos (menos frecuente)

    return () => clearInterval(interval);
  }, [updatePremiumState]);

  // Verificar milestone de Premium periódicamente (una vez al día)
  useEffect(() => {
    const checkPremiumMilestone = async () => {
      if (state.isPremium) {
        await ReviewService.triggerOnPremiumMilestone();
      }
    };

    // Verificar al montar el componente
    checkPremiumMilestone();

    // Verificar cada 24 horas
    const interval = setInterval(checkPremiumMilestone, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.isPremium]);

  const subscribe = useCallback(async (pkg: PayPalProduct) => {
    console.log('🛒 subscribe llamado con:', pkg);
    setState((s) => ({ ...s, loading: true, error: null }));
    
    try {
      // Verificar si el paquete es válido
      if (!pkg) {
        throw new Error('No se seleccionó un producto de suscripción');
      }
      
      console.log('🛒 Iniciando pago con PayPal:', pkg.id);
      
      const result = await PayPalService.processPayment(pkg);
      
      if (result.success) {
        if (result.requiresWebView && result.approvalUrl) {
          console.log('🌐 Pago requiere WebView, guardando estado pendiente');
          
          setState((s) => ({ 
            ...s, 
            loading: false,
            pendingPayment: {
              product: pkg,
              result: result
            }
          }));
          
          return { 
            success: true, 
            requiresWebView: true,
            approvalUrl: result.approvalUrl,
            orderId: result.orderId
          } as const;
        } else {
          console.log('🛒 Resultado de pago exitoso:', result.transactionId);
          
          setState((s) => ({ 
            ...s, 
            isPremium: true, 
            customerInfo: { transactionId: result.transactionId, product: pkg },
            loading: false
          }));
          
          // Actualizar estado premium inmediatamente
          await updatePremiumState();
          
          // Trackear conversión a premium
          await AnalyticsService.trackPremiumConverted(pkg.id, pkg.price);
          
          // Trackear para sistema de reseñas
          await ReviewService.trackPremiumSubscribed();
          
          console.log('✅ Usuario convertido a Premium');
          
          return { success: true } as const;
        }
      } else {
        throw new Error(result.error || 'Pago falló');
      }
    } catch (e: any) {
      console.error('❌ Error en pago:', e);
      const errorMessage = e?.message ?? 'No se pudo completar el pago';
      setState((s) => ({ ...s, error: errorMessage, loading: false }));
      return { success: false, error: { message: errorMessage } } as const;
    }
  }, [updatePremiumState]);

  const completePaymentFromWebView = useCallback(async (transactionId: string, product: PayPalProduct) => {
    console.log('🎉 Completando pago desde WebView:', transactionId);
    
    try {
      // Primero capturar la orden aprobada
      const captureResult = await PayPalService.captureApprovedOrder(transactionId);
      
      if (captureResult.success) {
        console.log('✅ Orden capturada exitosamente:', captureResult.transactionId);
        
        // Guardar estado premium en AsyncStorage ANTES de actualizar el estado
        if (captureResult.transactionId) {
          await PayPalService.savePremiumState(product, captureResult.transactionId);
          console.log('💾 Estado premium guardado en AsyncStorage');
        } else {
          console.warn('⚠️ No se pudo guardar estado premium: transactionId no disponible');
        }
        
        setState((s) => ({ 
          ...s, 
          isPremium: true, 
          customerInfo: { transactionId: captureResult.transactionId, product: product },
          loading: false,
          pendingPayment: undefined
        }));
        
        // Trackear conversión a premium
        await AnalyticsService.trackPremiumConverted(product.id, product.price);
        
        // Trackear para sistema de reseñas
        await ReviewService.trackPremiumSubscribed();
        
        console.log('✅ Pago completado exitosamente desde WebView');
      } else {
        throw new Error(captureResult.error || 'Error capturando la orden');
      }
    } catch (error: any) {
      console.error('❌ Error completando pago desde WebView:', error);
      setState((s) => ({ 
        ...s, 
        error: error.message,
        loading: false,
        pendingPayment: undefined
      }));
    }
  }, []);

  const cancelPaymentFromWebView = useCallback(() => {
    console.log('❌ Pago cancelado desde WebView');
    setState((s) => ({ 
      ...s, 
      loading: false,
      pendingPayment: undefined,
      error: 'Pago cancelado por el usuario'
    }));
  }, []);

  const restore = useCallback(async () => {
    console.log('🔄 Iniciando restauración con PayPal...');
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      console.log('🔄 Verificando compras existentes...');
      const result = await PayPalService.restorePurchases();
      
      if (result.success) {
        console.log('🔄 Restauración exitosa');
        
        // Actualizar estado premium
        await updatePremiumState();
        
        setState((s) => ({ 
          ...s, 
          isPremium: true,
          loading: false
        }));
        
        console.log('✅ Restauración exitosa - Premium activado');
        return { success: true } as const;
      } else {
        console.log('ℹ️ No se encontraron compras para restaurar');
        setState((s) => ({ ...s, error: result.error || 'No se encontraron compras para restaurar' }));
        return { success: false, error: { message: result.error || 'No se encontraron compras para restaurar' } } as const;
      }
    } catch (e: any) {
      console.error('❌ Error en restauración:', e);
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
        pkg.type === 'monthly' || 
        pkg.id.includes('monthly')
      );
      
      console.log('🎁 Paquetes disponibles:', packages.length);
      console.log('🎁 Trial package encontrado:', !!trialPackage);
      
      if (!trialPackage) {
        console.log('⚠️ No se encontró producto mensual, usando trial simulado');
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
      
      console.log('🎁 Iniciando trial gratuito con producto:', trialPackage.id);
      
      // Procesar pago del trial (simulado en desarrollo)
      const result = await PayPalService.processPayment(trialPackage);
      
      if (result.success) {
        console.log('🎁 Resultado de trial exitoso:', result.transactionId);
      
        setState((s) => ({ 
          ...s, 
          isPremium: true, 
          customerInfo: { transactionId: result.transactionId, product: trialPackage },
          subscriptionStatus: 'trial',
          trialDaysRemaining: 3,
          canStartTrial: false
        }));
      
        // Actualizar estado premium inmediatamente
        await updatePremiumState();
        
        // Programar notificaciones de trial
        await TrialNotificationService.startTrial();
        
        // Trackear inicio de trial
        await AnalyticsService.trackTrialStarted();
        
        console.log('✅ Trial gratuito iniciado exitosamente');
        
        return { success: true } as const;
      } else {
        throw new Error(result.error || 'Trial falló');
      }
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
    expiryDate: state.expiryDate,
    productType: state.productType,
    pendingPayment: state.pendingPayment,
    subscribe,
    restore,
    startTrial,
    updatePremiumState,
    reloadOfferings,
    completePaymentFromWebView,
    cancelPaymentFromWebView,
  };
}


