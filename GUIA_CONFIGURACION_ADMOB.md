# 🎯 Guía Completa: Configuración de AdMob con tu Dominio

## 📋 Paso a Paso para Configurar AdMob

### ⚠️ ANTES DE EMPEZAR

**IMPORTANTE**: Esta guía asume que ya tienes tu sitio web funcionando en Netlify con el archivo `app-ads.txt` accesible.

**Verifica primero**: `https://tu-sitio.netlify.app/app-ads.txt` debe mostrar:
```
google.com, pub-4349408589058649, DIRECT, f08c47fec0942fa0
# iOS App Bundle ID: com.gestordecreditos.app
# AdMob App ID: ca-app-pub-4349408589058649~7588427896
```

---

## 🚀 Paso 1: Acceder a tu Cuenta de AdMob

1. **Abrir AdMob**:
   - Ve a: https://admob.google.com
   - Inicia sesión con tu cuenta de Google

2. **Seleccionar tu aplicación**:
   - En el dashboard, busca "Gestor de Créditos"
   - Si tienes múltiples apps, asegúrate de seleccionar la correcta (iOS)

---

## 📱 Paso 2: Configurar la Verificación de la Aplicación

### 2.1 Acceder a Configuración de la App

1. **Navegar a configuración**:
   - Haz clic en "Apps" en el menú lateral
   - Selecciona "Gestor de Créditos (iOS)"
   - Haz clic en "App settings" o "Configuración de la aplicación"

### 2.2 Agregar Información del Sitio Web

1. **Buscar sección "App verification" o "Verificación de la aplicación"**:
   - Puede estar en "App settings" > "App verification"
   - O en una sección llamada "Publisher website"

2. **Agregar tu dominio**:
   - Campo "Website URL" o "URL del sitio web"
   - Ingresa: `https://tu-sitio.netlify.app`
   - **EJEMPLO**: `https://gestordecreditos.netlify.app`

3. **Verificar configuración**:
   - Asegúrate de que la URL sea exactamente la misma donde está tu `app-ads.txt`
   - NO agregues `/app-ads.txt` al final, solo el dominio base

---

## 🔧 Paso 3: Configurar app-ads.txt en AdMob

### 3.1 Sección app-ads.txt

1. **Buscar configuración de app-ads.txt**:
   - En la configuración de la aplicación
   - Busca una sección llamada "app-ads.txt" o "Ads.txt for apps"

2. **Verificar información**:
   - **Publisher ID**: `pub-4349408589058649`
   - **Domain**: Tu dominio de Netlify (ej: `gestordecreditos.netlify.app`)
   - **App-ads.txt URL**: `https://tu-sitio.netlify.app/app-ads.txt`

### 3.2 Información de la Aplicación

Verifica que esta información coincida:

```
📱 INFORMACIÓN DE LA APP:
- App Name: Gestor de Créditos
- Platform: iOS
- Bundle ID: com.gestordecreditos.app
- AdMob App ID: ca-app-pub-4349408589058649~7588427896

🌐 INFORMACIÓN WEB:
- Domain: tu-sitio.netlify.app
- app-ads.txt URL: https://tu-sitio.netlify.app/app-ads.txt
- Publisher ID: pub-4349408589058649
```

---

## ✅ Paso 4: Proceso de Verificación

### 4.1 Iniciar Verificación

1. **Guardar configuración**:
   - Haz clic en "Save" o "Guardar"
   - AdMob comenzará el proceso de verificación automáticamente

2. **Esperar verificación inicial**:
   - El proceso puede tomar de 5 minutos a 24 horas
   - AdMob intentará acceder a tu `app-ads.txt`

### 4.2 Estados de Verificación

Durante el proceso verás uno de estos estados:

- 🟡 **"Pending verification"** - Verificación en proceso
- 🟢 **"Verified"** - Verificación exitosa
- 🔴 **"Verification failed"** - Error en verificación

---

## 🔍 Paso 5: Resolución de Problemas

### 5.1 Si la Verificación Falla

1. **Verificar URLs**:
   ```bash
   # Verifica que estos enlaces funcionen:
   https://tu-sitio.netlify.app
   https://tu-sitio.netlify.app/app-ads.txt
   ```

2. **Verificar contenido de app-ads.txt**:
   - Debe mostrar exactamente el contenido correcto
   - Sin errores 404 o redirecciones

3. **Verificar en múltiples navegadores**:
   - Chrome (incógnito)
   - Safari (navegación privada)
   - Firefox

### 5.2 Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Domain not found" | URL incorrecta | Verificar que la URL sea exacta |
| "app-ads.txt not found" | Archivo no accesible | Re-subir archivo a Netlify |
| "Invalid content" | Contenido incorrecto | Verificar Publisher ID |
| "Redirect detected" | Redirecciones 301/302 | Configurar redirects en Netlify |

---

## 🎯 Paso 6: Confirmación Final

### 6.1 Verificación Exitosa

Una vez verificado, deberías ver:

1. **En AdMob**:
   - Estado: "Verified" ✅
   - App-ads.txt: "Valid" ✅
   - Domain: "Verified" ✅

2. **En tu app**:
   - Los anuncios comenzarán a servirse normalmente
   - Mejor llenado de anuncios (fill rate)

### 6.2 Métricas a Monitorear

Después de la verificación:

- **Fill Rate**: Debe mejorar gradualmente
- **eCPM**: Ingresos por mil impresiones
- **Requests**: Solicitudes de anuncios exitosas

---

## 📧 Paso 7: Contacto con Soporte (Si es necesario)

### 7.1 Información para Soporte

Si necesitas contactar soporte de AdMob:

```
📝 INFORMACIÓN PARA SOPORTE:
- Publisher ID: pub-4349408589058649
- App ID: ca-app-pub-4349408589058649~7588427896
- Bundle ID: com.gestordecreditos.app
- Domain: tu-sitio.netlify.app
- app-ads.txt URL: https://tu-sitio.netlify.app/app-ads.txt
- Error message: [descripción del error]
```

### 7.2 Canales de Soporte

1. **AdMob Help Center**: https://support.google.com/admob
2. **Community Forum**: https://groups.google.com/g/google-admob-ads-sdk
3. **Contact Form**: A través del dashboard de AdMob

---

## ⏱️ Tiempos Esperados

| Proceso | Tiempo Estimado |
|---------|-----------------|
| Subida a Netlify | 2-5 minutos |
| Propagación DNS | 5-15 minutos |
| Verificación inicial AdMob | 5 minutos - 24 horas |
| Verificación completa | 24-48 horas |
| Mejora en fill rate | 2-7 días |

---

## 🎉 ¡Felicitaciones!

Una vez completados todos estos pasos, tu aplicación estará completamente verificada con AdMob y los anuncios funcionarán de manera óptima.

### Próximos Pasos Recomendados:

1. **Monitorear métricas** en el dashboard de AdMob
2. **Optimizar placement** de anuncios en tu app
3. **Revisar performance** semanalmente
4. **Mantener actualizado** el archivo app-ads.txt

---

**¿Necesitas ayuda con algún paso específico?** No dudes en preguntar. 🚀
