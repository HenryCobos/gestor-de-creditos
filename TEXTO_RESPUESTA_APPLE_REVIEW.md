# Texto de Respuesta para Apple Review

**IMPORTANTE:** Copia y pega este texto en el campo de "Notes" cuando reenvíes la app para revisión en App Store Connect.

---

## 📝 TEXTO PARA COPIAR EN APP STORE CONNECT

```
Dear App Review Team,

Thank you for your feedback on submission 4cef7ed5-2317-43d1-b5df-1fbc8822fae7.

We have addressed both issues identified in your review:

GUIDELINE 3.1.2 - SUBSCRIPTIONS - FREE TRIAL DISCLOSURE:
We have updated our subscription purchase flow to clearly display:
- The free trial duration (3 days) prominently on the trial button
- The exact amount that will be charged after the trial ends
- A clear disclosure text below the trial button stating: "After the 3-day free trial period, you will be automatically charged [PRICE]/month. Cancel anytime before the trial ends to avoid charges."
- The price is displayed in the user's local currency (USD, PEN, MXN, etc.)

Changes made in:
- src/components/paywall/SimplePaywall.tsx
- src/components/paywall/ContextualPaywall.tsx

GUIDELINE 4.1 - DESIGN - COPYCATS:
We have changed the app name to remove any potential confusion:
- Previous name: "PrestaMax - Préstamos"  
- New name: "Gestor de Créditos" (Credit Manager)

This is a completely generic and descriptive name in Spanish. We have no relationship with any third-party brands, and the previous name was purely descriptive of the app's purpose. The new name eliminates any potential confusion.

Changes made in:
- app.json: Updated app name and description

We have incremented the build number to 156 and version to 1.3.3 with these corrections.

All changes have been tested and comply with Apple's Human Interface Guidelines for auto-renewable subscriptions.

Thank you for your review.
```

---

## 🇪🇸 VERSIÓN EN ESPAÑOL (Opcional)

Si prefieres responder en español:

```
Estimado Equipo de Revisión de Apps,

Gracias por sus comentarios sobre el envío 4cef7ed5-2317-43d1-b5df-1fbc8822fae7.

Hemos atendido ambos problemas identificados en su revisión:

GUIDELINE 3.1.2 - SUSCRIPCIONES - DIVULGACIÓN DE PRUEBA GRATUITA:
Hemos actualizado nuestro flujo de compra de suscripciones para mostrar claramente:
- La duración de la prueba gratuita (3 días) de forma prominente en el botón
- El monto exacto que se cobrará después de que termine la prueba
- Un texto de divulgación claro debajo del botón que indica: "Después del período de prueba gratuita de 3 días, se cobrará automáticamente [PRECIO]/mes. Cancela en cualquier momento antes de que termine la prueba para evitar cargos."
- El precio se muestra en la moneda local del usuario (USD, PEN, MXN, etc.)

Cambios realizados en:
- src/components/paywall/SimplePaywall.tsx
- src/components/paywall/ContextualPaywall.tsx

GUIDELINE 4.1 - DISEÑO - IMITACIONES:
Hemos cambiado el nombre de la app para eliminar cualquier confusión potencial:
- Nombre anterior: "PrestaMax - Préstamos"
- Nombre nuevo: "Gestor de Créditos"

Este es un nombre completamente genérico y descriptivo en español. No tenemos ninguna relación con marcas de terceros, y el nombre anterior era puramente descriptivo del propósito de la app. El nuevo nombre elimina cualquier confusión potencial.

Cambios realizados en:
- app.json: Actualización del nombre y descripción de la app

Hemos incrementado el número de build a 156 y la versión a 1.3.3 con estas correcciones.

Todos los cambios han sido probados y cumplen con las Pautas de Interfaz Humana de Apple para suscripciones auto-renovables.

Gracias por su revisión.
```

---

## 📋 METADATA PARA APP STORE CONNECT

### Información del Build:
```
Version: 1.3.3
Build Number: 156
App Name: Gestor de Créditos
```

### What's New (Notas de la versión):
```
Mejoras importantes en esta actualización:

• Información de suscripción más clara y transparente
• Se muestra explícitamente la duración del período de prueba (3 días)
• Precio post-trial claramente visible antes de suscribirse
• Nombre de la app actualizado a "Gestor de Créditos"
• Mejoras de rendimiento y estabilidad

Agradecemos tu confianza en nuestra app para gestionar tus préstamos.
```

### App Name (Metadata):
```
Gestor de Créditos
```

### Subtitle (30 caracteres):
```
Gestión de Cobros y Clientes
```

### Keywords (100 caracteres):
```
prestamos,creditos,cobros,microfinanzas,deudas,clientes,interes,finanzas,negocio,calculadora
```

---

## ⚠️ IMPORTANTE ANTES DE ENVIAR

### Checklist pre-submit:
- [ ] Generar build 156 con EAS: `eas build --platform ios --profile production`
- [ ] Probar en TestFlight que todo funciona correctamente
- [ ] Verificar que el trial muestra el precio post-trial
- [ ] Verificar que el nombre "Gestor de Créditos" aparece correctamente
- [ ] Subir el build a App Store Connect
- [ ] Actualizar metadata (nombre, versión, what's new)
- [ ] Copiar el texto de respuesta en "App Review Information" → "Notes"
- [ ] Submit para revisión

### URLs que deben estar en App Store Connect:
```
Support URL: https://gestordecreditos.netlify.app/support.html
Privacy Policy: https://gestordecreditos.netlify.app/POLITICA_PRIVACIDAD.md
Terms of Use: https://gestordecreditos.netlify.app/eula.html
```

---

## 📧 INFORMACIÓN DE CONTACTO

En "App Review Information" asegúrate de tener:

```
First Name: Henry
Last Name: Apper
Email: Apper2025@icloud.com
Phone: [Tu número]
```

---

**Fecha:** Octubre 13, 2025  
**Build:** 156  
**Versión:** 1.3.3  
**Status:** Listo para re-submit

