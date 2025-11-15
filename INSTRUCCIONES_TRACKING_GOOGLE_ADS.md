# 📊 Instrucciones de Configuración de Tracking para Google Ads

## ✅ Lo que se ha implementado en tu Landing Page

Tu landing page ahora tiene un sistema completo de tracking que incluye:

1. **Google Tag Manager (GTM)**
2. **Google Analytics 4 (GA4)**
3. **Google Ads Conversion Tracking**
4. **Eventos personalizados**

---

## 🔧 Paso 1: Configurar Google Analytics 4

### 1.1 Crear cuenta de Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Haz clic en "Empezar a medir"
3. Crea una propiedad (nombre: "Gestor de Créditos Landing")
4. Selecciona "Web" como plataforma
5. Copia tu **MEASUREMENT ID** (formato: `G-XXXXXXXXXX`)

### 1.2 Reemplazar en tu código

Abre tu archivo `index.html` y reemplaza:
```javascript
gtag('config', 'G-XXXXXXXXXX');
```

Por tu ID real, ejemplo:
```javascript
gtag('config', 'G-ABC123XYZ');
```

---

## 🎯 Paso 2: Configurar Google Ads Conversion Tracking

### 2.1 Crear cuenta de Google Ads

1. Ve a [Google Ads](https://ads.google.com/)
2. Crea una cuenta nueva si no tienes
3. Ve a **Herramientas y configuración** → **Medición** → **Conversiones**

### 2.2 Crear conversión de "Descarga de App"

1. Haz clic en **+ Nueva acción de conversión**
2. Selecciona **Sitio web**
3. Configura:
   - **Nombre**: "Descarga App Store"
   - **Categoría**: Envío de formulario de cliente potencial
   - **Valor**: 10 USD (valor estimado de un cliente)
   - **Recuento**: Una
   - **Período de conversión**: 30 días
   - **Modelo de atribución**: Último clic

4. Haz clic en **Crear y continuar**
5. Selecciona **Usar Google Tag**
6. Copia el **CONVERSION ID** (formato: `AW-XXXXXXXXX/yyyyyyyyyy`)

### 2.3 Reemplazar en tu código

En `index.html`, busca estas líneas y reemplaza:

```javascript
// Línea 35
gtag('config', 'AW-XXXXXXXXX');
```

```javascript
// Línea 43
'send_to': 'AW-XXXXXXXXX/CONVERSION_ID'
```

Ejemplo real:
```javascript
gtag('config', 'AW-123456789');

'send_to': 'AW-123456789/AbC123dEfGhIjKlMnOp'
```

---

## 🏷️ Paso 3: Configurar Google Tag Manager (Opcional pero recomendado)

### 3.1 Crear cuenta de GTM

1. Ve a [Google Tag Manager](https://tagmanager.google.com/)
2. Crea una cuenta y un contenedor
3. Copia tu **CONTAINER ID** (formato: `GTM-XXXXXXX`)

### 3.2 Reemplazar en tu código

En `index.html`, reemplaza **ambas** instancias de `GTM-XXXXXXX`:

Línea 13:
```javascript
})(window,document,'script','dataLayer','GTM-ABC1234');
```

Línea 111:
```html
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-ABC1234"
```

---

## 📈 Eventos que se están rastreando

Tu landing page ahora rastrea automáticamente:

### 1. **Conversión Principal: Click en Descarga**
- Cada vez que alguien hace clic en "Descargar en App Store"
- Se registra como conversión en Google Ads
- Valor: configurable (recomendado $10)

### 2. **Engagement: Ver Video**
- Cuando alguien hace clic en "Ver Demo"
- Útil para remarketing

### 3. **Leads: Formulario de WhatsApp**
- Cuando alguien envía el formulario
- Se registra como "generate_lead"

### 4. **Scroll Depth**
- Se rastrea cuando los usuarios hacen scroll al:
  - 25% de la página
  - 50% de la página
  - 75% de la página
  - 100% de la página

---

## 🎯 Paso 4: Crear Conversiones adicionales (Recomendado)

### Conversión 2: "Video View"
1. En Google Ads → Conversiones → Nueva conversión
2. Nombre: "Video Demo Visto"
3. Categoría: Interacción
4. Valor: $2

### Conversión 3: "WhatsApp Lead"
1. En Google Ads → Conversiones → Nueva conversión
2. Nombre: "Interés WhatsApp"
3. Categoría: Contacto
4. Valor: $5

---

## 🔍 Paso 5: Verificar que todo funciona

### 5.1 Probar en tu navegador

1. Abre tu landing page
2. Presiona F12 para abrir DevTools
3. Ve a la pestaña "Console"
4. Haz clic en un botón de descarga
5. Deberías ver en consola: mensajes de gtag

### 5.2 Verificar en Google Analytics

1. Ve a Google Analytics
2. En el menú izquierdo: **Informes** → **Tiempo real**
3. Abre tu landing page en otra pestaña
4. Deberías ver tu visita en tiempo real

### 5.3 Verificar conversiones de Google Ads

1. Ve a Google Ads → Herramientas → Conversiones
2. Haz clic en tu conversión "Descarga App Store"
3. Verás el estado del seguimiento
4. Si está correcto dirá "Sin problemas detectados"

---

## 📊 Dashboard Recomendado en Google Analytics

Crea informes personalizados para:

1. **Fuente de tráfico** → ¿De dónde vienen tus visitas?
2. **Conversiones por fuente** → ¿Qué canal convierte mejor?
3. **Comportamiento de usuario** → ¿Dónde abandonan la página?
4. **Eventos más frecuentes** → ¿Qué acciones realizan?

---

## 🎯 Audiencias para Remarketing

Una vez que tengas datos, crea estas audiencias:

### Audiencia 1: "Visitó pero no descargó"
- Visitantes de la landing page
- QUE NO hicieron clic en descargar
- Duración: 30 días

### Audiencia 2: "Vio el video"
- Usuarios que hicieron clic en "Ver Demo"
- Duración: 15 días

### Audiencia 3: "Alto interés"
- Usuarios que:
  - Vieron el video
  - Hicieron scroll >75%
  - Pasaron >60 segundos
- Duración: 60 días

---

## 🚀 Optimización de Campañas

Con estos datos podrás:

1. **Identificar keywords ganadoras** → Aumentar presupuesto
2. **Pausar keywords que no convierten** → Ahorrar dinero
3. **Crear remarketing efectivo** → Recuperar usuarios
4. **A/B testing de anuncios** → Mejorar CTR
5. **Ajustar ofertas por dispositivo** → Más ROI

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa la consola del navegador (F12)
2. Verifica que los IDs estén correctos
3. Espera 24-48 horas para ver datos en GA4
4. Las conversiones de Google Ads pueden tardar hasta 3 horas

---

## ✅ Checklist Final

Antes de lanzar tu campaña:

- [ ] Google Analytics 4 configurado (ID reemplazado)
- [ ] Google Ads Conversion Tracking configurado (IDs reemplazados)
- [ ] Google Tag Manager configurado (opcional)
- [ ] Probado en navegador (clicks funcionan)
- [ ] Verificado en GA4 tiempo real
- [ ] Conversiones creadas en Google Ads
- [ ] Audiencias de remarketing creadas
- [ ] Landing page deployada en Netlify

---

## 🎉 ¡Listo para lanzar!

Una vez completados todos los pasos, tu landing page estará completamente preparada para:

- Rastrear todas las conversiones
- Optimizar campañas de Google Ads
- Crear audiencias de remarketing
- Medir ROI de forma precisa

**Presupuesto recomendado inicial:** $15-20 USD/día
**Objetivo:** 50-100 clicks/día
**CPA esperado:** $5-15 por descarga

