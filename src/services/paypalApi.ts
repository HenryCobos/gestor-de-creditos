import axios from 'axios';

interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class PayPalAPI {
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;

  /**
   * Obtiene el token de acceso de PayPal
   */
  static async getAccessToken(clientId: string, clientSecret: string, isSandbox: boolean = true): Promise<string> {
    try {
      // Verificar si ya tenemos un token válido
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const baseURL = isSandbox 
        ? 'https://api.sandbox.paypal.com' 
        : 'https://api.paypal.com';

      const response = await axios.post(`${baseURL}/v1/oauth2/token`, 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
          },
          auth: {
            username: clientId,
            password: clientSecret,
          },
        }
      );

      const tokenData: PayPalAccessToken = response.data;
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000; // 1 minuto antes

      console.log('✅ PayPal access token obtenido');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error obteniendo token PayPal:', error);
      throw error;
    }
  }

  /**
   * Crea una orden en PayPal
   */
  static async createOrder(
    clientId: string,
    clientSecret: string,
    product: {
      id: string;
      name: string;
      price: number;
      currency: string;
    },
    isSandbox: boolean = true
  ): Promise<PayPalOrder> {
    try {
      const accessToken = await this.getAccessToken(clientId, clientSecret, isSandbox);
      const baseURL = isSandbox 
        ? 'https://api.sandbox.paypal.com' 
        : 'https://api.paypal.com';

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: product.id,
          amount: {
            currency_code: product.currency,
            value: product.price.toString()
          },
          description: product.name
        }],
        application_context: {
          brand_name: 'Gestor de Créditos',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: 'https://gestordecreditos.netlify.app/payment/success',
          cancel_url: 'https://gestordecreditos.netlify.app/payment/cancel'
        }
      };

      console.log('📝 Creando orden PayPal real:', orderData);

      const response = await axios.post(`${baseURL}/v2/checkout/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      console.log('✅ Orden PayPal creada:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creando orden PayPal:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Captura una orden aprobada
   */
  static async captureOrder(
    clientId: string,
    clientSecret: string,
    orderId: string,
    isSandbox: boolean = true
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken(clientId, clientSecret, isSandbox);
      const baseURL = isSandbox 
        ? 'https://api.sandbox.paypal.com' 
        : 'https://api.paypal.com';

      console.log('💰 Capturando orden PayPal:', orderId);

      const response = await axios.post(`${baseURL}/v2/checkout/orders/${orderId}/capture`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      console.log('✅ Orden PayPal capturada:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error capturando orden PayPal:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtiene detalles de una orden
   */
  static async getOrderDetails(
    clientId: string,
    clientSecret: string,
    orderId: string,
    isSandbox: boolean = true
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken(clientId, clientSecret, isSandbox);
      const baseURL = isSandbox 
        ? 'https://api.sandbox.paypal.com' 
        : 'https://api.paypal.com';

      const response = await axios.get(`${baseURL}/v2/checkout/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo detalles de orden:', error.response?.data || error.message);
      throw error;
    }
  }
}
