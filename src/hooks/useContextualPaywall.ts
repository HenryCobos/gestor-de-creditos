import { useState, useCallback } from 'react';
import { usePremium } from './usePremium';
import { useApp } from '../context/AppContext';
import { isFeatureAllowed, FeatureKey } from '../utils/featureGating';

interface PaywallContext {
  title: string;
  message: string;
  icon: string;
  featureName: string;
  currentUsage?: number;
  limit?: number;
}

export function useContextualPaywall() {
  const [visible, setVisible] = useState(false);
  const [context, setContext] = useState<PaywallContext | null>(null);
  const premium = usePremium();
  const { state } = useApp();

  const showPaywall = useCallback(async (feature: FeatureKey, customContext?: Partial<PaywallContext>) => {
    // Verificar estado Premium actualizado antes de mostrar paywall
    await premium.updatePremiumState();

    // Verificar nuevamente después de la actualización
    const currentPremiumStatus = premium.isPremium;

    // Verificar también el customerInfo directamente
    const customerInfo = premium.customerInfo;
    const hasActiveSubscription = customerInfo?.transactionId != null;

    // Verificación adicional: si no detecta suscripción, forzar una verificación más
    if (!currentPremiumStatus && !hasActiveSubscription) {
      await premium.updatePremiumState();
      
      // Verificar una vez más
      const finalCustomerInfo = premium.customerInfo;
      const finalHasActiveSubscription = finalCustomerInfo?.transactionId != null;
      
      if (finalHasActiveSubscription) {
        return false;
      }
    }

    const gate = isFeatureAllowed(feature, {
      clientesCount: state.clientes.length,
      prestamosActivosCount: state.prestamos.filter(p => p.estado === 'activo').length,
      isPremium: currentPremiumStatus || hasActiveSubscription,
    });

    // No mostrar paywall si es premium (verificación doble)
    if (currentPremiumStatus || hasActiveSubscription) {
      return false;
    }

    const defaultContexts: Record<FeatureKey, PaywallContext> = {
      create_cliente: {
        title: gate.allowed ? '¡Casi alcanzas el límite de clientes!' : '¡Límite de clientes alcanzado!',
        message: gate.allowed 
          ? `Has usado ${state.clientes.length} de 10 clientes. Mejora a Premium para clientes ilimitados y no perder acceso a tus datos.`
          : `Has alcanzado el límite de 10 clientes. Mejora a Premium para clientes ilimitados y no perder acceso a tus datos.`,
        icon: '👥',
        featureName: 'Clientes',
        currentUsage: state.clientes.length,
        limit: 10,
      },
      create_prestamo: {
        title: gate.allowed ? '¡Casi alcanzas el límite de préstamos!' : '¡Límite de préstamos alcanzado!',
        message: gate.allowed 
          ? `Has usado ${state.prestamos.filter(p => p.estado === 'activo').length} de 10 préstamos activos. Mejora a Premium para préstamos ilimitados y no perder acceso a tus datos.`
          : `Has alcanzado el límite de 10 préstamos activos. Mejora a Premium para préstamos ilimitados y no perder acceso a tus datos.`,
        icon: '💰',
        featureName: 'Préstamos Activos',
        currentUsage: state.prestamos.filter(p => p.estado === 'activo').length,
        limit: 10,
      },
      reportes_basicos: {
        title: 'Reportes básicos incluidos',
        message: 'Los reportes básicos están incluidos en la versión gratuita.',
        icon: '📊',
        featureName: 'Reportes Básicos',
      },
      reportes_avanzados: {
        title: 'Reportes avanzados son Premium',
        message: 'Desbloquea reportes avanzados con gráficos, análisis detallados y exportación a PDF/Excel.',
        icon: '📈',
        featureName: 'Reportes Avanzados',
      },
      backup_auto: {
        title: 'Exportación de reportes incluida',
        message: 'La exportación de reportes en PDF está incluida en todas las versiones.',
        icon: '📄',
        featureName: 'Exportación de Reportes',
      },
      notificaciones_personalizadas: {
        title: 'Notificaciones personalizadas son Premium',
        message: 'Personaliza horarios y mensajes de notificaciones.',
        icon: '🔔',
        featureName: 'Notificaciones Personalizadas',
      },
      analisis_riesgo: {
        title: 'Análisis de riesgo es Premium',
        message: 'Evalúa el riesgo crediticio de tus clientes con herramientas avanzadas.',
        icon: '📈',
        featureName: 'Análisis de Riesgo',
      },
      integracion_calendario: {
        title: 'Integración con calendario es Premium',
        message: 'Sincroniza con Google Calendar y otros calendarios.',
        icon: '📅',
        featureName: 'Integración con Calendario',
      },
      exportacion_avanzada: {
        title: 'Exportación avanzada es Premium',
        message: 'Exporta datos en PDF, Excel y otros formatos.',
        icon: '📤',
        featureName: 'Exportación Avanzada',
      },
      soporte_prioritario: {
        title: 'Soporte prioritario es Premium',
        message: 'Recibe soporte prioritario y respuesta rápida.',
        icon: '💬',
        featureName: 'Soporte Prioritario',
      },
    };

    const paywallContext = {
      ...defaultContexts[feature],
      ...customContext,
    };

    setContext(paywallContext);
    setVisible(true);
    return true;
  }, [state.clientes.length, state.prestamos, premium.isPremium]);

  const hidePaywall = useCallback(() => {
    setVisible(false);
    setContext(null);
  }, []);

  const handleSubscribe = useCallback(async (selected: any) => {
    let shouldClose = false;
    
    try {
      // Si viene de ContextualPaywall (PayPalProduct), usar directamente
      if (selected && typeof selected === 'object' && 'type' in selected && 'price' in selected) {
        const result = await premium.subscribe(selected);
        
        if (result.success) {
          // Solo cerrar si NO requiere WebView
          if (!result.requiresWebView) {
            shouldClose = true;
          } else {
            console.log('🌐 Pago requiere WebView, manteniendo paywall abierto');
            shouldClose = false;
          }
        } else {
          // Si el error es "ya suscrito", también cerrar
          const errorMsg = (result.error?.message || '').toLowerCase();
          if (errorMsg.includes('already') || errorMsg.includes('suscrito') || errorMsg.includes('subscribed') || errorMsg.includes('purchased') || errorMsg.includes('cancelad')) {
            shouldClose = true;
          }
        }
        
        return result;
      }
      
      // Si viene de SimplePaywall (PricingPlan), convertir a PayPalProduct
      if (selected && typeof selected === 'object' && 'revenueCatId' in selected && !('product' in selected)) {
        const paypalProduct = {
          id: selected.id,
          name: selected.name,
          price: selected.price,
          currency: 'USD',
          type: selected.period as 'monthly' | 'yearly'
        };
        
        const result = await premium.subscribe(paypalProduct);
        
        if (result.success) {
          // Solo cerrar si NO requiere WebView
          if (!result.requiresWebView) {
            shouldClose = true;
          } else {
            console.log('🌐 Pago requiere WebView, manteniendo paywall abierto');
            shouldClose = false;
          }
        } else {
          // Si el error es "ya suscrito", también cerrar
          const errorMsg = (result.error?.message || '').toLowerCase();
          if (errorMsg.includes('already') || errorMsg.includes('suscrito') || errorMsg.includes('subscribed') || errorMsg.includes('purchased') || errorMsg.includes('cancelad')) {
            shouldClose = true;
          }
        }
        
        return result;
      }
      
      // Si no se puede procesar, devolver error
      return { success: false, error: { message: 'Formato de producto no reconocido' } };
      
    } catch (error: any) {
      // Si hay cualquier error relacionado con "ya comprado", cerrar igual
      const errorMsg = (error?.message || '').toLowerCase();
      if (errorMsg.includes('already') || errorMsg.includes('suscrito') || errorMsg.includes('subscribed') || errorMsg.includes('purchased')) {
        shouldClose = true;
      }
      return { success: false, error };
    } finally {
      // SIEMPRE actualizar el estado y potencialmente cerrar el paywall
      await premium.updatePremiumState();
      
      // Esperar para asegurar que el estado se propague
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Verificar si debe cerrar
      if (shouldClose) {
        hidePaywall();
      } else {
        // Verificar si hay suscripción activa de todas formas
        const customerInfo = premium.customerInfo;
        const hasActiveSubscription = customerInfo?.transactionId != null;
        if (hasActiveSubscription) {
          hidePaywall();
        }
      }
    }
  }, [premium, hidePaywall]);

  const handleRestore = useCallback(async () => {
    try {
      const result = await premium.restore();
      return result;
    } catch (error: any) {
      return { success: false, error };
    } finally {
      // SIEMPRE actualizar el estado Premium al final, sin importar el resultado
      await premium.updatePremiumState();
      
      // Esperar más tiempo para asegurar que el estado se propague
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Segunda actualización para asegurar
      await premium.updatePremiumState();
      
      // Esperar un poco más
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar el customerInfo actual directamente
      const customerInfo = premium.customerInfo;
      const hasActiveSubscription = customerInfo?.transactionId != null;
      
      // Si tiene suscripción activa, cerrar el paywall DEFINITIVAMENTE
      if (hasActiveSubscription || premium.isPremium) {
        hidePaywall();
      }
    }
  }, [premium, hidePaywall]);

  const handleRetry = useCallback(async () => {
    try {
      // Recargar ofertas y estado para obtener los productos nuevamente
      if ((premium as any).reloadOfferings) {
        await (premium as any).reloadOfferings();
      }
      await premium.updatePremiumState();
    } catch (error) {
      console.error('❌ Error al reintentar:', error);
    }
  }, [premium]);

  const handleCompletePayment = useCallback(async (transactionId: string, product: any) => {
    try {
      // Completar el pago en usePremium
      await premium.completePaymentFromWebView(transactionId, product);
      
      // Cerrar el paywall después de un breve delay
      setTimeout(() => {
        hidePaywall();
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Error completando pago desde WebView:', error);
    }
  }, [premium, hidePaywall]);

  const handleCancelPayment = useCallback(() => {
    try {
      // Cancelar el pago en usePremium
      premium.cancelPaymentFromWebView();
      
      // Cerrar el paywall
      hidePaywall();
      
    } catch (error: any) {
      console.error('❌ Error cancelando pago desde WebView:', error);
    }
  }, [premium, hidePaywall]);

  return {
    visible,
    context,
    showPaywall,
    hidePaywall,
    handleSubscribe,
    handleRestore,
    handleRetry,
    loading: premium.loading,
    error: premium.error,
    packages: premium.packages,
    pendingPayment: premium.pendingPayment,
    onCompletePayment: handleCompletePayment,
    onCancelPayment: handleCancelPayment,
  };
}
