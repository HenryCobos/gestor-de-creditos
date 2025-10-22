import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Interfaces para PayPal
export interface PayPalProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  type: 'monthly' | 'yearly';
}

export interface PayPalPaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  requiresWebView?: boolean;
  approvalUrl?: string;
  orderId?: string;
  product?: PayPalProduct;
}

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
}

export class PayPalService {
  private static initialized = false;
  private static config: PayPalConfig | null = null;
  private static accessToken: string | null = null;

  /**
   * Inicializa el servicio de PayPal
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const clientId = (Constants?.expoConfig as any)?.extra?.PAYPAL_CLIENT_ID;
      const clientSecret = (Constants?.expoConfig as any)?.extra?.PAYPAL_CLIENT_SECRET;
      const environment = (Constants?.expoConfig as any)?.extra?.PAYPAL_ENVIRONMENT || 'production';

      if (!clientId || !clientSecret) {
        console.warn('⚠️ PayPal credentials not configured');
        this.initialized = true;
        return;
      }

      this.config = {
        clientId,
        clientSecret,
        environment: environment as 'sandbox' | 'production'
      };

      console.log('🔧 Configuración PayPal:', {
        environment: this.config.environment,
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret
      });

      // Obtener token de acceso inmediatamente
      await this.getAccessToken();

      this.initialized = true;
      console.log('✅ PayPal service initialized');
    } catch (error) {
      console.error('❌ Error initializing PayPal service:', error);
      this.initialized = true;
    }
  }

  /**
   * Obtiene token de acceso de PayPal
   */
  private static async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    if (!this.config) {
      throw new Error('PayPal config not initialized');
    }

    try {
      const baseUrl = this.config.environment === 'sandbox' 
        ? 'https://api.sandbox.paypal.com' 
        : 'https://api.paypal.com';

      console.log('🔑 Obteniendo token de acceso PayPal...');
      
      const response = await axios.post(`${baseUrl}/v1/oauth2/token`, 
        'grant_type=client_credentials',
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: this.config.clientId,
            password: this.config.clientSecret
          }
        }
      );

      this.accessToken = response.data.access_token;
      console.log('✅ Token PayPal obtenido exitosamente');
      return this.accessToken!;
    } catch (error) {
      console.error('❌ Error obteniendo token PayPal:', error);
      throw error;
    }
  }

  /**
   * Obtiene los productos disponibles
   */
  static getProducts(): PayPalProduct[] {
    return [
      {
        id: 'P-5XJ99625GT120133NNDZHG3Y', // ID real de PayPal - Plan Mensual
        name: 'Plan Mensual Premium - Gestor de Créditos',
        price: 1.00,
        currency: 'USD',
        type: 'monthly'
      },
      {
        id: 'P-6GH417601N8335719NDZHHYI', // ID real de PayPal - Plan Anual
        name: 'Plan Anual Premium - Gestor de Créditos',
        price: 59.99,
        currency: 'USD',
        type: 'yearly'
      }
    ];
  }

  /**
   * Procesa un pago REAL con PayPal REST API usando WebView
   */
  static async processPayment(product: PayPalProduct): Promise<PayPalPaymentResult> {
    try {
      if (!this.initialized || !this.config) {
        throw new Error('PayPal service not initialized');
      }

      console.log('💳 Iniciando pago REAL con PayPal REST API:', product);
      
      // Crear orden PayPal real
      const order = await this.createOrder(product);
      console.log('✅ Orden PayPal creada:', order.id);
      
      // Obtener URL de aprobación
      const approvalUrl = this.getApprovalUrl(order);
      if (!approvalUrl) {
        throw new Error('No se pudo obtener la URL de aprobación de PayPal');
      }

      console.log('🔗 URL de aprobación PayPal:', approvalUrl);
      
      return {
        success: true,
        requiresWebView: true,
        approvalUrl: approvalUrl,
        orderId: order.id,
        product: product
      };

    } catch (error: any) {
      console.error('❌ PayPal payment error:', error);
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  /**
   * Captura una orden PayPal después de la aprobación del usuario
   */
  static async captureApprovedOrder(orderId: string): Promise<PayPalPaymentResult> {
    try {
      if (!this.initialized || !this.config) {
        throw new Error('PayPal service not initialized');
      }

      console.log('💰 Capturando orden aprobada:', orderId);
      
      // Capturar orden
      const capture = await this.captureOrder(orderId);
      console.log('✅ Orden PayPal capturada:', capture.id);
      
      // Obtener ID de transacción
      const transactionId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || capture.id;
      
      return {
        success: true,
        transactionId: transactionId,
        requiresWebView: false
      };

    } catch (error: any) {
      console.error('❌ Error capturando orden PayPal:', error);
      return {
        success: false,
        error: error.message || 'Capture failed'
      };
    }
  }

  /**
   * Obtiene la URL de aprobación de una orden PayPal
   */
  private static getApprovalUrl(order: any): string | null {
    try {
      const links = order.links || [];
      const approvalLink = links.find((link: any) => link.rel === 'approve');
      return approvalLink ? approvalLink.href : null;
    } catch (error) {
      console.error('❌ Error obteniendo URL de aprobación:', error);
      return null;
    }
  }

  /**
   * Crea una orden PayPal real
   */
  private static async createOrder(product: PayPalProduct): Promise<any> {
    if (!this.config) {
      throw new Error('PayPal config not available');
    }

    const baseUrl = this.config.environment === 'sandbox' 
      ? 'https://api.sandbox.paypal.com' 
      : 'https://api.paypal.com';

    const accessToken = await this.getAccessToken();
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `premium_${product.type}_${Date.now()}`,
          amount: {
            currency_code: product.currency,
            value: product.price.toString()
          },
          description: product.name,
          custom_id: product.id
        }
      ],
      application_context: {
        brand_name: 'Gestor de Créditos',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: 'https://henrycobos.github.io/gestor-creditos-landing/success.html?payment=success',
        cancel_url: 'https://henrycobos.github.io/gestor-creditos-landing/cancel.html?payment=cancel'
      }
    };

    console.log('📝 Creando orden PayPal:', orderData);

    const response = await axios.post(`${baseUrl}/v2/checkout/orders`, orderData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `order_${Date.now()}`,
      }
    });

    console.log('✅ Orden PayPal creada:', response.data.id);
    return response.data;
  }

  /**
   * Captura una orden PayPal real
   */
  private static async captureOrder(orderId: string): Promise<any> {
    if (!this.config) {
      throw new Error('PayPal config not available');
    }

    const baseUrl = this.config.environment === 'sandbox' 
      ? 'https://api.sandbox.paypal.com' 
      : 'https://api.paypal.com';

    const accessToken = await this.getAccessToken();

    console.log('💰 Capturando orden PayPal:', orderId);

    const response = await axios.post(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    console.log('✅ Orden PayPal capturada:', response.data.id);
    return response.data;
  }

  /**
   * Simula la aprobación del usuario (solo para testing)
   * En producción, esto se haría cuando PayPal confirme el pago
   */
  private static async simulateUserApproval(orderId: string): Promise<PayPalPaymentResult> {
    try {
      console.log('🧪 Simulando aprobación del usuario para orden:', orderId);
      
      if (!this.config) {
        throw new Error('PayPal config not available');
      }

      // Simular delay del proceso de aprobación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Capturar la orden real en PayPal
      const captureResult = await this.captureOrder(orderId);
      
      console.log('✅ Orden capturada exitosamente:', captureResult.id);
      
      // Obtener el ID de captura
      const captureId = captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id || captureResult.id;
      
      return {
        success: true,
        transactionId: captureId
      };
    } catch (error: any) {
      console.error('❌ Error en simulación de aprobación:', error);
      throw error;
    }
  }


  /**
   * Guarda el estado premium después del pago exitoso
   */
  static async savePremiumState(data: any): Promise<void> {
    try {
      // Si viene como objeto con isPremium, productId, etc. (formato nuevo)
      if (data.isPremium !== undefined) {
        await AsyncStorage.setItem('premium_state', JSON.stringify(data));
        console.log('✅ Premium state saved:', data);
        return;
      }

      // Si viene como producto + transactionId (formato anterior)
      const premiumData = {
        isPremium: true,
        productId: data.id,
        transactionId: data.transactionId || `paypal_${Date.now()}`,
        purchaseDate: new Date().toISOString(),
        expiryDate: this.calculateExpiryDate(data, data.transactionId || `paypal_${Date.now()}`),
        type: data.type
      };

      await AsyncStorage.setItem('premium_state', JSON.stringify(premiumData));
      console.log('✅ Premium state saved:', premiumData);
    } catch (error) {
      console.error('❌ Error saving premium state:', error);
    }
  }

  /**
   * Calcula la fecha de expiración basada en el tipo de producto
   */
  private static calculateExpiryDate(product: PayPalProduct, transactionId: string): string {
    const now = new Date();
    
    // Si es un trial, expira en 3 días
    if (transactionId && transactionId.startsWith('trial_')) {
      now.setDate(now.getDate() + 3);
    } else if (product.type === 'monthly') {
      now.setMonth(now.getMonth() + 1);
    } else if (product.type === 'yearly') {
      now.setFullYear(now.getFullYear() + 1);
    }
    
    return now.toISOString();
  }

  /**
   * Verifica el estado premium actual
   */
  static async getPremiumStatus(): Promise<{
    isPremium: boolean;
    expiryDate?: string;
    productType?: string;
    transactionId?: string;
    productId?: string;
    purchaseDate?: string;
  }> {
    try {
      const premiumDataStr = await AsyncStorage.getItem('premium_state');
      
      if (!premiumDataStr) {
        return { isPremium: false };
      }

      const premiumData = JSON.parse(premiumDataStr);
      const now = new Date();
      const expiryDate = new Date(premiumData.expiryDate);

      // Verificar si la suscripción ha expirado
      if (expiryDate <= now) {
        // Limpiar estado expirado
        await AsyncStorage.removeItem('premium_state');
        return { isPremium: false };
      }

      return {
        isPremium: premiumData.isPremium || true,
        expiryDate: premiumData.expiryDate,
        productType: premiumData.type,
        transactionId: premiumData.transactionId,
        productId: premiumData.productId,
        purchaseDate: premiumData.purchaseDate
      };
    } catch (error) {
      console.error('❌ Error getting premium status:', error);
      return { isPremium: false };
    }
  }

  /**
   * Restaura compras (para compatibilidad con el sistema anterior)
   */
  static async restorePurchases(): Promise<PayPalPaymentResult> {
    try {
      const premiumStatus = await this.getPremiumStatus();
      
      if (premiumStatus.isPremium) {
        return {
          success: true,
          transactionId: 'restored'
        };
      }

      return {
        success: false,
        error: 'No purchases to restore'
      };
    } catch (error: any) {
      console.error('❌ Error restoring purchases:', error);
      return {
        success: false,
        error: error.message || 'Restore failed'
      };
    }
  }

  /**
   * Cancela una suscripción (para compatibilidad)
   */
  static async cancelSubscription(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem('premium_state');
      console.log('✅ Premium subscription cancelled');
      return true;
    } catch (error) {
      console.error('❌ Error cancelling subscription:', error);
      return false;
    }
  }
}
