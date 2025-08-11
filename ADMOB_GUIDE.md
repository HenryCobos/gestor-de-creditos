# 🚀 Guía Completa de AdMob - Gestor de Créditos

## ✅ **¿Qué ya está configurado?**

Tu aplicación ya tiene **AdMob completamente integrado** con:

- ✅ **Banners** - Anuncios horizontales en pantallas
- ✅ **Intersticiales** - Anuncios de pantalla completa inteligentes  
- ✅ **Sistema de frecuencia** - Respeta políticas de Google automáticamente
- ✅ **IDs de prueba** - Listos para desarrollo y testing
- ✅ **Cumplimiento GDPR/CCPA** - Configurado para regulaciones

---

## 🏗️ **Arquitectura Implementada**

### Servicios
- `src/services/admobService.ts` - Core de AdMob
- `src/hooks/useInterstitialAds.ts` - Hook inteligente para intersticiales

### Componentes
- `src/components/ads/BannerAd.tsx` - Banners reutilizables
- `TopBannerAd` - Banner superior
- `BottomBannerAd` - Banner inferior (ya implementado en Home)

### Políticas Automáticas
- ⏰ **30 segundos mínimo** entre intersticiales
- 📊 **20 intersticiales máximo** por día por usuario
- 🚫 **Sin anuncios** en pantallas sensibles

---

## 🔧 **CONFIGURACIÓN PARA PRODUCCIÓN**

### 1. Crear Cuenta AdMob
1. Ve a [https://admob.google.com](https://admob.google.com)
2. Crea una cuenta con tu Google Account
3. Acepta términos y condiciones
4. Configura métodos de pago

### 2. Crear App en AdMob
1. En la consola AdMob, clic "Agregar app"
2. Selecciona "Android" / "iOS"
3. Ingresa nombre: "Gestor de Créditos"
4. **Copia el App ID generado** (formato: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)

### 3. Crear Unidades de Anuncio

#### Para Android:
- **Banner**: Crear "Banner" → Copiar ID
- **Intersticial**: Crear "Intersticial" → Copiar ID

#### Para iOS:  
- **Banner**: Crear "Banner" → Copiar ID
- **Intersticial**: Crear "Intersticial" → Copiar ID

### 4. Actualizar Configuración

#### 📱 **app.json**
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMobileAdsAppId": "TU_APP_ID_IOS_AQUI"
      }
    },
    "android": {
      "config": {
        "googleMobileAdsAppId": "TU_APP_ID_ANDROID_AQUI"
      }
    },
    "plugins": [
      [
        "expo-ads-admob",
        {
          "androidAppId": "TU_APP_ID_ANDROID_AQUI",
          "iosAppId": "TU_APP_ID_IOS_AQUI"
        }
      ]
    ]
  }
}
```

#### 🔧 **src/services/admobService.ts**
```typescript
const AD_UNIT_IDS = {
  // REEMPLAZA CON TUS IDs REALES
  BANNER_ANDROID: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  BANNER_IOS: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  
  INTERSTITIAL_ANDROID: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  INTERSTITIAL_IOS: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};
```

---

## 📱 **CÓMO USAR EN TUS PANTALLAS**

### Agregar Banner
```typescript
import { BottomBannerAd } from '../components/ads';

// En tu JSX
<BottomBannerAd 
  onReceiveAd={() => console.log('Banner cargado')}
  onError={(error) => console.warn('Error:', error)}
/>
```

### Agregar Intersticiales
```typescript
import { useInterstitialAds } from '../hooks/useInterstitialAds';

function MiPantalla() {
  const { showOnNavigation, isReady } = useInterstitialAds();
  
  const navegarConAnuncio = async () => {
    await showOnNavigation(); // Muestra intersticial si es apropiado
    navigation.navigate('OtraPantalla');
  };
  
  return (
    <Button onPress={navegarConAnuncio} title="Navegar" />
  );
}
```

---

## 💰 **MEJORES PRÁCTICAS PARA MONETIZACIÓN**

### ✅ Dónde Poner Banners
- ✅ Pantalla principal (ya implementado)
- ✅ Listas largas (entre elementos)
- ✅ Pantallas de estadísticas
- ✅ Al final de formularios completados

### ✅ Cuándo Mostrar Intersticiales
- ✅ Entre navegaciones importantes
- ✅ Después de completar acciones
- ✅ Al salir de pantallas complejas
- ✅ Al abrir reportes

### ❌ Dónde NO Poner Anuncios
- ❌ Durante entrada de datos sensibles
- ❌ En pantallas de error
- ❌ Durante procesos de pago
- ❌ En modales críticos

---

## 🔒 **CUMPLIMIENTO DE POLÍTICAS**

### Políticas Automáticas Incluidas
- 📝 **Consentimiento de seguimiento** (iOS 14.5+)
- ⏰ **Frecuencia controlada** (30s entre intersticiales)
- 📊 **Límites diarios** (20 intersticiales máximo)
- 🎯 **Anuncios personalizados** habilitados

### Política de Privacidad Requerida
Debes agregar a tu política de privacidad:

```
Esta aplicación utiliza Google AdMob para mostrar anuncios personalizados. 
AdMob puede recopilar y utilizar datos para personalizar los anuncios mostrados.
Para más información: https://policies.google.com/privacy
```

---

## 🧪 **TESTING Y DEBUGGING**

### Ver Logs de Anuncios
Los anuncios registran automáticamente:
```
✅ AdMob inicializado
🎯 Intersticial cargado  
📺 Banner cargado en Home
⚠️ Intersticial no disponible, intentando cargar...
⏰ Intersticial disponible en 25 segundos
```

### Testing con IDs de Prueba
Los IDs de prueba están configurados por defecto:
- Siempre muestran anuncios de prueba
- No generan ingresos reales
- Seguros para desarrollo

### Verificar Estado de Intersticiales
```typescript
const { getAvailabilityInfo } = useInterstitialAds();
const info = getAvailabilityInfo();
console.log('Estado:', info);
```

---

## 🚀 **PUBLICACIÓN**

### Antes de Publicar
1. ✅ Reemplazar IDs de prueba con IDs reales
2. ✅ Probar en dispositivos físicos
3. ✅ Verificar política de privacidad
4. ✅ Compilar con `expo build`

### Después de Publicar
1. 📊 Monitorear métricas en AdMob Console
2. 🔧 Ajustar frecuencia si es necesario
3. 📈 Optimizar ubicación de anuncios
4. 💰 Configurar pagos en AdMob

---

## 📞 **SOPORTE**

### Si tienes problemas:
1. Revisa logs en consola
2. Verifica IDs en AdMob Console  
3. Asegúrate que la app esté aprobada en AdMob
4. Contacta: soporte.admob@google.com

### Recursos Útiles
- [AdMob Help Center](https://support.google.com/admob)
- [Expo AdMob Docs](https://docs.expo.dev/versions/latest/sdk/admob/)
- [AdMob Policy Center](https://support.google.com/admob/answer/6128543)

---

## 🎉 **¡Ya estás listo para monetizar!**

Tu app tiene todo configurado. Solo necesitas:
1. Crear cuenta AdMob
2. Reemplazar IDs de prueba
3. ¡Publicar y empezar a ganar! 💰 