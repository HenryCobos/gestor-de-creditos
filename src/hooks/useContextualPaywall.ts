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
    console.log('🔍 Verificando estado Premium ULTRA-DETALLADO antes de mostrar paywall...');
    console.log('🔍 Feature solicitado:', feature);
    
    await premium.updatePremiumState();

    // Verificar nuevamente después de la actualización
    const currentPremiumStatus = premium.isPremium;
    console.log('📊 Estado Premium actual:', currentPremiumStatus);

    // Verificar también el customerInfo directamente
    const customerInfo = premium.customerInfo;
    const hasActiveSubscription = customerInfo?.entitlements?.active?.["pro"] != null;
    console.log('🔍 Verificación adicional - hasActiveSubscription:', hasActiveSubscription);
    console.log('🔍 CustomerInfo completo:', {
      customerInfo: !!customerInfo,
      entitlements: customerInfo?.entitlements,
      activeEntitlements: customerInfo?.entitlements?.active,
      activeSubscriptions: customerInfo?.activeSubscriptions
    });

    // Verificación adicional: si no detecta suscripción, forzar una verificación más
    if (!currentPremiumStatus && !hasActiveSubscription) {
      console.log('🔄 No se detectó suscripción, forzando verificación adicional...');
      await premium.updatePremiumState();
      
      // Verificar una vez más
      const finalCustomerInfo = premium.customerInfo;
      const finalHasActiveSubscription = finalCustomerInfo?.entitlements?.active?.["pro"] != null;
      
      console.log('🔍 Verificación final:', {
        finalHasActiveSubscription,
        finalCustomerInfo: !!finalCustomerInfo,
        finalEntitlements: finalCustomerInfo?.entitlements?.active
      });
      
      if (finalHasActiveSubscription) {
        console.log('✅ Suscripción detectada en verificación adicional');
        return false;
      }
    }

    const gate = isFeatureAllowed(feature, {
      clientesCount: state.clientes.length,
      prestamosActivosCount: state.prestamos.filter(p => p.estado === 'activo').length,
      isPremium: currentPremiumStatus || hasActiveSubscription,
    });

    console.log('🔍 Gate result:', gate);

    // No mostrar paywall si es premium (verificación doble)
    if (currentPremiumStatus || hasActiveSubscription) {
      console.log('✅ Usuario ya es Premium - no mostrando paywall');
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
    // Acepta tanto paquetes de RevenueCat como planes locales (PricingPlan)
    let packageToPurchase = selected;

    // Si viene de SimplePaywall (PricingPlan), mapear al paquete de RevenueCat
    if (selected && typeof selected === 'object' && 'revenueCatId' in selected && !('product' in selected)) {
      const revenueCatId = (selected as any).revenueCatId;
      const found = (premium.packages || []).find((p: any) => p?.identifier === revenueCatId);
      if (found) {
        packageToPurchase = found;
      } else {
        console.warn('Paquete de RevenueCat no encontrado para', revenueCatId);
      }
    }

    console.log('🛒 Iniciando compra desde paywall...');
    let shouldClose = false;
    
    try {
      const result = await premium.subscribe(packageToPurchase);
      
      if (result.success) {
        console.log('✅ Compra exitosa - marcando para cerrar paywall');
        shouldClose = true;
      } else {
        console.log('❌ Error en compra:', result.error);
        
        // Si el error es "ya suscrito", también cerrar
        const errorMsg = (result.error?.message || '').toLowerCase();
        if (errorMsg.includes('already') || errorMsg.includes('suscrito') || errorMsg.includes('subscribed') || errorMsg.includes('purchased') || errorMsg.includes('cancelad')) {
          console.log('✅ Usuario ya suscrito detectado - marcando para cerrar paywall');
          shouldClose = true;
        }
      }
      
      return result;
    } catch (error: any) {
      console.log('❌ Excepción en compra:', error);
      // Si hay cualquier error relacionado con "ya comprado", cerrar igual
      const errorMsg = (error?.message || '').toLowerCase();
      if (errorMsg.includes('already') || errorMsg.includes('suscrito') || errorMsg.includes('subscribed') || errorMsg.includes('purchased')) {
        console.log('✅ Error de ya suscrito capturado - marcando para cerrar');
        shouldClose = true;
      }
      return { success: false, error };
    } finally {
      // SIEMPRE actualizar el estado y potencialmente cerrar el paywall
      console.log('🔄 Actualizando estado Premium final...');
      await premium.updatePremiumState();
      
      // Esperar para asegurar que el estado se propague
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Verificar si debe cerrar
      if (shouldClose) {
        console.log('✅ CERRANDO PAYWALL DEFINITIVAMENTE');
        hidePaywall();
      } else {
        // Verificar si hay suscripción activa de todas formas
        const customerInfo = premium.customerInfo;
        const hasActiveSubscription = customerInfo?.entitlements?.active?.["pro"] != null;
        if (hasActiveSubscription) {
          console.log('✅ Suscripción activa detectada en verificación final - CERRANDO');
          hidePaywall();
        }
      }
    }
  }, [premium, hidePaywall]);

  const handleStartTrial = useCallback(async () => {
    console.log('🎁 Iniciando trial desde paywall...');
    const result = await premium.startTrial();
    
    if (result.success) {
      console.log('✅ Trial iniciado exitosamente - cerrando paywall');
      // Pequeño delay para que el usuario vea el feedback
      setTimeout(() => {
        hidePaywall();
      }, 500);
    } else {
      console.log('❌ Error iniciando trial:', result.error);
    }
    
    return result;
  }, [premium, hidePaywall]);

  const handleRestore = useCallback(async () => {
    console.log('🔄 Iniciando restauración AGRESIVA de compras...');
    
    try {
      const result = await premium.restore();
      console.log('🔄 Resultado de restauración:', result);
      
      return result;
    } catch (error: any) {
      console.log('❌ Error en restauración:', error);
      return { success: false, error };
    } finally {
      // SIEMPRE actualizar el estado Premium al final, sin importar el resultado
      console.log('🔄 Actualizando estado Premium después de restaurar...');
      await premium.updatePremiumState();
      
      // Esperar más tiempo para asegurar que el estado se propague
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Segunda actualización para asegurar
      await premium.updatePremiumState();
      
      // Esperar un poco más
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar el customerInfo actual directamente
      const customerInfo = premium.customerInfo;
      const hasActiveSubscription = customerInfo?.entitlements?.active?.["pro"] != null;
      
      console.log('🔍 Verificación FINAL después de restaurar:', {
        hasActiveSubscription,
        entitlements: Object.keys(customerInfo?.entitlements?.active || {}),
        isPremium: premium.isPremium,
      });
      
      // Si tiene suscripción activa, cerrar el paywall DEFINITIVAMENTE
      if (hasActiveSubscription || premium.isPremium) {
        console.log('✅✅✅ SUSCRIPCIÓN ACTIVA CONFIRMADA - CERRANDO PAYWALL DEFINITIVAMENTE');
        hidePaywall();
      } else {
        console.log('ℹ️ No se encontró suscripción activa para restaurar - el paywall permanece abierto');
      }
    }
  }, [premium, hidePaywall]);

  const handleRetry = useCallback(async () => {
    console.log('🔄 Reintentando cargar productos...');
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

  return {
    visible,
    context,
    showPaywall,
    hidePaywall,
    handleSubscribe,
    handleStartTrial,
    handleRestore,
    handleRetry,
    loading: premium.loading,
    error: premium.error,
    packages: premium.packages,
  };
}
