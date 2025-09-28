import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface ConversionMetrics {
  // Funnel metrics
  appOpened: number;
  onboardingCompleted: number;
  trialStarted: number;
  trialCompleted: number;
  premiumConverted: number;
  
  // Engagement metrics
  clientsCreated: number;
  loansCreated: number;
  reportsGenerated: number;
  paywallShown: number;
  paywallConverted: number;
  
  // Time metrics
  timeToTrialStart: number; // minutes
  timeToConversion: number; // minutes
  sessionDuration: number; // minutes
  
  // Revenue metrics
  totalRevenue: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
}

export class AnalyticsService {
  private static sessionId: string = '';
  private static userId: string = '';
  private static events: AnalyticsEvent[] = [];
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Generar session ID único
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Obtener o generar user ID
      const storedUserId = await AsyncStorage.getItem('@creditos_app:user_id');
      this.userId = storedUserId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!storedUserId) {
        await AsyncStorage.setItem('@creditos_app:user_id', this.userId);
      }

      // Cargar eventos previos
      await this.loadStoredEvents();
      
      this.isInitialized = true;
      console.log('Analytics inicializado:', { sessionId: this.sessionId, userId: this.userId });
    } catch (error) {
      console.error('Error inicializando analytics:', error);
    }
  }

  static async trackEvent(event: string, properties?: Record<string, any>): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        event,
        timestamp: Date.now(),
        properties,
        userId: this.userId,
        sessionId: this.sessionId,
      };

      this.events.push(analyticsEvent);
      
      // Guardar en storage
      await this.saveEvents();
      
      // Log para debugging
      console.log('Analytics Event:', analyticsEvent);
      
      // En producción, aquí enviarías a tu servicio de analytics
      // await this.sendToAnalyticsService(analyticsEvent);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Eventos específicos de conversión
  static async trackAppOpened(): Promise<void> {
    await this.trackEvent('app_opened', {
      timestamp: Date.now(),
    });
  }

  static async trackOnboardingStarted(): Promise<void> {
    await this.trackEvent('onboarding_started');
  }

  static async trackOnboardingCompleted(): Promise<void> {
    await this.trackEvent('onboarding_completed');
  }

  static async trackTrialStarted(): Promise<void> {
    await this.trackEvent('trial_started', {
      trialDays: 3,
    });
  }

  static async trackTrialCompleted(): Promise<void> {
    await this.trackEvent('trial_completed');
  }

  static async trackPremiumConverted(planId: string, price: number): Promise<void> {
    await this.trackEvent('premium_converted', {
      planId,
      price,
      currency: 'USD',
    });
  }

  static async trackPaywallShown(context: string, type: 'preventive' | 'blocking'): Promise<void> {
    await this.trackEvent('paywall_shown', {
      context,
      type,
    });
  }

  static async trackPaywallConverted(context: string, planId: string): Promise<void> {
    await this.trackEvent('paywall_converted', {
      context,
      planId,
    });
  }

  static async trackFeatureUsed(feature: string): Promise<void> {
    await this.trackEvent('feature_used', {
      feature,
    });
  }

  static async trackLimitReached(feature: string, limit: number): Promise<void> {
    await this.trackEvent('limit_reached', {
      feature,
      limit,
    });
  }

  // Métricas de conversión
  static async getConversionMetrics(): Promise<ConversionMetrics> {
    try {
      const events = await this.getStoredEvents();
      
      const metrics: ConversionMetrics = {
        appOpened: events.filter(e => e.event === 'app_opened').length,
        onboardingCompleted: events.filter(e => e.event === 'onboarding_completed').length,
        trialStarted: events.filter(e => e.event === 'trial_started').length,
        trialCompleted: events.filter(e => e.event === 'trial_completed').length,
        premiumConverted: events.filter(e => e.event === 'premium_converted').length,
        clientsCreated: events.filter(e => e.event === 'feature_used' && e.properties?.feature === 'create_cliente').length,
        loansCreated: events.filter(e => e.event === 'feature_used' && e.properties?.feature === 'create_prestamo').length,
        reportsGenerated: events.filter(e => e.event === 'feature_used' && e.properties?.feature === 'generate_report').length,
        paywallShown: events.filter(e => e.event === 'paywall_shown').length,
        paywallConverted: events.filter(e => e.event === 'paywall_converted').length,
        timeToTrialStart: this.calculateTimeToTrialStart(events),
        timeToConversion: this.calculateTimeToConversion(events),
        sessionDuration: this.calculateSessionDuration(events),
        totalRevenue: this.calculateTotalRevenue(events),
        averageRevenuePerUser: 0, // Se calcularía con más datos
        lifetimeValue: 0, // Se calcularía con más datos
      };

      return metrics;
    } catch (error) {
      console.error('Error calculando métricas:', error);
      return this.getEmptyMetrics();
    }
  }

  private static calculateTimeToTrialStart(events: AnalyticsEvent[]): number {
    const appOpened = events.find(e => e.event === 'app_opened');
    const trialStarted = events.find(e => e.event === 'trial_started');
    
    if (!appOpened || !trialStarted) return 0;
    
    return (trialStarted.timestamp - appOpened.timestamp) / (1000 * 60); // minutos
  }

  private static calculateTimeToConversion(events: AnalyticsEvent[]): number {
    const appOpened = events.find(e => e.event === 'app_opened');
    const converted = events.find(e => e.event === 'premium_converted');
    
    if (!appOpened || !converted) return 0;
    
    return (converted.timestamp - appOpened.timestamp) / (1000 * 60); // minutos
  }

  private static calculateSessionDuration(events: AnalyticsEvent[]): number {
    const appOpened = events.filter(e => e.event === 'app_opened');
    if (appOpened.length === 0) return 0;
    
    const firstOpen = appOpened[0].timestamp;
    const lastEvent = events[events.length - 1]?.timestamp || firstOpen;
    
    return (lastEvent - firstOpen) / (1000 * 60); // minutos
  }

  private static calculateTotalRevenue(events: AnalyticsEvent[]): number {
    const conversions = events.filter(e => e.event === 'premium_converted');
    return conversions.reduce((total, event) => {
      return total + (event.properties?.price || 0);
    }, 0);
  }

  private static getEmptyMetrics(): ConversionMetrics {
    return {
      appOpened: 0,
      onboardingCompleted: 0,
      trialStarted: 0,
      trialCompleted: 0,
      premiumConverted: 0,
      clientsCreated: 0,
      loansCreated: 0,
      reportsGenerated: 0,
      paywallShown: 0,
      paywallConverted: 0,
      timeToTrialStart: 0,
      timeToConversion: 0,
      sessionDuration: 0,
      totalRevenue: 0,
      averageRevenuePerUser: 0,
      lifetimeValue: 0,
    };
  }

  private static async loadStoredEvents(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@creditos_app:analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error cargando eventos almacenados:', error);
      this.events = [];
    }
  }

  private static async saveEvents(): Promise<void> {
    try {
      await AsyncStorage.setItem('@creditos_app:analytics_events', JSON.stringify(this.events));
    } catch (error) {
      console.error('Error guardando eventos:', error);
    }
  }

  private static async getStoredEvents(): Promise<AnalyticsEvent[]> {
    try {
      const stored = await AsyncStorage.getItem('@creditos_app:analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error obteniendo eventos almacenados:', error);
      return [];
    }
  }

  // Método para limpiar datos (útil para testing)
  static async clearData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@creditos_app:analytics_events');
      await AsyncStorage.removeItem('@creditos_app:user_id');
      this.events = [];
      this.sessionId = '';
      this.userId = '';
      this.isInitialized = false;
    } catch (error) {
      console.error('Error limpiando datos de analytics:', error);
    }
  }
}
