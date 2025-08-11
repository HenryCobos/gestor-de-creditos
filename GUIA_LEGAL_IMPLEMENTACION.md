# 📋 Guía de Implementación Legal - Gestor de Créditos

## 🎯 **OBJETIVO**
Implementar los documentos legales en la aplicación y prepararlos para las tiendas de aplicaciones.

## 📄 **DOCUMENTOS CREADOS**

### ✅ **1. Política de Privacidad** (`POLITICA_PRIVACIDAD.md`)
- Cumple con GDPR, CCPA, COPPA
- Cubre AdMob y monetización
- Explica manejo de datos locales
- Derechos del usuario claramente definidos

### ✅ **2. Términos de Servicio** (`TERMINOS_SERVICIO.md`)
- Uso aceptable y prohibido
- Propiedad intelectual
- Limitación de responsabilidad
- Indemnización y terminación

## 🚀 **PASOS PARA IMPLEMENTAR**

### **PASO 1: Personalizar Documentos**

#### 1.1 Información de Contacto (YA PERSONALIZADA)
✅ **Email**: Apper2025@icloud.com
✅ **País**: Perú
✅ **Sin sitio web por el momento**

#### 1.2 Jurisdicción Legal (YA PERSONALIZADA)
✅ **País**: Perú
✅ **Jurisdicción**: Perú

### **PASO 2: Hospedar Documentos**

#### 2.1 Opciones de Hospedaje
**Opción A: GitHub Pages (Gratis)**
```bash
# Crear repositorio público
# Subir documentos como .md o .html
# URL será: https://tu-usuario.github.io/repo-nombre/
```

**Opción B: Sitio Web Propio**
- Subir a tu dominio
- URLs: `https://tu-dominio.com/privacy` y `https://tu-dominio.com/terms`

**Opción C: Google Sites (Gratis)**
- Crear sitio con Google Sites
- Subir documentos como páginas
- URL: `https://sites.google.com/view/tu-sitio`

#### 2.2 Formato Recomendado
- **HTML**: Mejor para sitios web
- **PDF**: Mejor para descargas
- **Markdown**: Mejor para GitHub

### **PASO 3: Integrar en la App**

#### 3.1 Crear Pantalla de Términos
```typescript
// src/screens/legal/TerminosScreen.tsx
export function TerminosScreen() {
  return (
    <ScrollView>
      <Text style={styles.title}>Términos de Servicio</Text>
      <Text style={styles.content}>
        {/* Contenido de términos */}
      </Text>
      <TouchableOpacity onPress={() => Linking.openURL('https://tu-url.com/terms')}>
        <Text>Ver términos completos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

#### 3.2 Crear Pantalla de Privacidad
```typescript
// src/screens/legal/PrivacidadScreen.tsx
export function PrivacidadScreen() {
  return (
    <ScrollView>
      <Text style={styles.title}>Política de Privacidad</Text>
      <Text style={styles.content}>
        {/* Contenido de privacidad */}
      </Text>
      <TouchableOpacity onPress={() => Linking.openURL('https://tu-url.com/privacy')}>
        <Text>Ver política completa</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

#### 3.3 Agregar a Navegación
```typescript
// En AppNavigator.tsx
<Stack.Screen name="Terminos" component={TerminosScreen} />
<Stack.Screen name="Privacidad" component={PrivacidadScreen} />
```

#### 3.4 Agregar Enlaces en Configuración
```typescript
// En ConfiguracionScreen.tsx
<TouchableOpacity onPress={() => navigation.navigate('Terminos')}>
  <Text>Términos de Servicio</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => navigation.navigate('Privacidad')}>
  <Text>Política de Privacidad</Text>
</TouchableOpacity>
```

### **PASO 4: Configurar para Tiendas**

#### 4.1 Google Play Store
En Google Play Console:
1. **Store Listing** → **App content**
2. **Privacy Policy**: URL de tu política de privacidad
3. **Terms of Service**: URL de tus términos de servicio

#### 4.2 App Store
En App Store Connect:
1. **App Information** → **App Privacy**
2. **Privacy Policy URL**: URL de tu política de privacidad
3. **Terms of Service URL**: URL de tus términos de servicio

### **PASO 5: Actualizar app.json**

#### 5.1 Agregar URLs de Documentos
```json
{
  "expo": {
    "privacy": "https://tu-dominio.com/privacy",
    "ios": {
      "infoPlist": {
        "NSUserTrackingUsageDescription": "Esta aplicación utiliza identificadores de dispositivo para ofrecerte anuncios personalizados relevantes."
      }
    }
  }
}
```

## 📱 **IMPLEMENTACIÓN EN LA APP**

### **Crear Componente Legal**
```typescript
// src/components/LegalLinks.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Linking } from 'react-native';

export function LegalLinks() {
  const openPrivacy = () => {
    Linking.openURL('https://tu-dominio.com/privacy');
  };

  const openTerms = () => {
    Linking.openURL('https://tu-dominio.com/terms');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openPrivacy} style={styles.link}>
        <Text style={styles.linkText}>Política de Privacidad</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={openTerms} style={styles.link}>
        <Text style={styles.linkText}>Términos de Servicio</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### **Agregar a Configuración**
```typescript
// En ConfiguracionScreen.tsx
import { LegalLinks } from '../components/LegalLinks';

// En el JSX
<Card style={styles.card}>
  <Text style={styles.sectionTitle}>Información Legal</Text>
  <LegalLinks />
</Card>
```

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Documentos**
- [x] Personalizar información de contacto
- [x] Personalizar jurisdicción legal
- [ ] Hospedar documentos en línea
- [ ] Verificar URLs funcionan

### **Aplicación**
- [ ] Crear pantallas de términos y privacidad
- [ ] Agregar a navegación
- [ ] Agregar enlaces en configuración
- [ ] Probar enlaces funcionan

### **Tiendas**
- [ ] Configurar URLs en Google Play Console
- [ ] Configurar URLs en App Store Connect
- [ ] Verificar documentos aprobados

## 🎯 **PRÓXIMOS PASOS**

1. **Personalizar documentos** con tu información real
2. **Hospedar documentos** en GitHub Pages o tu sitio web
3. **Implementar en la app** las pantallas legales
4. **Configurar en las tiendas** las URLs de documentos
5. **Probar todo** antes de publicar

## 📞 **SOPORTE**

Si necesitas ayuda con:
- Personalización de documentos
- Implementación en la app
- Configuración en las tiendas

**¡Los documentos están listos para usar! Solo necesitas personalizar la información de contacto y hospedarlos en línea.** 