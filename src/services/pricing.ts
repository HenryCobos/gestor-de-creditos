export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  originalPrice?: number;
  discount?: number;
  savings?: number;
  isPopular?: boolean;
  features: string[];
  trialDays?: number;
  revenueCatId: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Mensual',
    price: 9.99, // PRECIO DE PRODUCCIÓN
    period: 'monthly',
    revenueCatId: 'gdc_pro_monthly',
    features: [
      'Clientes y préstamos ilimitados',
      'Reportes completos con gráficos',
      'Exportación de reportes en PDF',
      'Notificaciones personalizadas',
      'Temas personalizados',
      'Soporte prioritario'
    ],
    trialDays: 3
  },
  {
    id: 'yearly',
    name: 'Anual',
    price: 59.99,
    period: 'yearly',
    originalPrice: 119.88, // 9.99 * 12
    discount: 50,
    savings: 59.89,
    isPopular: true,
    revenueCatId: 'gdc_pro_yearly',
    features: [
      'Clientes y préstamos ilimitados',
      'Reportes completos con gráficos',
      'Exportación de reportes en PDF',
      'Notificaciones personalizadas',
      'Temas personalizados',
      'Análisis de riesgo avanzado',
      'Integración con calendario',
      'Exportación avanzada',
      'Soporte prioritario'
    ],
    trialDays: 3
  }
];

export class PricingService {
  static getPlans(): PricingPlan[] {
    return PRICING_PLANS;
  }

  static getPopularPlan(): PricingPlan | null {
    return PRICING_PLANS.find(plan => plan.isPopular) || null;
  }

  static getMonthlyPlan(): PricingPlan | null {
    return PRICING_PLANS.find(plan => plan.period === 'monthly') || null;
  }

  static getYearlyPlan(): PricingPlan | null {
    return PRICING_PLANS.find(plan => plan.period === 'yearly') || null;
  }

  static calculateSavings(monthlyPrice: number, yearlyPrice: number): number {
    const monthlyYearly = monthlyPrice * 12;
    return monthlyYearly - yearlyPrice;
  }

  static formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(price);
  }

  static getPricePerMonth(yearlyPrice: number): number {
    return yearlyPrice / 12;
  }
}
