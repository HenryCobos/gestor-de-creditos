# Solución para Rechazo de Apple - EULA Faltante

## 📋 Resumen del Problema

Apple rechazó la app v1.3.0 porque falta un enlace funcional al EULA (Terms of Use) en los metadatos de la app.

**Guideline violada:** 3.1.2 - Business - Payments - Subscriptions

## ✅ Solución Implementada

He creado y configurado todos los archivos necesarios para cumplir con los requisitos de Apple:

### 1. Archivos Creados

- ✅ `eula.html` - Versión HTML del EULA (formato funcional para navegadores)
- ✅ `netlify-update-files/eula.html` - Copia lista para subir a Netlify
- ✅ Actualizado `app.json` con el enlace correcto al EULA

### 2. Enlaces Actualizados

- ✅ `app.json` ahora incluye: `https://gestordecreditos.netlify.app/eula.html`
- ✅ `support.html` actualizado con enlace al EULA
- ✅ Script `copiar-archivos-web.bat` actualizado

## 📝 Pasos a Seguir

### Paso 1: Subir el archivo EULA a Netlify

Tienes dos opciones:

#### Opción A: Subir manualmente a Netlify
1. Ve a tu panel de Netlify: https://app.netlify.com
2. Selecciona tu sitio `gestordecreditos`
3. Ve a **Deploys** > **Deploy manually**
4. Arrastra el archivo `eula.html` al área de deploy
5. Espera a que el deploy se complete

#### Opción B: Usar el script de copia (si tienes repo de GitHub conectado)
1. Ejecuta el script `copiar-archivos-web.bat` desde PowerShell
2. Ve a la carpeta `../gestor-creditos-website/`
3. Agrega y commitea los cambios:
   ```bash
   git add eula.html
   git commit -m "Agregar EULA en HTML para cumplir requisitos de Apple"
   git push
   ```
4. Netlify detectará el cambio y desplegará automáticamente

### Paso 2: Verificar que el EULA esté accesible

1. Abre tu navegador y verifica que este enlace funcione:
   ```
   https://gestordecreditos.netlify.app/eula.html
   ```
2. Deberías ver una página HTML bien formateada con el EULA completo
3. Verifica que incluya toda la información de suscripciones:
   - Título de las suscripciones ✅
   - Duración (mensual: 1 mes, anual: 12 meses) ✅
   - Precios ($9.99/mes, $59.99/año) ✅
   - Enlace a Privacy Policy ✅

### Paso 3: Actualizar la información en App Store Connect

1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. Selecciona tu app "Gestor de Créditos"
3. Ve a la versión 1.3.0 (o crea la versión 1.3.1)
4. En la sección **App Information** o **App Store** > **App Description**:
   
   **Verifica que la descripción incluya:**
   ```
   Terms of Use (EULA): https://gestordecreditos.netlify.app/eula.html
   Privacy Policy: https://gestordecreditos.netlify.app/POLITICA_PRIVACIDAD.md
   ```

### Paso 4: Opcional - Usar el campo EULA en App Store Connect

Como alternativa (o además), puedes agregar el EULA en el campo dedicado:

1. En App Store Connect, ve a tu app
2. Ve a **App Information** en la barra lateral
3. Busca el campo **License Agreement**
4. Puedes:
   - Seleccionar "Standard Apple EULA" y agregar el enlace en la descripción, O
   - Ingresar tu EULA personalizado (copia el contenido del archivo EULA.md)

### Paso 5: Responder al Rechazo

1. Ve a **Resolution Center** en App Store Connect
2. Busca el rechazo para Submission ID: `59601b63-8356-4e55-b8d9-776d12c49c61`
3. Haz clic en **Reply** o **Submit**
4. Escribe una respuesta como esta:

```
Hello App Review Team,

Thank you for your feedback. I have now added a functional link to our Terms of Use (EULA) in the app's metadata.

The EULA is now available at:
https://gestordecreditos.netlify.app/eula.html

This link includes all required information for auto-renewable subscriptions:
- Subscription titles (Premium Monthly and Premium Annual)
- Duration (1 month and 12 months)
- Pricing ($9.99/month and $59.99/year)
- Link to Privacy Policy

The EULA link has been included in the App Description field. 

Please review the updated submission.

Best regards,
Apper2025
```

### Paso 6: Crear nueva build (si es necesario)

**IMPORTANTE:** Apple mencionó que falta el enlace en los **metadatos**, no en el binario. Por lo tanto, **NO necesitas crear una nueva build**.

Sin embargo, si el `app.json` con el enlace actualizado no se reflejó en App Store Connect:

1. Ejecuta en tu terminal:
   ```bash
   eas build --platform ios --profile production
   ```
2. Espera a que el build se complete
3. Sube el nuevo build a App Store Connect
4. Crea una nueva versión 1.3.1 con el build actualizado

## 📋 Checklist Final

Antes de reenviar:

- [ ] El archivo `eula.html` está subido a Netlify
- [ ] El enlace `https://gestordecreditos.netlify.app/eula.html` funciona correctamente
- [ ] La descripción en App Store Connect incluye el enlace al EULA
- [ ] El EULA incluye toda la información requerida de suscripciones
- [ ] Has respondido al rechazo en Resolution Center

## 🎯 Información Requerida por Apple

Tu EULA ahora incluye toda la información requerida:

### En el Binario (dentro de la app):
Ya implementado en `ContextualPaywall.tsx`:
- ✅ Título de suscripciones: "Premium Mensual" y "Premium Anual"
- ✅ Duración: "1 mes" y "12 meses"
- ✅ Precios: "$9.99/mes" y "$59.99/año"
- ✅ Enlaces funcionales a Privacy Policy y EULA

### En los Metadatos (App Store Connect):
- ✅ Enlace funcional al EULA en la descripción de la app
- ✅ Enlace a Privacy Policy en el campo dedicado

## ❓ Preguntas Frecuentes

### ¿Necesito crear un nuevo build?
**No**, si solo actualizaste los metadatos (descripción de la app). Apple puede aprobar la misma versión 1.3.0 con los metadatos actualizados.

### ¿Cuánto tiempo tarda Apple en revisar después de responder?
Típicamente 24-48 horas después de responder al rechazo.

### ¿Qué pasa si vuelven a rechazar?
Si Apple rechaza nuevamente, contáctame y revisaremos qué información adicional necesitan.

### ¿Debo usar el EULA estándar de Apple?
No, tu EULA personalizado está bien y es más específico para tu app. Es mejor tener un EULA personalizado para apps con suscripciones.

## 📞 Soporte

Si tienes alguna duda o problema:
- Email: Apper2025@icloud.com
- Revisa el archivo `APPLE_REVIEW_RESPONSES.md` para más ejemplos de respuestas

---

**Última actualización:** 5 de octubre de 2025  
**Versión de la app:** 1.3.0  
**Estado:** ✅ Solución lista para implementar
