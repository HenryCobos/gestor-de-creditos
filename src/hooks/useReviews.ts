import { useCallback } from 'react';
import { ReviewService, ReviewTrigger } from '../services/reviewService';

/**
 * Hook personalizado para manejar reseñas de forma sencilla en componentes
 */
export const useReviews = () => {
  // Tracking de eventos
  const trackLoanCompleted = useCallback(async () => {
    await ReviewService.triggerOnLoanCompleted();
  }, []);

  const trackPaymentMarked = useCallback(async () => {
    await ReviewService.triggerOnPaymentMilestone();
  }, []);

  const trackReportExported = useCallback(async () => {
    await ReviewService.triggerOnReportExported();
  }, []);

  const trackPremiumSubscribed = useCallback(async () => {
    await ReviewService.trackPremiumSubscribed();
  }, []);

  const checkPremiumMilestone = useCallback(async () => {
    await ReviewService.triggerOnPremiumMilestone();
  }, []);

  const checkUsageMilestone = useCallback(async () => {
    await ReviewService.triggerOnUsageMilestone();
  }, []);

  // Tracking simple de apertura de app
  const trackAppOpen = useCallback(async () => {
    await ReviewService.trackAppOpen();
  }, []);

  // Obtener estadísticas (útil para debugging)
  const getReviewStats = useCallback(async () => {
    return await ReviewService.getReviewStats();
  }, []);

  // Resetear (solo para testing)
  const resetReviews = useCallback(async () => {
    await ReviewService.resetAll();
  }, []);

  return {
    // Triggers principales
    trackLoanCompleted,
    trackPaymentMarked,
    trackReportExported,
    trackPremiumSubscribed,
    checkPremiumMilestone,
    checkUsageMilestone,
    
    // Utilidades
    trackAppOpen,
    getReviewStats,
    resetReviews,
  };
};

