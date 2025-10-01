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
  static usingSimulatedOfferings = false;

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
    const isExpoGo = (Constants as any)?.appOwnership === 'expo';
    const isLocalDevelopment = __DEV__ && !isExpoGo;
    
    if (!mod) {
      // Fallback solo para Expo Go
      console.log('📦 RevenueCat no disponible - modo Expo Go');
      if (isLocalDevelopment || isExpoGo) {
        this.usingSimulatedOfferings = true;
        return this.getSimulatedOfferings();
      }
      return { availablePackages: [] };
    }
    
    try {
      const offerings = await mod.getOfferings();
      if (offerings && offerings.current && offerings.current.availablePackages && offerings.current.availablePackages.length > 0) {
        console.log('✅ PRODUCTOS REALES encontrados en RevenueCat');
        console.log('📦 Cantidad:', offerings.current.availablePackages.length);
        this.usingSimulatedOfferings = false;
        return offerings.current;
      } else {
        console.warn('⚠️ No hay productos disponibles en RevenueCat');
        
        // Solo simular en desarrollo local
        if (isLocalDevelopment) {
          console.log('📱 Desarrollo local: usando simulación');
          this.usingSimulatedOfferings = true;
          return this.getSimulatedOfferings();
        } else {
          // En producción: devolver vacío y mostrar error al usuario
          console.error('❌ PRODUCCIÓN/TESTFLIGHT: No hay productos configurados');
          this.usingSimulatedOfferings = false;
          return { availablePackages: [] };
        }
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo ofertas:', error.message);
      
      // Solo simular en desarrollo local
      if (isLocalDevelopment) {
        console.log('📱 Desarrollo: simulando por error');
        this.usingSimulatedOfferings = true;
        return this.getSimulatedOfferings();
      } else {
        console.error('❌ PRODUCCIÓN: Error - usuarios verán mensaje');
        this.usingSimulatedOfferings = false;
        return { availablePackages: [] };
      }
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
    
    // Solo usar modo simulación en Expo Go
    const isExpoGo = (Constants as any)?.appOwnership === 'expo';
    
    if (!mod || isExpoGo) {
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
    console.log('🛒 purchasePackage llamado con:', selected);
    const mod = await ensurePurchasesLoaded();
    
    // Solo simular en DESARROLLO LOCAL (no en TestFlight/Producción)
    const isExpoGo = (Constants as any)?.appOwnership === 'expo';
    const isLocalDevelopment = __DEV__ && !isExpoGo;
    
    console.log('🛒 Estado del entorno:', { 
      isExpoGo, 
      isDevelopment: __DEV__, 
      isLocalDevelopment,
      hasMod: !!mod, 
      usingSimulatedOfferings: this.usingSimulatedOfferings 
    });
    
    // SOLO simular en desarrollo local, NUNCA en TestFlight/producción
    if (!mod || isExpoGo || (isLocalDevelopment && this.usingSimulatedOfferings)) {
      // Simular compra cuando RevenueCat no está disponible o en desarrollo
      console.log('🎭 MODO SIMULACIÓN ACTIVO - Los productos reales no están disponibles');
      console.log('📱 Esto es normal en desarrollo. En producción (TestFlight/App Store), las compras funcionarán correctamente.');
      console.log('🛒 Simulando compra de:', {
        identifier: selected?.identifier || 'gdc_pro_monthly',
        packageType: selected?.packageType || 'MONTHLY',
        price: selected?.product?.priceString || '$9.99'
      });

      // Simular delay de compra
      await new Promise(resolve => setTimeout(resolve, 1500));

      await this.setSimulatedPurchaseStatus(true);

      console.log('✅ Compra simulada completada - Usuario es ahora Premium (simulado)');

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

    // Validar que el paquete sea válido antes de intentar comprar
    if (!selected || !selected.product || !selected.product.productIdentifier) {
      console.error('❌ Paquete inválido - no se puede comprar');
      throw new Error('Los productos no están disponibles. Verifica tu conexión e intenta de nuevo.');
    }

    console.log('🛒 Iniciando compra REAL con RevenueCat:', {
      identifier: selected.identifier,
      packageType: selected.packageType,
      price: selected.product?.priceString,
      productId: selected.product.productIdentifier
    });

    try {
      const purchaseResult = await mod.purchasePackage(selected);
      const customerInfo = purchaseResult.customerInfo;
      
      console.log('✅ Compra exitosa:', {
        entitlements: Object.keys(customerInfo.entitlements.active),
        isPro: customerInfo.entitlements.active["pro"] != null,
        productIdentifier: purchaseResult.productIdentifier
      });
      
      return customerInfo;
    } catch (error: any) {
      console.error('❌ Error en compra:', {
        code: error.code,
        message: error.message,
        userCancelled: error.userCancelled
      });
      
      // Si el usuario cancela, no mostrar error
      if (error.userCancelled) {
        console.log('ℹ️ Usuario canceló la compra');
        throw new Error('Compra cancelada');
      }
      
      // Manejar errores específicos de validación de recibos
      // RevenueCat maneja automáticamente el cambio entre producción y sandbox
      if (error.message && (
        error.message.includes('Sandbox receipt used in production') ||
        error.message.includes('receipt')
      )) {
        console.log('⚠️ Error de validación de recibo - RevenueCat lo manejará automáticamente');
        // No lanzar error específico, dejar que RevenueCat maneje la validación
      }
      
      // Errores de conexión o productos no disponibles
      if (error.message && (
        error.message.includes('Could not find') ||
        error.message.includes('not found') ||
        error.message.includes('timeout')
      )) {
        console.log('⚠️ Producto no disponible o error de conexión');
        throw new Error('El producto no está disponible en este momento. Por favor, intenta más tarde.');
      }
      
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