import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Variables para RevenueCat
let Purchases: any = null;
let isExpoGo: boolean = false;
let isInitialized: boolean = false;

async function ensurePurchasesLoaded(): Promise<any> {
  if (isInitialized) {
    return isExpoGo ? null : Purchases;
  }

  // Inicializar RevenueCat de forma segura
  try {
    const module = require('react-native-purchases');
    Purchases = module.default || module;
    isExpoGo = (Constants as any)?.appOwnership === 'expo';
    isInitialized = true;
    console.log('✅ RevenueCat cargado correctamente');
  } catch (error) {
    console.log('ℹ️ RevenueCat no disponible, usando modo simulación');
    isExpoGo = true;
    isInitialized = true;
  }

  return isExpoGo ? null : Purchases;
}

export interface PremiumState {
  isPremium: boolean;
  customerInfo: any | null;
  offerings: any | null;
  loading: boolean;
  error: string | null;
}

export class PurchasesService {
  static initialized = false;

  static async initialize(apiKey: string): Promise<void> {
    if (this.initialized) return;
    
    const mod = await ensurePurchasesLoaded();
    if (!mod) {
      console.log('ℹ️ RevenueCat no disponible, usando modo simulación');
      this.initialized = true;
      return;
    }
    
    try {
      // Configuración para versión 4.x - usar setup en lugar de configure
      await mod.setup(apiKey);
      this.initialized = true;
      console.log('✅ RevenueCat inicializado correctamente');
    } catch (error: any) {
      console.log('⚠️ Error inicializando RevenueCat (usando modo simulación):', error.message);
      // En caso de error, marcar como inicializado para evitar loops
      this.initialized = true;
    }
  }

  static async getOfferings(): Promise<any | null> {
    const mod = await ensurePurchasesLoaded();
    if (!mod) {
      // Fallback para Expo Go o cuando RevenueCat no está disponible
      console.log('📦 Obteniendo ofertas simuladas');
      return this.getSimulatedOfferings();
    }
    
    try {
      const offerings = await mod.getOfferings();
      if (offerings && offerings.current) {
        console.log('✅ Ofertas obtenidas correctamente de RevenueCat');
        return offerings.current;
      } else {
        console.log('⚠️ No hay ofertas disponibles en RevenueCat, usando datos simulados');
        return this.getSimulatedOfferings();
      }
    } catch (error: any) {
      // Manejar errores específicos de RevenueCat de forma más elegante
      if (error.message && error.message.includes('could not be fetched from App Store Connect')) {
        console.log('📱 Los productos no están disponibles en App Store Connect aún. Esto es normal durante el desarrollo.');
        console.log('ℹ️ Usando datos simulados hasta que los productos estén aprobados en App Store Connect');
      } else if (error.message && error.message.includes('timeout')) {
        console.log('⏱️ Timeout obteniendo ofertas de RevenueCat, usando datos simulados');
      } else {
        console.log('⚠️ Error obteniendo ofertas de RevenueCat:', error.message);
      }
      
      return this.getSimulatedOfferings();
    }
  }

  private static getSimulatedOfferings() {
    return {
      availablePackages: [
        {
          identifier: 'gdc_pro_monthly',
          packageType: 'MONTHLY',
          product: {
            priceString: '$9.99',
            price: 9.99,
            title: 'Mensual',
            productIdentifier: 'gdc_pro_monthly'
          }
        },
        {
          identifier: 'gdc_pro_yearly',
          packageType: 'ANNUAL',
          product: {
            priceString: '$59.99',
            price: 59.99,
            title: 'Anual',
            productIdentifier: 'gdc_pro_yearly'
          }
        }
      ]
    };
  }

  static async getCustomerInfo(): Promise<any> {
    const mod = await ensurePurchasesLoaded();
    
    // En desarrollo, siempre verificar compras simuladas primero
    const isExpoGo = (Constants as any)?.appOwnership === 'expo';
    const isDevelopment = __DEV__ || isExpoGo;
    
    if (!mod || isDevelopment) {
      // Fallback para Expo Go o desarrollo - verificar si hay compra simulada
      console.log('👤 Obteniendo información del cliente simulada');
      const hasSimulatedPurchase = await this.getSimulatedPurchaseStatus();
      console.log('🔍 Estado de compra simulada:', hasSimulatedPurchase);
      return {
        entitlements: {
          active: hasSimulatedPurchase ? { pro: { isActive: true } } : {},
          all: {}
        },
        activeSubscriptions: hasSimulatedPurchase ? ['gdc_pro_monthly'] : [],
        nonSubscriptionTransactions: []
      };
    }
    
    try {
      // RevenueCat 4.x usa getPurchaserInfo en lugar de getCustomerInfo
      return await mod.getPurchaserInfo();
    } catch (error) {
      console.error('❌ Error obteniendo información del cliente:', error);
      throw error;
    }
  }

  // Método para manejar compras simuladas
  private static async getSimulatedPurchaseStatus(): Promise<boolean> {
    try {
      const simulatedPurchase = await AsyncStorage.getItem('@creditos_app:simulated_purchase');
      return simulatedPurchase === 'true';
    } catch {
      return false;
    }
  }

  private static async setSimulatedPurchaseStatus(purchased: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('@creditos_app:simulated_purchase', purchased.toString());
    } catch (error) {
      console.error('Error guardando estado de compra simulada:', error);
    }
  }

  static async purchasePackage(selected: any): Promise<any> {
    const mod = await ensurePurchasesLoaded();
    
    // En desarrollo, siempre usar modo simulación para evitar errores
    const isExpoGo = (Constants as any)?.appOwnership === 'expo';
    const isDevelopment = __DEV__ || isExpoGo;
    
    if (!mod || isDevelopment) {
      // Simular compra cuando RevenueCat no está disponible o en desarrollo
      console.log('🛒 Simulando compra:', {
        identifier: selected?.identifier || 'gdc_pro_monthly',
        packageType: selected?.packageType || 'MONTHLY',
        price: selected?.product?.priceString || '$9.99'
      });

      // Simular delay de compra
      await new Promise(resolve => setTimeout(resolve, 1000));

      await this.setSimulatedPurchaseStatus(true);

      console.log('✅ Compra simulada exitosa');

      return {
        entitlements: {
          active: {
            pro: {
              isActive: true,
              willRenew: true,
              periodType: selected?.packageType || 'MONTHLY',
              expirationDate: new Date(Date.now() + ((selected?.packageType || 'MONTHLY') === 'MONTHLY' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
            }
          },
          all: {}
        },
        activeSubscriptions: [selected?.identifier || 'gdc_pro_monthly'],
        nonSubscriptionTransactions: []
      };
    }

    console.log('🛒 Iniciando compra real:', {
      identifier: selected.identifier,
      packageType: selected.packageType,
      price: selected.product?.priceString
    });

    try {
      const { customerInfo } = await mod.purchasePackage(selected);
      console.log('✅ Compra exitosa:', {
        entitlements: Object.keys(customerInfo.entitlements.active),
        isPro: customerInfo.entitlements.active["pro"] != null
      });
      return customerInfo;
    } catch (error: any) {
      console.error('❌ Error en compra:', {
        code: error.code,
        message: error.message,
        userCancelled: error.userCancelled
      });
      throw error;
    }
  }

  static async restorePurchases(): Promise<any> {
    const mod = await ensurePurchasesLoaded();
    if (!mod) {
      // Simular restauración cuando RevenueCat no está disponible
      console.log('🔄 Simulando restauración de compras');

      const hasSimulatedPurchase = await this.getSimulatedPurchaseStatus();

      if (hasSimulatedPurchase) {
        console.log('✅ Compra simulada encontrada y restaurada');
        return {
          entitlements: {
            active: {
              pro: {
                isActive: true,
                willRenew: true,
                periodType: 'MONTHLY',
                expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              }
            },
            all: {}
          },
          activeSubscriptions: ['gdc_pro_monthly'],
          nonSubscriptionTransactions: []
        };
      } else {
        console.log('ℹ️ No hay compras simuladas para restaurar');
        return {
          entitlements: {
            active: {},
            all: {}
          },
          activeSubscriptions: [],
          nonSubscriptionTransactions: []
        };
      }
    }

    try {
      return await mod.restorePurchases();
    } catch (error) {
      console.error('❌ Error restaurando compras:', error);
      throw error;
    }
  }
}