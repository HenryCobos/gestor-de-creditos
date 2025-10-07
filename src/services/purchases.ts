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
      console.log('🔑 API Key configurada:', apiKey.substring(0, 10) + '...');
      
      // Verificar configuración después de inicializar
      await this.verifyConfiguration();
    } catch (error: any) {
      console.log('⚠️ Error inicializando RevenueCat (usando modo simulación):', error.message);
      console.log('🔧 Error específico:', error.code || 'Sin código');
      // En caso de error, marcar como inicializado para evitar loops
      this.initialized = true;
    }
  }

  // Función para verificar la configuración de RevenueCat
  private static async verifyConfiguration(): Promise<void> {
    try {
      const mod = await ensurePurchasesLoaded();
      if (!mod) return;

      console.log('🔍 Verificando configuración de RevenueCat...');
      
      // Verificar que el SDK esté funcionando
      const isConfigured = await mod.isConfigured();
      console.log('🔧 RevenueCat configurado:', isConfigured);
      
      // Intentar obtener información del usuario (esto debería funcionar si está bien configurado)
      try {
        const customerInfo = await mod.getPurchaserInfo();
        console.log('👤 Información del cliente obtenida:', !!customerInfo);
        console.log('👤 Entitlements activos:', Object.keys(customerInfo.entitlements.active));
      } catch (error: any) {
        console.log('⚠️ No se pudo obtener información del cliente:', error.message);
      }
      
    } catch (error: any) {
      console.log('❌ Error verificando configuración:', error.message);
    }
  }

  static async getOfferings(): Promise<any | null> {
    const mod = await ensurePurchasesLoaded();
    const isExpoGo = (Constants as any)?.appOwnership === 'expo';
    const isLocalDevelopment = __DEV__ && !isExpoGo;
    const isTestFlight = !isExpoGo && !isLocalDevelopment;
    
    console.log('🔍 getOfferings - Estado del entorno:', {
      isExpoGo,
      isLocalDevelopment,
      isTestFlight,
      hasMod: !!mod,
      isInitialized: this.initialized
    });
    
    // En TestFlight, intentar RevenueCat primero, usar respaldo solo si falla
    if (isTestFlight) {
      console.log('📱 TESTFLIGHT: Intentando cargar productos desde RevenueCat...');
      console.log('🔧 Si falla, usaremos productos de respaldo para permitir compras');
    }
    
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
      console.log('🛒 Llamando a mod.getOfferings()...');
      const offerings = await mod.getOfferings();
      console.log('📦 Respuesta completa de getOfferings:', JSON.stringify(offerings, null, 2));
      
      // Verificar si hay ofertas disponibles
      if (!offerings) {
        console.warn('⚠️ RevenueCat devolvió null/undefined');
        throw new Error('No hay ofertas disponibles');
      }
      
      // Buscar la oferta actual
      const currentOffering = offerings.current;
      if (!currentOffering) {
        console.warn('⚠️ No hay oferta actual configurada en RevenueCat');
        console.log('🔧 Verifica que tengas una oferta marcada como "Current" en RevenueCat');
        throw new Error('No hay oferta actual configurada');
      }
      
      // Verificar paquetes disponibles
      const availablePackages = currentOffering.availablePackages;
      if (!availablePackages || availablePackages.length === 0) {
        console.warn('⚠️ No hay paquetes disponibles en la oferta actual');
        console.log('🔧 Verifica que tengas productos configurados en la oferta');
        throw new Error('No hay paquetes disponibles');
      }
      
      console.log('✅ PRODUCTOS REALES encontrados en RevenueCat');
      console.log('📦 Cantidad:', availablePackages.length);
      console.log('📦 Productos detallados:', availablePackages.map((pkg: any) => ({
        identifier: pkg.identifier,
        packageType: pkg.packageType,
        productId: pkg.product?.productIdentifier,
        price: pkg.product?.priceString,
        priceValue: pkg.product?.price,
        title: pkg.product?.title,
        description: pkg.product?.description
      })));
      
      this.usingSimulatedOfferings = false;
      return currentOffering;
      
    } catch (error: any) {
      console.error('❌ Error obteniendo ofertas:', error.message);
      console.error('❌ Stack trace:', error.stack);
      
      // En TestFlight, usar productos de respaldo cuando RevenueCat falla
      if (isTestFlight) {
        console.log('📱 TESTFLIGHT: Error obteniendo productos reales, usando productos de respaldo');
        console.log('🔧 Error específico:', error.message);
        console.log('🔧 Tipo de error:', error.code || 'Sin código');
        console.log('🔧 Verifica que:');
        console.log('   - Los productos estén aprobados en App Store Connect');
        console.log('   - La oferta esté marcada como "Current" en RevenueCat');
        console.log('   - Los productos estén asociados a la oferta');
        console.log('   - La API key de RevenueCat sea correcta');
        console.log('🔄 Usando productos de respaldo para permitir compras');
        // Para compras REALES en TestFlight: no usar paquetes de respaldo ni simulación.
        // Devolvemos lista vacía para que la UI muestre el aviso y no ofrezca botones inválidos.
        this.usingSimulatedOfferings = false;
        return { availablePackages: [] };
      }
      
      // Solo simular en desarrollo local
      if (isLocalDevelopment) {
        console.log('📱 Desarrollo: usando simulación por error');
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

  // Productos de respaldo cuando RevenueCat falla
  private static getFallbackOfferings() {
    return {
      availablePackages: [
        {
          identifier: 'gdc_pro_monthly',
          packageType: 'MONTHLY',
          product: {
            priceString: '$9.99',
            price: 9.99,
            title: 'Mensual',
            productIdentifier: 'gdc_pro_monthly',
            description: 'Suscripción mensual'
          }
        },
        {
          identifier: 'gdc_pro_yearly',
          packageType: 'ANNUAL',
          product: {
            priceString: '$59.99',
            price: 59.99,
            title: 'Anual',
            productIdentifier: 'gdc_pro_yearly',
            description: 'Suscripción anual'
          }
        }
      ]
    };
  }

  static async getCustomerInfo(): Promise<any> {
    const mod = await ensurePurchasesLoaded();
    
    const isExpoGo = (Constants as any)?.appOwnership === 'expo';
    const isLocalDevelopment = __DEV__ && !isExpoGo;
    const isTestFlight = !isExpoGo && !isLocalDevelopment;
    
    if (!mod || isExpoGo || (isLocalDevelopment && this.usingSimulatedOfferings)) {
      // Fallback para Expo Go o desarrollo con simulación - verificar si hay compra simulada
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
    
    const isExpoGo = (Constants as any)?.appOwnership === 'expo';
    const isLocalDevelopment = __DEV__ && !isExpoGo;
    const isTestFlight = !isExpoGo && !isLocalDevelopment;
    
    console.log('🛒 Estado del entorno:', { 
      isExpoGo, 
      isDevelopment: __DEV__, 
      isLocalDevelopment,
      isTestFlight,
      hasMod: !!mod, 
      usingSimulatedOfferings: this.usingSimulatedOfferings 
    });
    
    // Simular compra en desarrollo local, Expo Go, o cuando se usan productos de respaldo
    if (!mod || isExpoGo || (isLocalDevelopment && this.usingSimulatedOfferings) || (isTestFlight && this.usingSimulatedOfferings)) {
      // Simular compra cuando RevenueCat no está disponible, en desarrollo, o usando productos de respaldo
      console.log('🎭 MODO SIMULACIÓN/RESPALDO ACTIVO');
      console.log('📱 Entorno:', { isExpoGo, isLocalDevelopment, isTestFlight, usingSimulatedOfferings: this.usingSimulatedOfferings });
      console.log('🛒 Procesando compra de:', {
        identifier: selected?.identifier || 'gdc_pro_monthly',
        packageType: selected?.packageType || 'MONTHLY',
        price: selected?.product?.priceString || '$9.99'
      });

      // Simular delay de compra
      await new Promise(resolve => setTimeout(resolve, 1500));

      await this.setSimulatedPurchaseStatus(true);

      console.log('✅ Compra procesada exitosamente - Usuario es ahora Premium');

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
    if (!selected || !selected.product) {
      console.error('❌ Paquete inválido - no se puede comprar');
      throw new Error('Los productos no están disponibles. Verifica tu conexión e intenta de nuevo.');
    }

    console.log('🛒 Iniciando compra REAL con RevenueCat:', {
      identifier: selected.identifier,
      packageType: selected.packageType,
      price: selected.product?.priceString,
      productId: selected.product.productIdentifier || '(desconocido)'
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

      // Si ya está suscrito en este dispositivo/cuenta, tratamos como éxito tras refrescar estado
      const msg = (error?.message || '').toLowerCase();
      if (
        error?.code === 'PRODUCT_ALREADY_PURCHASED' ||
        msg.includes('already') ||
        msg.includes('suscrito') ||
        msg.includes('subscribed') ||
        msg.includes('purchased')
      ) {
        try {
          console.log('ℹ️ Usuario ya suscrito. Refrescando información del cliente...');
          const info = await mod.getPurchaserInfo();
          console.log('✅ Información del cliente refrescada para usuario ya suscrito');
          return info;
        } catch (e) {
          console.log('⚠️ No se pudo refrescar purchaser info tras error de ya suscrito');
          // Aún así, devolver un estado de éxito para que el paywall se cierre
          return {
            entitlements: {
              active: { pro: { isActive: true } },
              all: {}
            },
            activeSubscriptions: [selected?.identifier || 'gdc_pro_monthly'],
            nonSubscriptionTransactions: []
          };
        }
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
    const isExpoGo = (Constants as any)?.appOwnership === 'expo';
    const isLocalDevelopment = __DEV__ && !isExpoGo;
    const isTestFlight = !isExpoGo && !isLocalDevelopment;
    
    if (!mod || isExpoGo || (isLocalDevelopment && this.usingSimulatedOfferings)) {
      // Simular restauración cuando RevenueCat no está disponible o en desarrollo con simulación
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
      // Primero verificar el estado actual del usuario
      console.log('🔍 Verificando estado actual del usuario...');
      let currentInfo;
      try {
        currentInfo = await mod.getPurchaserInfo();
        console.log('📊 Estado actual del usuario:', {
          entitlements: Object.keys(currentInfo?.entitlements?.active || {}),
          activeSubscriptions: currentInfo?.activeSubscriptions || []
        });
        
        // Si ya tiene entitlements activos, devolver ese estado
        if (currentInfo?.entitlements?.active?.pro) {
          console.log('✅ Usuario ya tiene suscripción activa');
          return currentInfo;
        }
      } catch (e) {
        console.log('⚠️ No se pudo obtener estado actual, procediendo con restauración');
      }

      // Si no tiene suscripción activa, intentar restaurar
      console.log('🔄 Intentando restaurar compras...');
      let restoredInfo;
      
      if (typeof mod.restorePurchases === 'function') {
        restoredInfo = await mod.restorePurchases();
      } else if (typeof mod.restore === 'function') {
        restoredInfo = await mod.restore();
      } else {
        console.warn('⚠️ Método de restauración no disponible, usando simulación');
        const hasSimulatedPurchase = await this.getSimulatedPurchaseStatus();
        if (hasSimulatedPurchase) {
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
          return {
            entitlements: { active: {}, all: {} },
            activeSubscriptions: [],
            nonSubscriptionTransactions: []
          };
        }
      }

      console.log('📊 Estado tras restauración:', {
        entitlements: Object.keys(restoredInfo?.entitlements?.active || {}),
        activeSubscriptions: restoredInfo?.activeSubscriptions || []
      });

      return restoredInfo;
    } catch (error) {
      console.error('❌ Error restaurando compras:', error);
      throw error;
    }
  }

  // Nueva función de sincronización manual más robusta
  static async forceSyncWithApple(): Promise<any> {
    const mod = await ensurePurchasesLoaded();
    const isExpoGo = (Constants as any)?.appOwnership === 'expo';
    const isLocalDevelopment = __DEV__ && !isExpoGo;
    
    if (!mod || isExpoGo || (isLocalDevelopment && this.usingSimulatedOfferings)) {
      console.log('ℹ️ RevenueCat no disponible, simulando sincronización');
      return {
        entitlements: {
          active: {},
          all: {}
        },
        activeSubscriptions: [],
        nonSubscriptionTransactions: []
      };
    }

    try {
      console.log('🔄 Forzando sincronización con Apple...');
      
      // Paso 1: Restaurar compras
      console.log('🔄 Paso 1: Restaurando compras...');
      const restoredInfo = await mod.restorePurchases();
      
      // Paso 2: Obtener información actualizada
      console.log('🔄 Paso 2: Obteniendo información actualizada...');
      const currentInfo = await mod.getPurchaserInfo();
      
      // Paso 3: Verificar suscripciones activas
      console.log('🔄 Paso 3: Verificando suscripciones activas...');
      const entitlements = currentInfo?.entitlements?.active ?? {};
      const isPro = entitlements["pro"] != null;
      
      console.log('📊 Resultado de sincronización:', {
        isPro,
        entitlements: Object.keys(entitlements),
        activeSubscriptions: currentInfo?.activeSubscriptions || [],
        restoredInfo: !!restoredInfo,
        currentInfo: !!currentInfo
      });
      
      return currentInfo || restoredInfo;
    } catch (error: any) {
      console.error('❌ Error en sincronización forzada:', error);
      throw error;
    }
  }
}