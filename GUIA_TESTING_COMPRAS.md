# 🧪 Guía de Testing de Compras - Gestor de Créditos

## 📱 Configuración para Testing

### 1. **Configuración de Sandbox en App Store Connect**

1. **Crear cuenta de Sandbox:**
   - Ve a App Store Connect
   - Users and Access > Sandbox Testers
   - Crea una cuenta de prueba con email único
   - **IMPORTANTE:** Usa un email que NO esté asociado a tu Apple ID

2. **Configurar productos en App Store Connect:**
   - Products > In-App Purchases
   - Crear suscripción mensual: `gdc_pro_monthly` - $9.99/mes
   - Crear suscripción anual: `gdc_pro_yearly` - $59.99/año
   - Estado: "Ready to Submit" o "Approved"

### 2. **Configuración de RevenueCat**

1. **Verificar API Key:**
   - En `app.json` línea 53: `REVENUECAT_API_KEY`
   - Debe ser la key de iOS: `appl_HBAAMBPWVHCSzpewyTSsBEPiEjf`

2. **Configurar productos en RevenueCat:**
   - Dashboard > Products
   - Crear productos con los mismos IDs:
     - `gdc_pro_monthly` (Monthly)
     - `gdc_pro_yearly` (Annual)
   - Asociar con App Store Connect

3. **Configurar Entitlements:**
   - Dashboard > Entitlements
   - Crear entitlement: `pro`
   - Asociar ambos productos al entitlement `pro`

### 3. **Testing en Dispositivo Real**

**⚠️ IMPORTANTE:** Las compras NO funcionan en simulador, solo en dispositivo real.

1. **Configurar cuenta de Sandbox:**
   - Settings > App Store > Sandbox Account
   - Iniciar sesión con la cuenta de sandbox creada

2. **Instalar app desde Xcode:**
   - Build y run en dispositivo físico
   - NO usar Expo Go (RevenueCat no funciona en Expo Go)

3. **Probar compras:**
   - Abrir la app
   - Ir a cualquier paywall
   - Seleccionar plan mensual o anual
   - Confirmar compra en el diálogo de App Store
   - Verificar que se active el estado premium

## 🔍 Debugging y Logs

### 1. **Verificar Logs de RevenueCat**

Los logs aparecerán en la consola de Xcode:

```
🔧 Configurando RevenueCat en modo desarrollo/sandbox
✅ RevenueCat inicializado correctamente
🛒 Iniciando compra: { identifier: 'gdc_pro_monthly', packageType: 'MONTHLY', price: '$9.99' }
✅ Compra exitosa: { entitlements: ['pro'], isPro: true }
```

### 2. **Verificar Estado de Premium**

En la app, verifica que:
- El estado `isPremium` cambie a `true`
- Los límites se desbloqueen
- Las funciones premium estén disponibles

### 3. **Problemas Comunes**

**❌ "No packages available":**
- Verificar que los productos estén configurados en RevenueCat
- Verificar que el entitlement `pro` esté asociado a los productos
- Verificar que la API key sea correcta

**❌ "Purchase failed":**
- Verificar que estés usando cuenta de sandbox
- Verificar que los productos estén aprobados en App Store Connect
- Verificar que no estés en Expo Go

**❌ "User cancelled":**
- Normal, el usuario canceló la compra
- No es un error, solo tracking

## 🛠️ Comandos de Testing

### 1. **Build para Testing**

```bash
# Build para dispositivo físico
npx expo run:ios --device

# O usando EAS
eas build --platform ios --profile development
```

### 2. **Verificar Configuración**

```bash
# Verificar que la API key esté configurada
grep -r "REVENUECAT_API_KEY" app.json

# Verificar que no haya errores de TypeScript
npx tsc --noEmit
```

## 📊 Verificación de Funcionamiento

### 1. **Flujo de Compra Exitoso**

1. ✅ App se inicia sin errores
2. ✅ RevenueCat se inicializa correctamente
3. ✅ Paywall muestra planes con precios reales
4. ✅ Al tocar un plan, aparece diálogo de App Store
5. ✅ Al confirmar, se procesa la compra
6. ✅ Estado premium se activa inmediatamente
7. ✅ Funciones premium se desbloquean

### 2. **Verificar en RevenueCat Dashboard**

- Customer aparece en la lista
- Purchase se registra correctamente
- Entitlement `pro` está activo

### 3. **Verificar en App Store Connect**

- Sandbox purchase aparece en Sales and Trends
- No hay errores en el reporte

## 🚨 Troubleshooting

### Error: "Purchases no disponible en Expo Go"
**Solución:** Usar build nativo, no Expo Go

### Error: "No packages available"
**Solución:** 
1. Verificar configuración en RevenueCat
2. Verificar que los productos estén aprobados
3. Verificar API key

### Error: "Purchase failed"
**Solución:**
1. Verificar cuenta de sandbox
2. Verificar que los productos existan en App Store Connect
3. Verificar conexión a internet

### Los botones no responden
**Solución:**
1. Verificar que `onSelect` esté conectado correctamente
2. Verificar que no haya errores de JavaScript
3. Verificar que el paywall esté recibiendo los packages

## 📝 Checklist de Testing

- [ ] Cuenta de sandbox creada en App Store Connect
- [ ] Productos configurados en App Store Connect
- [ ] Productos configurados en RevenueCat
- [ ] Entitlement `pro` creado y asociado
- [ ] App instalada en dispositivo físico
- [ ] Cuenta de sandbox configurada en el dispositivo
- [ ] Paywall muestra planes correctamente
- [ ] Botones de compra responden
- [ ] Compra se procesa correctamente
- [ ] Estado premium se activa
- [ ] Funciones premium se desbloquean

## 🎯 Próximos Pasos

1. **Configurar todo según esta guía**
2. **Probar en dispositivo físico**
3. **Verificar logs en consola**
4. **Confirmar que las compras funcionen**
5. **Probar restauración de compras**

---

**¿Necesitas ayuda?** Revisa los logs en la consola de Xcode para más detalles sobre cualquier error.
