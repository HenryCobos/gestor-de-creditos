# 🛒 Configuración de RevenueCat para Gestor de Créditos

## 📋 Checklist de Configuración

### 1. **Configuración en RevenueCat Dashboard**

#### ✅ **Productos en App Store Connect**
1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. Selecciona tu app "Gestor de Créditos"
3. Ve a **Features > In-App Purchases**
4. Crea los siguientes productos:

**Producto Mensual:**
- **Product ID**: `gdc_pro_monthly`
- **Reference Name**: `Gestor de Créditos Pro - Mensual`
- **Price**: $9.99 USD
- **Type**: Auto-Renewable Subscription
- **Subscription Group**: Crear grupo "Gestor de Créditos Pro"

**Producto Anual:**
- **Product ID**: `gdc_pro_yearly`
- **Reference Name**: `Gestor de Créditos Pro - Anual`
- **Price**: $59.99 USD
- **Type**: Auto-Renewable Subscription
- **Subscription Group**: Mismo grupo "Gestor de Créditos Pro"

#### ✅ **Configuración en RevenueCat**
1. Ve a [RevenueCat Dashboard](https://app.revenuecat.com)
2. Selecciona tu proyecto "Gestor de Créditos"
3. Ve a **Products** y añade:
   - `gdc_pro_monthly` (Monthly)
   - `gdc_pro_yearly` (Annual)

#### ✅ **Entitlements**
1. Ve a **Entitlements**
2. Crea un entitlement llamado `pro`
3. Asocia ambos productos (`gdc_pro_monthly` y `gdc_pro_yearly`) al entitlement `pro`

#### ✅ **Offerings**
1. Ve a **Offerings**
2. Crea una offering llamada `default`
3. Añade ambos productos a la offering

### 2. **Configuración en el Código**

#### ✅ **API Key (Ya configurada)**
```json
// app.json
"extra": {
  "REVENUECAT_API_KEY": "appl_HBAAMBPWVHCSzpewyTSsBEPiEjf"
}
```

#### ✅ **Productos en el Código**
Los productos ya están configurados en `src/services/purchases.ts`:
- `gdc_pro_monthly` - Plan mensual
- `gdc_pro_yearly` - Plan anual

### 3. **Testing**

#### ✅ **Sandbox Testing**
1. Crea cuentas de prueba en App Store Connect
2. Configura el dispositivo con una cuenta sandbox
3. Usa el build de desarrollo para probar compras

#### ✅ **Verificación de Logs**
Los logs deberían mostrar:
```
✅ RevenueCat inicializado correctamente
🛒 Iniciando compra real: {identifier: "gdc_pro_monthly", ...}
✅ Compra exitosa: {entitlements: ["pro"], isPro: true}
```

## 🔧 **Comandos Útiles**

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

## 🚨 **Solución de Problemas**

### Error: "No products available"
- Verificar que los productos estén aprobados en App Store Connect
- Verificar que los Product IDs coincidan exactamente
- Verificar que la API key sea correcta

### Error: "Purchase failed"
- Verificar que la cuenta sea sandbox
- Verificar que el producto esté disponible en la región
- Verificar logs de RevenueCat dashboard

### Error: "Entitlement not active"
- Verificar que el entitlement `pro` esté configurado
- Verificar que los productos estén asociados al entitlement
- Verificar que la compra se haya completado

## 📱 **Próximos Pasos**

1. ✅ **Completar configuración en RevenueCat Dashboard**
2. ✅ **Esperar build de iOS**
3. ✅ **Probar compras en sandbox**
4. ✅ **Verificar activación de premium**
5. ✅ **Preparar para producción**

---

**Nota**: Asegúrate de que todos los productos estén en estado "Ready for Sale" en App Store Connect antes de probar.
