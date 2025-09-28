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

  const showPaywall = useCallback((feature: FeatureKey, customContext?: Partial<PaywallContext>) => {
    const gate = isFeatureAllowed(feature, {
      clientesCount: state.clientes.length,
      prestamosActivosCount: state.prestamos.filter(p => p.estado === 'activo').length,
      isPremium: premium.isPremium,
    });

    // No mostrar paywall si es premium
    if (premium.isPremium) return false;

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

  const handleSubscribe = useCallback(async (pkg: any) => {
    const result = await premium.subscribe(pkg);
    if (result.success) {
      hidePaywall();
    }
    return result;
  }, [premium, hidePaywall]);

  const handleStartTrial = useCallback(async () => {
    const result = await premium.startTrial();
    if (result.success) {
      hidePaywall();
    }
    return result;
  }, [premium, hidePaywall]);

  const handleRestore = useCallback(async () => {
    const result = await premium.restore();
    if (result.success) {
      hidePaywall();
    }
    return result;
  }, [premium, hidePaywall]);

  return {
    visible,
    context,
    showPaywall,
    hidePaywall,
    handleSubscribe,
    handleStartTrial,
    handleRestore,
    loading: premium.loading,
    packages: premium.packages,
  };
}
