# 🛒 Guía Completa de RevenueCat para Producción

## 🎯 **Objetivo: Monetización Completa con RevenueCat**

Esta guía te llevará paso a paso para configurar RevenueCat correctamente y evitar los errores de compilación.

## 📋 **Paso 1: Configuración en App Store Connect**

### ✅ **Crear Productos de Suscripción**

1. **Ve a [App Store Connect](https://appstoreconnect.apple.com)**
2. **Selecciona tu app "Gestor de Créditos"**
3. **Ve a Features > In-App Purchases**
4. **Crea un Subscription Group:**
   - **Reference Name**: `Gestor de Créditos Pro`
   - **App Store Display Name**: `Gestor de Créditos Pro`

5. **Crea los productos:**

**Producto Mensual:**
- **Product ID**: `gdc_pro_monthly`
- **Reference Name**: `Gestor de Créditos Pro - Mensual`
- **Price**: $9.99 USD
- **Subscription Duration**: 1 Month
- **Subscription Group**: Gestor de Créditos Pro

**Producto Anual:**
- **Product ID**: `gdc_pro_yearly`
- **Reference Name**: `Gestor de Créditos Pro - Anual`
- **Price**: $59.99 USD
- **Subscription Duration**: 1 Year
- **Subscription Group**: Gestor de Créditos Pro

### ✅ **Configurar Sandbox Testing**

1. **Ve a Users and Access > Sandbox Testers**
2. **Crea cuentas de prueba:**
   - Email: `test1@example.com`
   - Password: `Test123456`
   - Country: Estados Unidos

## 📋 **Paso 2: Configuración en RevenueCat Dashboard**

### ✅ **Crear Proyecto**

1. **Ve a [RevenueCat Dashboard](https://app.revenuecat.com)**
2. **Crea un nuevo proyecto:**
   - **Name**: `Gestor de Créditos`
   - **Bundle ID**: `com.gestordecreditos.app`

### ✅ **Configurar App Store Connect**

1. **Ve a Apps > iOS**
2. **Añade tu app:**
   - **Bundle ID**: `com.gestordecreditos.app`
   - **App Store Connect API Key**: [Tu API Key de App Store Connect]

### ✅ **Configurar Productos**

1. **Ve a Products**
2. **Añade los productos:**
   - `gdc_pro_monthly` (Monthly)
   - `gdc_pro_yearly` (Annual)

### ✅ **Configurar Entitlements**

1. **Ve a Entitlements**
2. **Crea un entitlement:**
   - **Identifier**: `pro`
   - **Display Name**: `Pro Features`
3. **Asocia los productos al entitlement `pro`**

### ✅ **Configurar Offerings**

1. **Ve a Offerings**
2. **Crea una offering:**
   - **Identifier**: `default`
   - **Display Name**: `Default Offering`
3. **Añade ambos productos a la offering**

## 📋 **Paso 3: Configuración en el Código**

### ✅ **API Key (Ya configurada)**
```json
// app.json
"extra": {
  "REVENUECAT_API_KEY": "appl_HBAAMBPWVHCSzpewyTSsBEPiEjf"
}
```

### ✅ **Configuración iOS (Ya configurada)**
```json
// app.json
"ios": {
  "buildConfiguration": {
    "OTHER_SWIFT_FLAGS": "-D REVENUECAT_DISABLE_APPLE_LOGGING -D REVENUECAT_DISABLE_APPLE_LOGGING -D REVENUECAT_DISABLE_APPLE_LOGGING -D REVENUECAT_DISABLE_APPLE_LOGGING -D REVENUECAT_DISABLE_APPLE_LOGGING -D REVENUECAT_DISABLE_APPLE_LOGGING -D REVENUECAT_DISABLE_APPLE_LOGGING -D REVENUECAT_DISABLE_APPLE_LOGGING -D REVENUECAT_DISABLE_APPLE_LOGGING -D REVENUECAT_DISABLE_APPLE_LOGGING"
  }
}
```

## 📋 **Paso 4: Testing**

### ✅ **Sandbox Testing**

1. **Instala el build en tu dispositivo**
2. **Configura el dispositivo con una cuenta sandbox**
3. **Prueba las compras:**
   - Toca un plan en el paywall
   - Completa la compra con la cuenta sandbox
   - Verifica que se active el estado premium

### ✅ **Verificación de Logs**

Los logs deberían mostrar:
```
✅ RevenueCat inicializado correctamente
📦 Obteniendo ofertas reales
🛒 Iniciando compra real: {identifier: "gdc_pro_monthly", ...}
✅ Compra exitosa: {entitlements: ["pro"], isPro: true}
```

## 📋 **Paso 5: Solución de Problemas**

### ❌ **Error: "No products available"**

**Causa**: Productos no configurados correctamente
**Solución**:
1. Verificar que los productos estén en estado "Ready for Sale"
2. Verificar que los Product IDs coincidan exactamente
3. Verificar que la API key sea correcta

### ❌ **Error: "Purchase failed"**

**Causa**: Problema con la cuenta sandbox
**Solución**:
1. Verificar que la cuenta sea sandbox
2. Verificar que el producto esté disponible en la región
3. Verificar logs de RevenueCat dashboard

### ❌ **Error: "Entitlement not active"**

**Causa**: Entitlement no configurado
**Solución**:
1. Verificar que el entitlement `pro` esté configurado
2. Verificar que los productos estén asociados al entitlement
3. Verificar que la compra se haya completado

## 📋 **Paso 6: Producción**

### ✅ **Preparar para App Store**

1. **Verificar que todos los productos estén aprobados**
2. **Probar en sandbox con cuentas reales**
3. **Verificar que las compras funcionen correctamente**
4. **Subir a App Store Connect**

### ✅ **Monitoreo**

1. **RevenueCat Dashboard** - Monitorear compras y conversiones
2. **App Store Connect** - Monitorear ingresos y métricas
3. **Logs de la app** - Monitorear errores y problemas

## 🚀 **Comandos Útiles**

### Verificar Build
```bash
eas build:list --platform=ios --limit=5
```

### Nuevo Build
```bash
eas build --platform ios --profile development --clear-cache
```

### Ver Logs de Build
```bash
eas build:view [BUILD_ID]
```

## 📱 **Estado Actual**

- ✅ **RevenueCat 6.2.0** - Versión estable instalada
- ✅ **Configuración iOS** - Flags optimizados para evitar conflictos
- ✅ **Servicio híbrido** - Funciona en desarrollo y producción
- ✅ **API Key configurada** - Lista para usar
- ✅ **Build en progreso** - Probando compilación

## 🎯 **Próximos Pasos**

1. **✅ Esperar build exitoso**
2. **✅ Configurar productos en App Store Connect**
3. **✅ Configurar RevenueCat Dashboard**
4. **✅ Probar compras en sandbox**
5. **✅ Preparar para producción**

---

**Nota**: Esta configuración te permitirá monetizar tu app completamente con RevenueCat sin problemas de compilación.
