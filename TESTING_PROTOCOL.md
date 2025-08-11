# 🧪 PROTOCOLO DE TESTING SEGURO - AdMob

## ⚠️ IMPORTANTE: EVITAR SUSPENSIÓN DE CUENTA ADMOB

### 🔴 PELIGROS DE TESTING CON ANUNCIOS REALES:
- Hacer click en tus propios anuncios = **SUSPENSIÓN INMEDIATA**
- Generar impresiones artificiales afecta métricas
- Google detecta patrones sospechosos automáticamente

### ✅ TESTING SEGURO - CONFIGURACIÓN ACTUAL:

**Archivo:** `src/services/admobService.ts`
```typescript
// MODO TESTING SEGURO - Cambiar a true para testing
const USE_TEST_ADS = true; // ⚠️ CAMBIAR A false ANTES DE PUBLICAR
```

### 📱 BUILDS DISPONIBLES:

1. **Testing Build (ACTUAL)**: 
   - Link: https://expo.dev/accounts/henryapper/projects/gestor-de-creditos/builds/611832ec-fc78-412a-bdd9-db13948e0211
   - Estado: ✅ ANUNCIOS DE PRUEBA
   - Seguro para testing completo

2. **Production Build (ANTERIOR)**:
   - Link: https://expo.dev/artifacts/eas/wqL5YRXPV3baKAd6xG7FrH.ipa
   - Estado: ⚠️ ANUNCIOS REALES
   - Solo para App Store

### 🧪 PROTOCOLO DE TESTING:

#### FASE 1: Testing Funcional (BUILD ACTUAL)
- [ ] Instalar testing build
- [ ] Crear clientes y préstamos
- [ ] Verificar calendario y cuotas
- [ ] Probar notificaciones
- [ ] Verificar que aparezcan anuncios de prueba
- [ ] ✅ SEGURO hacer click en anuncios

#### FASE 2: Testing Final
- [ ] Verificar que todo funciona
- [ ] Tomar capturas de pantalla
- [ ] Preparar para App Store

#### FASE 3: Cambio a Producción
Solo cuando estés listo para publicar:

1. Cambiar en `src/services/admobService.ts`:
```typescript
const USE_TEST_ADS = false; // ⚠️ PRODUCCIÓN
```

2. Hacer nuevo build:
```bash
npm run build:ios
```

### 🚨 REGLAS DE ORO:

1. **NUNCA** hagas click en anuncios reales
2. **SIEMPRE** usa testing build para probar
3. **SOLO** cambia a anuncios reales para App Store
4. **VERIFICA** la configuración antes de cada build

### 📞 EN CASO DE PROBLEMAS:
- Testing build no funciona → Contactar soporte
- Anuncios no aparecen → Verificar configuración
- Dudas sobre AdMob → Consultar políticas de Google