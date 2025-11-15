# Solución: Símbolo de Moneda Correcto en Paywall

## Problema Identificado
El paywall mostraba los montos convertidos correctamente según el país del usuario (por ejemplo, soles en Perú), pero siempre mostraba el símbolo del dólar ($) en lugar del símbolo de moneda local correspondiente. Esto ocurría en todos los países y podría estar afectando negativamente las conversiones.

## Solución Implementada

### 1. Servicio de Precios Mejorado (`src/services/pricing.ts`)
Se actualizó la función `formatPrice()` para usar locales específicos según la moneda:

```typescript
static formatPrice(price: number, currency: string = 'USD'): string {
  const localeMap: { [key: string]: string } = {
    'USD': 'en-US',
    'PEN': 'es-PE', // Perú
    'MXN': 'es-MX', // México
    'COP': 'es-CO', // Colombia
    'ARS': 'es-AR', // Argentina
    'CLP': 'es-CL', // Chile
    'EUR': 'es-ES', // Europa
    'BRL': 'pt-BR', // Brasil
  };
  
  const locale = localeMap[currency] || 'es-419';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}
```

**Resultado**: Ahora formatea automáticamente los precios con el símbolo y formato correcto para cada país.

### 2. SimplePaywall Actualizado (`src/components/paywall/SimplePaywall.tsx`)
Se modificó para:
- Aceptar paquetes reales de RevenueCat con información de `currencyCode`
- Usar los precios y símbolos de moneda reales del App Store
- Mantener fallback a precios locales en modo desarrollo

**Características nuevas**:
- Detecta automáticamente el código de moneda de cada paquete
- Formatea precios con el símbolo correcto (S/ para Perú, $ para México/Colombia, etc.)
- Calcula y muestra ahorros con la moneda correcta

### 3. ContextualPaywall Mejorado (`src/components/paywall/ContextualPaywall.tsx`)
Se actualizó el formateo de precios para usar el mismo sistema de mapeo de locales, asegurando consistencia en toda la app.

### 4. Pantallas Actualizadas
Se actualizaron todas las pantallas que usan el paywall para pasar los paquetes de RevenueCat:
- `HomeScreen.tsx`
- `ClientesScreen.tsx`
- `PrestamosScreen.tsx`
- `ClienteDetalleScreen.tsx`

## Ejemplos de Formato por País

| País | Moneda | Símbolo | Ejemplo Formato |
|------|--------|---------|-----------------|
| Perú | PEN | S/ | S/ 29.99 |
| México | MXN | $ | $149.00 |
| Colombia | COP | $ | $29.900 |
| Argentina | ARS | $ | $2.999,00 |
| Chile | CLP | $ | $19.990 |
| USA | USD | $ | $9.99 |
| España | EUR | € | 9,99 € |
| Brasil | BRL | R$ | R$ 49,99 |

## Beneficios

1. **Mejor UX**: Los usuarios ven precios con símbolos de moneda familiares
2. **Mayor confianza**: Elimina confusión sobre la moneda de cobro
3. **Mejores conversiones**: Claridad en los precios aumenta la probabilidad de compra
4. **Cumplimiento**: Mejora la transparencia de precios requerida por las tiendas de apps

## Compatibilidad

- ✅ iOS (App Store)
- ✅ RevenueCat
- ✅ Modo desarrollo (fallback a USD)
- ✅ Todos los países soportados por el App Store

## Logging para Debugging

El sistema incluye logs para ayudar a identificar problemas:
```
💱 Formateando precio: 29.99 PEN
💱 Precio formateado: S/ 29.99
```

## Notas Importantes

- Los símbolos de moneda se obtienen automáticamente de RevenueCat/App Store
- Si no hay código de moneda disponible, usa USD como fallback
- El formato respeta las convenciones locales (decimales, separadores, etc.)
- Funciona tanto en producción como en TestFlight

---

**Fecha**: 10 de octubre, 2025
**Versión**: 1.3.1+

