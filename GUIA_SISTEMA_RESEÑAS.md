# 🌟 Guía del Sistema de Reseñas

## Descripción General

El sistema de reseñas implementado en la app está diseñado para solicitar reseñas en el App Store en momentos estratégicos cuando el usuario está más satisfecho con la app, maximizando la probabilidad de obtener reseñas positivas.

## Características Principales

### ✅ **Inteligente y No Intrusivo**
- Usa el prompt nativo de iOS (StoreKit)
- iOS limita automáticamente la frecuencia (máximo 3 veces al año por sistema)
- Cooldown de 30 días entre solicitudes
- No molesta a usuarios que ya dieron reseña

### 📊 **Tracking Automático de Eventos**
El sistema trackea automáticamente:
- ✅ Préstamos completados
- ✅ Cuotas marcadas como pagadas
- ✅ Reportes exportados
- ✅ Conversiones a Premium
- ✅ Aperturas de la app
- ✅ Días activos

### 🎯 **Triggers Estratégicos**
Los momentos cuando se solicita la reseña están ordenados por prioridad:

1. **🥇 Préstamo Completado** (PRIORIDAD ALTA)
   - Se activa: Después de marcar todas las cuotas como pagadas
   - Condiciones: Mínimo 5 aperturas de app
   - Razón: Usuario acaba de lograr un objetivo importante

2. **🥈 3 Días Después de Premium** (PRIORIDAD MEDIA-ALTA)
   - Se activa: 3 días después de suscribirse
   - Condiciones: Mínimo 10 aperturas de app
   - Razón: Ya experimentó las funciones Premium

3. **🥉 10 Cuotas Marcadas como Pagadas** (PRIORIDAD MEDIA)
   - Se activa: Al marcar la 10ma cuota como pagada
   - Condiciones: Mínimo 5 aperturas de app
   - Razón: Usuario activo con múltiples interacciones positivas

4. **📊 3 Reportes Exportados** (PRIORIDAD MEDIA)
   - Se activa: Después de exportar 3 reportes
   - Condiciones: Mínimo 5 aperturas de app
   - Razón: Usuario Premium satisfecho usando funciones avanzadas

5. **⏰ 15 Días de Uso Activo** (PRIORIDAD BAJA)
   - Se activa: Después de 15 días de uso
   - Condiciones: Mínimo 15 aperturas de app
   - Razón: Usuario comprometido a largo plazo

## Arquitectura del Sistema

### Archivos Principales

```
src/
├── services/
│   └── reviewService.ts       # Servicio principal con toda la lógica
├── hooks/
│   └── useReviews.ts          # Hook para usar en componentes
└── screens/
    ├── prestamos/
    │   └── PrestamoDetalleScreen.tsx  # Trigger: Préstamo completado
    ├── configuracion/
    │   └── ConfiguracionScreen.tsx    # Panel de debug
    └── components/
        └── export/
            └── ExportModal.tsx         # Trigger: Reporte exportado
```

### Flujo de Funcionamiento

```
Usuario realiza acción
        ↓
Trigger específico se ejecuta
        ↓
ReviewService.trackXXX() - Incrementa contador
        ↓
ReviewService.triggerOnXXX() - Verifica condiciones
        ↓
¿Cumple todas las condiciones?
   ↓ SI                    ↓ NO
Mostrar prompt iOS    Esperar siguiente trigger
        ↓
Usuario responde o ignora
        ↓
Sistema iOS maneja la respuesta
```

## Configuración

### Límites y Cooldowns (en `reviewService.ts`)

```typescript
const REVIEW_CONFIG = {
  MAX_REQUESTS: 3,        // Máximo número de veces que pediremos reseña
  COOLDOWN_DAYS: 30,      // Días de espera entre solicitudes
  MIN_DAYS_SINCE_INSTALL: 3,  // Días mínimos desde instalación
  MIN_APP_OPENS: 5,       // Aperturas mínimas de la app
};
```

### Ajustar Condiciones de Triggers

Puedes modificar las condiciones en cada trigger:

```typescript
// Ejemplo: Cambiar el trigger de préstamo completado
static async triggerOnLoanCompleted(): Promise<boolean> {
  await this.trackLoanCompleted();
  
  return await this.requestReviewIfConditionsMet('loan_completed', {
    loansCompleted: 1,  // Cambiar a 2 para requerir 2 préstamos completados
    appOpens: 5,        // Cambiar a 10 para requerir más aperturas
  });
}
```

## Cómo Usar en Componentes

### Método 1: Usar el Hook (Recomendado)

```typescript
import { useReviews } from '../../hooks/useReviews';

function MiComponente() {
  const reviews = useReviews();

  const handleCompletarPrestamo = async () => {
    // Tu lógica de negocio
    await completarPrestamo();
    
    // Trigger de reseña
    await reviews.trackLoanCompleted();
  };

  return (
    // Tu UI
  );
}
```

### Método 2: Usar el Servicio Directamente

```typescript
import { ReviewService } from '../../services/reviewService';

const handleExportarReporte = async () => {
  await exportarReporte();
  
  // Trigger de reseña
  await ReviewService.triggerOnReportExported();
};
```

## Testing y Debug

### Panel de Debug (Solo en Desarrollo)

En la pantalla de **Configuración**, si estás en modo desarrollo (`__DEV__`), verás una sección amarilla con:

- **Estadísticas**: Número de solicitudes, eventos trackeados, etc.
- **Botón Reset**: Limpia todas las estadísticas (útil para testing)
- **Botón Forzar**: Intenta solicitar una reseña inmediatamente

### Logs en Consola

El sistema genera logs detallados:

```
📊 Préstamos completados: 1
⭐ Solicitando reseña por trigger: loan_completed
✅ Reseña solicitada exitosamente
```

O si no se puede solicitar:

```
⭐ En cooldown (15/30 días)
⭐ Se alcanzó el máximo de solicitudes
```

### Cómo Probar en Desarrollo

1. **Abrir el panel de debug**: Ve a Configuración → Scroll al final
2. **Resetear estadísticas**: Presiona "Resetear Sistema de Reseñas"
3. **Simular eventos**: Usa las acciones normales de la app (completar préstamos, etc.)
4. **Ver estadísticas actualizadas**: Las estadísticas se actualizan en tiempo real
5. **Forzar reseña**: Presiona "Forzar Solicitud de Reseña" para probar el prompt

### Probar en TestFlight

⚠️ **IMPORTANTE**: El prompt de reseñas **NO funciona en desarrollo ni simulador**.

Para probar en TestFlight:
1. Crea un build de producción
2. Sube a TestFlight
3. Descarga la app desde TestFlight
4. Realiza las acciones que triggean reseñas
5. Deberías ver el prompt nativo de iOS

> **Nota**: iOS puede limitar la frecuencia incluso en testing. Si no ves el prompt, puede ser que iOS esté aplicando sus propios límites.

## Mejores Prácticas

### ✅ DO's (Hacer)

1. **Mantener las condiciones razonables**: No pedir reseña muy pronto
2. **Usar momentos de éxito**: Cuando el usuario acaba de lograr algo
3. **Monitorear las estadísticas**: Revisar qué triggers funcionan mejor
4. **Respetar los límites de iOS**: No intentar sortear las restricciones

### ❌ DON'Ts (No Hacer)

1. **NO pedir reseña en momentos negativos**: Errores, cancelaciones, etc.
2. **NO incrementar MAX_REQUESTS**: iOS ya limita a 3 por año
3. **NO solicitar en cada apertura de app**: Será muy molesto
4. **NO crear tu propio prompt**: Siempre usar el nativo de iOS

## Monitoreo en Producción

### Analytics Recomendado

Considera agregar tracking para:
- Cuántas veces se solicita cada trigger
- Tasa de conversión (solicitudes vs reseñas reales)
- Tiempo promedio hasta primera solicitud
- Triggers más efectivos

### Ajustes Basados en Datos

Después de algunos meses en producción:

1. **Analizar qué triggers generan más reseñas**
2. **Ajustar prioridades**: Hacer triggers efectivos más prominentes
3. **Modificar condiciones**: Si muy pocas solicitudes, reducir requisitos
4. **Deshabilitar triggers inefectivos**: Si un trigger no genera reseñas

## Preguntas Frecuentes

### ¿Por qué no veo el prompt en desarrollo?

El prompt nativo de iOS solo funciona en builds de App Store y TestFlight. En desarrollo, el sistema registra los eventos pero iOS no muestra el prompt.

### ¿Puedo solicitar reseña más de 3 veces?

No recomendado. iOS ya limita a 3 veces por año por dispositivo. Nuestro sistema respeta este límite.

### ¿Cómo sé si un usuario dio reseña?

iOS no proporciona esta información por privacidad. El sistema asume que después de solicitar, el usuario pudo haber dado reseña, y aplica cooldown.

### ¿Puedo personalizar el mensaje del prompt?

No. iOS usa un prompt estándar no personalizable. Esto es intencional para mantener consistencia y prevenir manipulación.

### ¿Qué pasa si el usuario cierra el prompt?

iOS lo cuenta como una solicitud. El sistema esperará el cooldown antes de volver a pedir.

## Próximos Pasos

### Funcionalidades Futuras Posibles

1. **A/B Testing de Triggers**: Probar diferentes momentos
2. **Machine Learning**: Predecir el mejor momento por usuario
3. **Segmentación**: Diferentes estrategias para diferentes tipos de usuarios
4. **Analytics Integrado**: Dashboard de estadísticas de reseñas

## Soporte

Para problemas o preguntas sobre el sistema de reseñas:

1. Revisa los logs en consola
2. Verifica el panel de debug en Configuración
3. Asegúrate de estar en un build de TestFlight para probar el prompt real
4. Revisa la documentación de Apple sobre StoreKit

---

**Última actualización**: Octubre 2025  
**Versión del sistema**: 1.0.0

