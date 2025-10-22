import { useEffect, useState, useCallback } from 'react';
import Constants from 'expo-constants';
import { PayPalService, PayPalProduct } from '../services/payments';
import { TrialNotificationService } from '../services/trialNotifications';
import { AnalyticsService } from '../services/analytics';
import { userService } from '../services/userService';
import { DevToolsService } from '../services/devTools';
import { ReviewService } from '../services/reviewService';
import { webViewService } from '../services/webViewService';

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
      const premiumStatus = await PayPalService.getPremiumStatus();
      
      setState((s) => {
        const changed = s.isPremium !== premiumStatus.isPremium;
        if (changed) {
          console.log('🔄 Estado premium actualizado:', { 
            anterior: s.isPremium, 
            nuevo: premiumStatus.isPremium
          });
        }
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
            offeringsLoaded: true,
          }));
          setPackages([]);
          return;
        }

        // Inicializar PayPal si no está inicializado
        await PayPalService.initialize();

        // Cargar estado inicial
        await updatePremiumState();

        const pkgs = PayPalService.getProducts();
        setPackages(pkgs);
        setState((s) => ({ ...s, offeringsLoaded: true }));
      } catch (e: any) {
        console.error('❌ Error en usePremium:', e);
        setState((s) => ({ ...s, error: e?.message ?? 'Error cargando compras' }));
      } finally {
        setState((s) => ({ ...s, loading: false }));
      }
    })();
  }, []); // Solo ejecutar una vez al montar

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

  // Listener para actualizar estado premium cuando cambie - SIN dependencias para evitar bucle
  useEffect(() => {
    const interval = setInterval(() => {
      updatePremiumState();
    }, 30000); // Verificar cada 30 segundos (menos frecuente)

    return () => clearInterval(interval);
  }, []); // Sin dependencias para evitar bucle infinito

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
          console.log('🌐 Pago requiere WebView, usando servicio global');
          console.log('🌐 Guardando pendingPayment:', {
            product: pkg,
            result: result
          });
          
          // Usar el servicio global para mostrar el WebView
          webViewService.showWebView({
            approvalUrl: result.approvalUrl,
            orderId: result.orderId || '',
            product: pkg
          });
          
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
  }, []); // Sin dependencias para evitar bucle infinito

  const completePaymentFromWebView = useCallback(async (orderId: string, product: PayPalProduct) => {
    console.log('🎉 COMPLETANDO PAGO DESDE WEBVIEW:');
    console.log('🎉 Order ID recibido:', orderId);
    console.log('🎉 Producto:', product);
    
    try {
      // Primero capturar la orden aprobada
      console.log('🎉 Llamando a captureApprovedOrder...');
      const captureResult = await PayPalService.captureApprovedOrder(orderId);
      console.log('🎉 Resultado de captura:', captureResult);
      
      if (captureResult.success) {
        console.log('✅ Orden capturada exitosamente:', captureResult.transactionId);
        
        // Guardar estado premium en AsyncStorage ANTES de actualizar el estado
        if (captureResult.transactionId) {
          const premiumData = {
            isPremium: true,
            productId: product.id,
            transactionId: captureResult.transactionId,
            purchaseDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + (product.type === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
            type: product.type
          };
          
          console.log('💾 Guardando estado premium:', premiumData);
          await PayPalService.savePremiumState(premiumData);
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
        
        console.log('✅ PAGO COMPLETADO EXITOSAMENTE - USUARIO AHORA ES PREMIUM');
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
  }, []); // Sin dependencias para evitar bucle infinito

  const startTrial = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    
    // Timeout de seguridad para resetear loading
    const timeoutId = setTimeout(() => {
      setState((s) => ({ ...s, loading: false }));
    }, 10000); // 10 segundos timeout
    
    try {
      // Buscar el paquete mensual para el trial
      const trialPackage = packages.find(pkg => 
        pkg.type === 'monthly' || 
        pkg.id.includes('monthly')
      );
      
      if (!trialPackage) {
        // Si no hay paquetes reales, simular el trial
        const trialData = {
          isPremium: false, // IMPORTANTE: Trial NO activa premium inmediatamente
          transactionId: `trial_${Date.now()}`,
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días
          productType: 'monthly',
          type: 'trial'
        };
        
        await PayPalService.savePremiumState(trialData);
        
        setState((s) => ({ 
          ...s, 
          isPremium: false, // Trial NO activa premium
          subscriptionStatus: 'trial',
          trialDaysRemaining: 3,
          canStartTrial: false,
          loading: false,
          expiryDate: trialData.expiryDate,
          productType: trialData.productType,
          customerInfo: trialData
        }));
        
        // Programar notificaciones de trial
        await TrialNotificationService.scheduleTrialNotifications();
        
        // Trackear inicio de trial
        AnalyticsService.trackEvent('trial_started', { trialDays: 3 });
        
        return { success: true } as const;
      }
      
      // Usar el paquete mensual real para el trial
      const trialData = {
        isPremium: false, // IMPORTANTE: Trial NO activa premium inmediatamente
        transactionId: `trial_${Date.now()}`,
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días
        productType: trialPackage.type,
        type: 'trial'
      };
      
      await PayPalService.savePremiumState(trialData);
      
      setState((s) => ({ 
        ...s, 
        isPremium: false, // Trial NO activa premium
        subscriptionStatus: 'trial',
        trialDaysRemaining: 3,
        canStartTrial: false,
        loading: false,
        expiryDate: trialData.expiryDate,
        productType: trialData.productType,
        customerInfo: trialData
      }));
      
      // Programar notificaciones de trial
      await TrialNotificationService.scheduleTrialNotifications();
      
      // Trackear inicio de trial
      AnalyticsService.trackEvent('trial_started', { trialDays: 3 });
      
      return { success: true } as const;
    } catch (e: any) {
      console.error('❌ Error iniciando trial gratuito:', e);
      setState((s) => ({ ...s, error: e?.message ?? 'No se pudo iniciar el trial gratuito' }));
      return { success: false, error: e } as const;
    } finally {
      clearTimeout(timeoutId);
      setState((s) => ({ ...s, loading: false }));
    }
  }, [packages]); // Solo packages, sin updatePremiumState para evitar bucle

  // Log del estado antes de retornar - REDUCIDO para evitar spam
  // console.log('🔄 usePremium retornando estado:', {
  //   pendingPayment: state.pendingPayment,
  //   isPremium: state.isPremium,
  //   loading: state.loading
  // });

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


