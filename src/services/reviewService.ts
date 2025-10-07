import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

// Claves de almacenamiento
const STORAGE_KEYS = {
  REVIEW_REQUESTED_COUNT: '@creditos_app:review_requested_count',
  LAST_REVIEW_REQUEST_DATE: '@creditos_app:last_review_request_date',
  REVIEW_GIVEN: '@creditos_app:review_given',
  USER_DECLINED_REVIEW: '@creditos_app:user_declined_review',
  // Tracking de eventos para condiciones
  LOANS_COMPLETED: '@creditos_app:loans_completed_count',
  PAYMENTS_MARKED: '@creditos_app:payments_marked_count',
  REPORTS_EXPORTED: '@creditos_app:reports_exported_count',
  DAYS_ACTIVE: '@creditos_app:days_active_count',
  APP_OPENS: '@creditos_app:app_opens_count',
  PREMIUM_SINCE: '@creditos_app:premium_since',
};

// Configuración del sistema de reseñas
const REVIEW_CONFIG = {
  MAX_REQUESTS: 3, // Máximo número de veces que pediremos reseña
  COOLDOWN_DAYS: 30, // Días de espera entre solicitudes
  MIN_DAYS_SINCE_INSTALL: 3, // Días mínimos desde instalación
  MIN_APP_OPENS: 5, // Aperturas mínimas de la app
};

// Tipos de triggers para reseñas
export type ReviewTrigger = 
  | 'loan_completed'
  | 'payment_milestone'
  | 'report_exported'
  | 'premium_milestone'
  | 'usage_milestone'
  | 'client_milestone';

interface ReviewConditions {
  loansCompleted?: number;
  paymentsMarked?: number;
  reportsExported?: number;
  daysActive?: number;
  appOpens?: number;
  daysSincePremium?: number;
}

export class ReviewService {
  // ============= TRACKING DE EVENTOS =============
  
  /**
   * Incrementar contador de préstamos completados
   */
  static async trackLoanCompleted(): Promise<void> {
    try {
      const count = await this.getLoansCompletedCount();
      await AsyncStorage.setItem(STORAGE_KEYS.LOANS_COMPLETED, (count + 1).toString());
      console.log('📊 Préstamos completados:', count + 1);
    } catch (error) {
      console.error('Error tracking loan completed:', error);
    }
  }

  /**
   * Incrementar contador de pagos marcados
   */
  static async trackPaymentMarked(): Promise<void> {
    try {
      const count = await this.getPaymentsMarkedCount();
      await AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS_MARKED, (count + 1).toString());
      console.log('📊 Pagos marcados:', count + 1);
    } catch (error) {
      console.error('Error tracking payment marked:', error);
    }
  }

  /**
   * Incrementar contador de reportes exportados
   */
  static async trackReportExported(): Promise<void> {
    try {
      const count = await this.getReportsExportedCount();
      await AsyncStorage.setItem(STORAGE_KEYS.REPORTS_EXPORTED, (count + 1).toString());
      console.log('📊 Reportes exportados:', count + 1);
    } catch (error) {
      console.error('Error tracking report exported:', error);
    }
  }

  /**
   * Incrementar contador de aperturas de app
   */
  static async trackAppOpen(): Promise<void> {
    try {
      const count = await this.getAppOpensCount();
      await AsyncStorage.setItem(STORAGE_KEYS.APP_OPENS, (count + 1).toString());
      
      // También actualizar días activos
      await this.updateDaysActive();
      
      console.log('📊 Aperturas de app:', count + 1);
    } catch (error) {
      console.error('Error tracking app open:', error);
    }
  }

  /**
   * Marcar cuando el usuario se vuelve Premium
   */
  static async trackPremiumSubscribed(): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_SINCE);
      if (!existing) {
        await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_SINCE, new Date().toISOString());
        console.log('💎 Usuario se volvió Premium');
      }
    } catch (error) {
      console.error('Error tracking premium subscription:', error);
    }
  }

  // ============= GETTERS DE CONTADORES =============

  private static async getLoansCompletedCount(): Promise<number> {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.LOANS_COMPLETED);
    return count ? parseInt(count, 10) : 0;
  }

  private static async getPaymentsMarkedCount(): Promise<number> {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS_MARKED);
    return count ? parseInt(count, 10) : 0;
  }

  private static async getReportsExportedCount(): Promise<number> {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS_EXPORTED);
    return count ? parseInt(count, 10) : 0;
  }

  private static async getAppOpensCount(): Promise<number> {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.APP_OPENS);
    return count ? parseInt(count, 10) : 0;
  }

  private static async getDaysActiveCount(): Promise<number> {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.DAYS_ACTIVE);
    return count ? parseInt(count, 10) : 0;
  }

  private static async getDaysSincePremium(): Promise<number | null> {
    const premiumSince = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_SINCE);
    if (!premiumSince) return null;
    
    const premiumDate = new Date(premiumSince);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - premiumDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  private static async updateDaysActive(): Promise<void> {
    // Lógica simplificada: incrementar cada vez que se abre la app
    // En producción podrías hacerlo más sofisticado con fechas
    const count = await this.getDaysActiveCount();
    await AsyncStorage.setItem(STORAGE_KEYS.DAYS_ACTIVE, (count + 1).toString());
  }

  // ============= LÓGICA DE SOLICITUD DE RESEÑA =============

  /**
   * Verificar si podemos solicitar una reseña
   */
  static async canRequestReview(): Promise<boolean> {
    try {
      // 1. Verificar si ya dio reseña
      const reviewGiven = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_GIVEN);
      if (reviewGiven === 'true') {
        console.log('⭐ Usuario ya dio reseña');
        return false;
      }

      // 2. Verificar si el usuario la rechazó explícitamente
      const declined = await AsyncStorage.getItem(STORAGE_KEYS.USER_DECLINED_REVIEW);
      if (declined === 'true') {
        console.log('⭐ Usuario rechazó dar reseña');
        return false;
      }

      // 3. Verificar número de veces que hemos pedido
      const requestCount = await this.getReviewRequestCount();
      if (requestCount >= REVIEW_CONFIG.MAX_REQUESTS) {
        console.log('⭐ Se alcanzó el máximo de solicitudes');
        return false;
      }

      // 4. Verificar cooldown desde última solicitud
      const lastRequest = await AsyncStorage.getItem(STORAGE_KEYS.LAST_REVIEW_REQUEST_DATE);
      if (lastRequest) {
        const lastRequestDate = new Date(lastRequest);
        const now = new Date();
        const daysSinceLastRequest = Math.floor(
          (now.getTime() - lastRequestDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastRequest < REVIEW_CONFIG.COOLDOWN_DAYS) {
          console.log(`⭐ En cooldown (${daysSinceLastRequest}/${REVIEW_CONFIG.COOLDOWN_DAYS} días)`);
          return false;
        }
      }

      // 5. Verificar número mínimo de aperturas
      const appOpens = await this.getAppOpensCount();
      if (appOpens < REVIEW_CONFIG.MIN_APP_OPENS) {
        console.log(`⭐ Pocas aperturas (${appOpens}/${REVIEW_CONFIG.MIN_APP_OPENS})`);
        return false;
      }

      // 6. Verificar que StoreReview esté disponible
      const available = await StoreReview.isAvailableAsync();
      if (!available) {
        console.log('⭐ StoreReview no disponible en este dispositivo');
        return false;
      }

      console.log('✅ Se puede solicitar reseña');
      return true;
    } catch (error) {
      console.error('Error checking if can request review:', error);
      return false;
    }
  }

  /**
   * Solicitar reseña al usuario
   */
  static async requestReview(trigger: ReviewTrigger): Promise<boolean> {
    try {
      const canRequest = await this.canRequestReview();
      if (!canRequest) {
        return false;
      }

      console.log(`⭐ Solicitando reseña por trigger: ${trigger}`);

      // Incrementar contador de solicitudes
      const requestCount = await this.getReviewRequestCount();
      await AsyncStorage.setItem(
        STORAGE_KEYS.REVIEW_REQUESTED_COUNT,
        (requestCount + 1).toString()
      );

      // Actualizar fecha de última solicitud
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_REVIEW_REQUEST_DATE,
        new Date().toISOString()
      );

      // Solicitar reseña usando StoreKit nativo
      await StoreReview.requestReview();

      console.log('✅ Reseña solicitada exitosamente');
      return true;
    } catch (error) {
      console.error('Error requesting review:', error);
      return false;
    }
  }

  /**
   * Solicitar reseña si se cumplen las condiciones específicas
   */
  static async requestReviewIfConditionsMet(
    trigger: ReviewTrigger,
    conditions: ReviewConditions
  ): Promise<boolean> {
    try {
      // Verificar condiciones generales primero
      const canRequest = await this.canRequestReview();
      if (!canRequest) {
        return false;
      }

      // Verificar condiciones específicas
      let conditionsMet = true;

      if (conditions.loansCompleted !== undefined) {
        const count = await this.getLoansCompletedCount();
        if (count < conditions.loansCompleted) {
          console.log(`⭐ Condición no cumplida: préstamos completados ${count}/${conditions.loansCompleted}`);
          conditionsMet = false;
        }
      }

      if (conditions.paymentsMarked !== undefined) {
        const count = await this.getPaymentsMarkedCount();
        if (count < conditions.paymentsMarked) {
          console.log(`⭐ Condición no cumplida: pagos marcados ${count}/${conditions.paymentsMarked}`);
          conditionsMet = false;
        }
      }

      if (conditions.reportsExported !== undefined) {
        const count = await this.getReportsExportedCount();
        if (count < conditions.reportsExported) {
          console.log(`⭐ Condición no cumplida: reportes exportados ${count}/${conditions.reportsExported}`);
          conditionsMet = false;
        }
      }

      if (conditions.daysActive !== undefined) {
        const count = await this.getDaysActiveCount();
        if (count < conditions.daysActive) {
          console.log(`⭐ Condición no cumplida: días activos ${count}/${conditions.daysActive}`);
          conditionsMet = false;
        }
      }

      if (conditions.appOpens !== undefined) {
        const count = await this.getAppOpensCount();
        if (count < conditions.appOpens) {
          console.log(`⭐ Condición no cumplida: aperturas ${count}/${conditions.appOpens}`);
          conditionsMet = false;
        }
      }

      if (conditions.daysSincePremium !== undefined) {
        const days = await this.getDaysSincePremium();
        if (days === null || days < conditions.daysSincePremium) {
          console.log(`⭐ Condición no cumplida: días desde premium ${days}/${conditions.daysSincePremium}`);
          conditionsMet = false;
        }
      }

      if (!conditionsMet) {
        return false;
      }

      // Todas las condiciones cumplidas, solicitar reseña
      return await this.requestReview(trigger);
    } catch (error) {
      console.error('Error checking conditions for review:', error);
      return false;
    }
  }

  // ============= TRIGGERS ESPECÍFICOS =============

  /**
   * Trigger: Préstamo completado (PRIORIDAD ALTA)
   */
  static async triggerOnLoanCompleted(): Promise<boolean> {
    await this.trackLoanCompleted();
    
    return await this.requestReviewIfConditionsMet('loan_completed', {
      loansCompleted: 1, // Después del primer préstamo completado
      appOpens: 5,
    });
  }

  /**
   * Trigger: Milestone de pagos (10 cuotas marcadas como pagadas)
   */
  static async triggerOnPaymentMilestone(): Promise<boolean> {
    await this.trackPaymentMarked();
    
    return await this.requestReviewIfConditionsMet('payment_milestone', {
      paymentsMarked: 10,
      appOpens: 5,
    });
  }

  /**
   * Trigger: Después de exportar reportes (usuarios Premium)
   */
  static async triggerOnReportExported(): Promise<boolean> {
    await this.trackReportExported();
    
    return await this.requestReviewIfConditionsMet('report_exported', {
      reportsExported: 3,
      appOpens: 5,
    });
  }

  /**
   * Trigger: Días después de volverse Premium
   */
  static async triggerOnPremiumMilestone(): Promise<boolean> {
    return await this.requestReviewIfConditionsMet('premium_milestone', {
      daysSincePremium: 3,
      appOpens: 10,
    });
  }

  /**
   * Trigger: Milestone de uso (días activos)
   */
  static async triggerOnUsageMilestone(): Promise<boolean> {
    return await this.requestReviewIfConditionsMet('usage_milestone', {
      daysActive: 15,
      appOpens: 15,
    });
  }

  // ============= UTILIDADES =============

  private static async getReviewRequestCount(): Promise<number> {
    const count = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_REQUESTED_COUNT);
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Marcar que el usuario dio reseña (para evitar pedirla de nuevo)
   */
  static async markReviewGiven(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_GIVEN, 'true');
    console.log('✅ Usuario marcado como que dio reseña');
  }

  /**
   * Marcar que el usuario rechazó dar reseña
   */
  static async markReviewDeclined(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DECLINED_REVIEW, 'true');
    console.log('❌ Usuario rechazó dar reseña');
  }

  /**
   * Obtener estadísticas de reseñas (para debugging)
   */
  static async getReviewStats(): Promise<{
    requestCount: number;
    lastRequestDate: string | null;
    reviewGiven: boolean;
    declined: boolean;
    loansCompleted: number;
    paymentsMarked: number;
    reportsExported: number;
    appOpens: number;
    daysActive: number;
    daysSincePremium: number | null;
  }> {
    return {
      requestCount: await this.getReviewRequestCount(),
      lastRequestDate: await AsyncStorage.getItem(STORAGE_KEYS.LAST_REVIEW_REQUEST_DATE),
      reviewGiven: (await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_GIVEN)) === 'true',
      declined: (await AsyncStorage.getItem(STORAGE_KEYS.USER_DECLINED_REVIEW)) === 'true',
      loansCompleted: await this.getLoansCompletedCount(),
      paymentsMarked: await this.getPaymentsMarkedCount(),
      reportsExported: await this.getReportsExportedCount(),
      appOpens: await this.getAppOpensCount(),
      daysActive: await this.getDaysActiveCount(),
      daysSincePremium: await this.getDaysSincePremium(),
    };
  }

  /**
   * Resetear todo (solo para testing)
   */
  static async resetAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.REVIEW_REQUESTED_COUNT,
      STORAGE_KEYS.LAST_REVIEW_REQUEST_DATE,
      STORAGE_KEYS.REVIEW_GIVEN,
      STORAGE_KEYS.USER_DECLINED_REVIEW,
      STORAGE_KEYS.LOANS_COMPLETED,
      STORAGE_KEYS.PAYMENTS_MARKED,
      STORAGE_KEYS.REPORTS_EXPORTED,
      STORAGE_KEYS.DAYS_ACTIVE,
      STORAGE_KEYS.APP_OPENS,
      STORAGE_KEYS.PREMIUM_SINCE,
    ]);
    console.log('🔄 Sistema de reseñas reseteado');
  }
}

