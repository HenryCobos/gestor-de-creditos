# 📱 Notas de Versión 1.3.1 - Build 143

## Tipo de Build
🧪 **TestFlight Preview** - Build de prueba antes de enviar a revisión de Apple

## Fecha
7 de Octubre, 2025

## Cambios Principales

### 🌟 Sistema de Reseñas Estratégicas (NUEVO)
- ✅ Sistema inteligente para solicitar reseñas en momentos óptimos
- ✅ Triggers en 5 momentos estratégicos:
  1. Después de completar un préstamo
  2. 3 días después de suscribirse a Premium
  3. Al marcar 10 cuotas como pagadas
  4. Después de exportar 3 reportes
  5. Después de 15 días de uso activo
- ✅ Límites automáticos (máximo 3 solicitudes, cooldown 30 días)
- ✅ Panel de debug en Configuración (solo desarrollo)
- ✅ Usa StoreKit nativo de iOS (no intrusivo)

### 💰 Corrección de Moneda en Paywall
- ✅ Ahora muestra el símbolo de moneda correcto según el país del usuario
- ✅ Perú: S/ (antes mostraba $ causando confusión)
- ✅ Precio mensual del plan anual usa símbolo correcto
- ✅ Cálculo de ahorros con símbolo de moneda correcto

## Archivos Nuevos
- `src/services/reviewService.ts` - Servicio de reseñas
- `src/hooks/useReviews.ts` - Hook para componentes
- `GUIA_SISTEMA_RESEÑAS.md` - Documentación completa
- `NOTAS_VERSION_1.3.0_BUILD_143.md` - Este archivo

## Archivos Modificados
- `App.tsx` - Tracking de aperturas de app
- `src/components/paywall/ContextualPaywall.tsx` - Corrección de moneda
- `src/screens/prestamos/PrestamoDetalleScreen.tsx` - Trigger de préstamo completado
- `src/components/export/ExportModal.tsx` - Trigger de reporte exportado
- `src/hooks/usePremium.ts` - Tracking de Premium + milestone
- `src/screens/configuracion/ConfiguracionScreen.tsx` - Panel de debug
- `app.json` - Incremento de buildNumber a 143
- `package.json` - Dependencia expo-store-review

## Qué Probar en TestFlight

### 1. Sistema de Reseñas
- [ ] Completa un préstamo (marca todas las cuotas como pagadas)
- [ ] Verifica que aparezca el prompt nativo de iOS pidiendo reseña
- [ ] Marca 10 cuotas diferentes como pagadas (puede aparecer prompt)
- [ ] Si eres Premium, exporta 3 reportes (puede aparecer prompt)

### 2. Moneda en Paywall
- [ ] Abre el paywall para suscribirte a Premium
- [ ] Verifica que el precio muestre el símbolo correcto según tu país:
  - Perú: S/ 44.90
  - México: $799.00 (peso mexicano)
  - USA: $9.99 (dólar)
- [ ] Verifica el precio mensual del plan anual (debajo del precio)
- [ ] Verifica el texto "Ahorras X al año" con símbolo correcto

### 3. Funcionalidad Existente
- [ ] Crear clientes
- [ ] Crear préstamos
- [ ] Marcar cuotas como pagadas
- [ ] Ver reportes
- [ ] Exportar reportes (Premium)
- [ ] Notificaciones funcionan correctamente

## Notas Importantes para Testing

### ⚠️ Sistema de Reseñas
- El prompt de reseñas **solo funciona en TestFlight/App Store**
- iOS limita la frecuencia (máximo 3 veces al año por dispositivo)
- Si no ves el prompt, puede ser que iOS esté aplicando sus límites
- El sistema registra eventos aunque no aparezca el prompt

### 💰 Moneda
- El símbolo se obtiene automáticamente de RevenueCat según tu región de App Store
- Si ves símbolo incorrecto, verifica tu región en Apple ID

## Próximos Pasos

1. ✅ **Probar en TestFlight** (este build)
2. ⏳ **Validar que todo funciona correctamente**
3. ⏳ **Si todo está bien, crear build final para App Store**
4. ⏳ **Enviar a revisión de Apple**

## Compatibilidad
- iOS 15.1+
- iPhone only (no iPad)
- RevenueCat 4.4.0
- Expo SDK 54

## Problemas Conocidos
Ninguno por el momento

## Checklist Pre-Revisión

Antes de enviar a Apple:
- [ ] Sistema de reseñas probado en TestFlight
- [ ] Moneda muestra correctamente en diferentes países
- [ ] No hay crashes
- [ ] Funcionalidad Premium funciona
- [ ] Notificaciones funcionan
- [ ] Exportación de reportes funciona
- [ ] Suscripciones funcionan correctamente
- [ ] Restauración de compras funciona

---

**Build creado por**: EAS Build  
**Plataforma**: iOS  
**Entorno**: Production (TestFlight)

