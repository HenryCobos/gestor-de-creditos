import { useState, useEffect, useCallback } from 'react';
import { usePremium } from './usePremium';
import { useApp } from '../context/AppContext';
import { AnalyticsService } from '../services/analytics';

interface ConversionMetrics {
  trialStarted: boolean;
  trialDaysRemaining: number;
  clientsCreated: number;
  loansCreated: number;
  reportsGenerated: number;
  lastPaywallShown: Date | null;
  paywallShownCount: number;
  conversionAttempts: number;
}

export function useConversionFlow() {
  const premium = usePremium();
  const { state } = useApp();
  const [metrics, setMetrics] = useState<ConversionMetrics>({
    trialStarted: false,
    trialDaysRemaining: 0,
    clientsCreated: 0,
    loansCreated: 0,
    reportsGenerated: 0,
    lastPaywallShown: null,
    paywallShownCount: 0,
    conversionAttempts: 0,
  });

  // Actualizar métricas cuando cambian los datos
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      clientsCreated: state.clientes.length,
      loansCreated: state.prestamos.length,
      trialStarted: premium.subscriptionStatus === 'trial',
      trialDaysRemaining: premium.trialDaysRemaining,
    }));
  }, [state.clientes.length, state.prestamos.length, premium.subscriptionStatus, premium.trialDaysRemaining]);

  // Determinar si mostrar paywall preventivo
  const shouldShowPreventivePaywall = useCallback(() => {
    if (premium.isPremium) return false;
    
    // Solo mostrar paywall preventivo cuando realmente se alcance el límite
    // No interferir con la creación normal de clientes/préstamos
    return false;
  }, [premium.isPremium, state.clientes.length, state.prestamos.length]);

  // Determinar si mostrar paywall de bloqueo
  const shouldShowBlockingPaywall = useCallback(() => {
    if (premium.isPremium) return false;
    
    const clientsAtLimit = state.clientes.length >= 10;
    const loansAtLimit = state.prestamos.filter(p => p.estado === 'activo').length >= 10;
    
    return clientsAtLimit || loansAtLimit;
  }, [premium.isPremium, state.clientes.length, state.prestamos.length]);

  // Determinar urgencia del trial
  const getTrialUrgency = useCallback(() => {
    if (!premium.isPremium || premium.subscriptionStatus !== 'trial') return null;
    
    const daysLeft = premium.trialDaysRemaining;
    
    if (daysLeft <= 1) return 'critical';
    if (daysLeft <= 2) return 'high';
    return 'medium';
  }, [premium.isPremium, premium.subscriptionStatus, premium.trialDaysRemaining]);

  // Generar contexto para paywall
  const getPaywallContext = useCallback(() => {
    const clientsCount = state.clientes.length;
    const loansCount = state.prestamos.filter(p => p.estado === 'activo').length;
    
    if (clientsCount >= 8) {
      return {
        title: '¡Casi alcanzas el límite de clientes!',
        message: `Has creado ${clientsCount} de 10 clientes. Sin Premium perderás acceso a todos.`,
        icon: '👥',
        featureName: 'Clientes',
        currentUsage: clientsCount,
        limit: 10,
      };
    }
    
    if (loansCount >= 8) {
      return {
        title: '¡Casi alcanzas el límite de préstamos!',
        message: `Tienes ${loansCount} de 10 préstamos activos. Sin Premium perderás acceso a todos.`,
        icon: '💰',
        featureName: 'Préstamos Activos',
        currentUsage: loansCount,
        limit: 10,
      };
    }
    
    return {
      title: 'Desbloquea límites con Premium',
      message: 'Accede a clientes y préstamos ilimitados',
      icon: '🚀',
      featureName: 'Funciones Premium',
      currentUsage: 0,
      limit: 0,
    };
  }, [state.clientes.length, state.prestamos.length]);

  // Registrar evento de conversión
  const trackConversionEvent = useCallback(async (event: string, data?: any) => {
    console.log('Conversion Event:', event, data);
    await AnalyticsService.trackEvent(event, data);
  }, []);

  // Mostrar paywall y registrar métricas
  const showPaywall = useCallback(async (type: 'preventive' | 'blocking') => {
    setMetrics(prev => ({
      ...prev,
      lastPaywallShown: new Date(),
      paywallShownCount: prev.paywallShownCount + 1,
    }));
    
    await trackConversionEvent('paywall_shown', { type });
    await AnalyticsService.trackPaywallShown('conversion_flow', type);
  }, [trackConversionEvent]);

  // Intentar conversión
  const attemptConversion = useCallback(async (planId: string) => {
    setMetrics(prev => ({
      ...prev,
      conversionAttempts: prev.conversionAttempts + 1,
    }));
    
    await trackConversionEvent('conversion_attempt', { planId });
    await AnalyticsService.trackPaywallConverted('conversion_flow', planId);
  }, [trackConversionEvent]);

  // Obtener recomendación de momento para paywall
  const getOptimalPaywallMoment = useCallback(() => {
    const urgency = getTrialUrgency();
    const isNearLimit = shouldShowPreventivePaywall();
    const isAtLimit = shouldShowBlockingPaywall();
    
    if (isAtLimit) return 'immediate';
    if (urgency === 'critical') return 'high_priority';
    if (isNearLimit) return 'preventive';
    if (urgency === 'high') return 'medium_priority';
    return 'low_priority';
  }, [getTrialUrgency, shouldShowPreventivePaywall, shouldShowBlockingPaywall]);

  return {
    metrics,
    shouldShowPreventivePaywall,
    shouldShowBlockingPaywall,
    getTrialUrgency,
    getPaywallContext,
    showPaywall,
    attemptConversion,
    getOptimalPaywallMoment,
    trackConversionEvent,
  };
}
