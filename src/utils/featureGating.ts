export type FeatureKey = 
  | 'create_cliente' 
  | 'create_prestamo' 
  | 'reportes_basicos'
  | 'reportes_avanzados'
  | 'backup_auto'
  | 'notificaciones_personalizadas'
  | 'analisis_riesgo'
  | 'integracion_calendario'
  | 'exportacion_avanzada'
  | 'soporte_prioritario';

export interface GatingContext {
  clientesCount: number;
  prestamosActivosCount: number;
  isPremium: boolean;
}

const FREE_LIMITS = {
  maxClientes: 10,
  maxPrestamosActivos: 10,
};

// Importar DevToolsService dinámicamente para evitar dependencias circulares
const getDevToolsLimits = () => {
  try {
    const { DevToolsService } = require('../services/devTools');
    return DevToolsService.getOverrideLimits();
  } catch {
    return FREE_LIMITS;
  }
};

export interface GateResult {
  allowed: boolean;
  reason?: string;
  upgradePrompt?: string;
  featureName?: string;
  currentUsage?: number;
  limit?: number;
  isNearLimit?: boolean;
}

export function isFeatureAllowed(feature: FeatureKey, ctx: GatingContext): GateResult {
  // Verificar si estamos simulando premium
  try {
    const { DevToolsService } = require('../services/devTools');
    if (DevToolsService.shouldSimulatePremium()) {
      console.log(`🎭 Feature ${feature} ALLOWED - Premium simulado`);
      return { allowed: true };
    }
  } catch {
    // Continuar con lógica normal si no hay DevTools
  }

  if (ctx.isPremium) {
    console.log(`✅ Feature ${feature} ALLOWED - Usuario Premium`);
    return { allowed: true };
  }

  // Obtener límites (normales o personalizados para desarrollo)
  const limits = getDevToolsLimits();

  switch (feature) {
    case 'create_cliente': {
      const isNearLimit = ctx.clientesCount >= limits.maxClientes * 0.8;
      if (ctx.clientesCount >= limits.maxClientes) {
        console.log(`❌ Feature ${feature} BLOCKED - Límite alcanzado: ${ctx.clientesCount}/${limits.maxClientes} clientes`);
        return { 
          allowed: false, 
          reason: `Límite alcanzado: ${limits.maxClientes} clientes`,
          upgradePrompt: 'Mejora a Premium para clientes ilimitados',
          featureName: 'Clientes',
          currentUsage: ctx.clientesCount,
          limit: limits.maxClientes,
          isNearLimit: false
        };
      }
      return { 
        allowed: true,
        isNearLimit,
        currentUsage: ctx.clientesCount,
        limit: limits.maxClientes
      };
    }
    case 'create_prestamo': {
      const isNearLimit = ctx.prestamosActivosCount >= limits.maxPrestamosActivos * 0.8;
      if (ctx.prestamosActivosCount >= limits.maxPrestamosActivos) {
        console.log(`❌ Feature ${feature} BLOCKED - Límite alcanzado: ${ctx.prestamosActivosCount}/${limits.maxPrestamosActivos} préstamos`);
        return { 
          allowed: false, 
          reason: `Límite alcanzado: ${limits.maxPrestamosActivos} préstamos activos`,
          upgradePrompt: 'Mejora a Premium para préstamos ilimitados',
          featureName: 'Préstamos Activos',
          currentUsage: ctx.prestamosActivosCount,
          limit: limits.maxPrestamosActivos,
          isNearLimit: false
        };
      }
      return { 
        allowed: true,
        isNearLimit,
        currentUsage: ctx.prestamosActivosCount,
        limit: limits.maxPrestamosActivos
      };
    }
    case 'reportes_basicos': {
      return { allowed: true };
    }
    case 'reportes_avanzados': {
      return { 
        allowed: false, 
        reason: 'Reportes avanzados son Premium',
        upgradePrompt: 'Desbloquea reportes avanzados con gráficos, análisis detallados y exportación a PDF/Excel',
        featureName: 'Reportes Avanzados'
      };
    }
    case 'backup_auto': {
      return { 
        allowed: true, // Exportación de reportes disponible para todos
        reason: 'Exportación de reportes en PDF incluida',
        upgradePrompt: 'Exportación de reportes en PDF disponible para todos los usuarios',
        featureName: 'Exportación de Reportes'
      };
    }
    case 'notificaciones_personalizadas': {
      return { 
        allowed: false, 
        reason: 'Notificaciones personalizadas son Premium',
        upgradePrompt: 'Personaliza horarios y mensajes de notificaciones',
        featureName: 'Notificaciones Personalizadas'
      };
    }
    case 'analisis_riesgo': {
      return { 
        allowed: false, 
        reason: 'Análisis de riesgo es Premium',
        upgradePrompt: 'Evalúa el riesgo crediticio de tus clientes',
        featureName: 'Análisis de Riesgo'
      };
    }
    case 'integracion_calendario': {
      return { 
        allowed: false, 
        reason: 'Integración con calendario es Premium',
        upgradePrompt: 'Sincroniza con Google Calendar y otros calendarios',
        featureName: 'Integración con Calendario'
      };
    }
    case 'exportacion_avanzada': {
      return { 
        allowed: false, 
        reason: 'Exportación avanzada es Premium',
        upgradePrompt: 'Exporta datos en PDF, Excel y otros formatos',
        featureName: 'Exportación Avanzada'
      };
    }
    case 'soporte_prioritario': {
      return { 
        allowed: false, 
        reason: 'Soporte prioritario es Premium',
        upgradePrompt: 'Recibe soporte prioritario y respuesta rápida',
        featureName: 'Soporte Prioritario'
      };
    }
    default:
      return { allowed: true };
  }
}


