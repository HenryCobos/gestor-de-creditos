# 🚀 Guía de Distribución APK - Gestor de Créditos

## ✅ Configuración Completada

### 🔧 Configuraciones de Build
- **EAS Build**: Configurado para generar APK de producción
- **Keystore**: Creado y configurado para firmar APK
- **ProGuard**: Optimizado para reducir tamaño y proteger código
- **Versión**: 1.3.1 (actualizada)

### 🔑 Credenciales PayPal
- **Entorno**: Producción (Live)
- **Client ID**: Configurado correctamente
- **Secret Key**: Configurado correctamente
- **URLs**: Apuntando a API de producción

### 📱 Configuración Android
- **Package Name**: `com.gestordecreditos`
- **Target SDK**: 34
- **Min SDK**: Configurado según Expo
- **Permisos**: Internet, notificaciones, almacenamiento

## 🛠️ Comandos para Generar APK

### Opción 1: Build de Producción (Recomendado)
```bash
npm run build:apk-production
```

### Opción 2: Build con EAS
```bash
eas build --platform android --profile production
```

### Opción 3: Build Local (si tienes Android Studio)
```bash
cd android
./gradlew assembleRelease
```

## 📋 Checklist Pre-Distribución

### ✅ Configuraciones Verificadas
- [x] PayPal en modo producción
- [x] Keystore de producción creado
- [x] ProGuard optimizado
- [x] Permisos de Android configurados
- [x] Notificaciones funcionando
- [x] Versión actualizada (1.3.1)

### 🔍 Pruebas Recomendadas
- [ ] Probar compras con PayPal (montos pequeños)
- [ ] Verificar notificaciones
- [ ] Probar exportación de reportes
- [ ] Verificar funcionalidad offline
- [ ] Probar en diferentes dispositivos Android

## 📦 Archivos de Distribución

### Ubicación del APK
El APK se generará en:
- **EAS Build**: Descargar desde el dashboard de EAS
- **Build Local**: `android/app/build/outputs/apk/release/app-release.apk`

### Información del APK
- **Nombre**: `app-release.apk`
- **Tamaño**: Aproximadamente 25-35 MB
- **Firmado**: Sí (con keystore de producción)
- **Optimizado**: Sí (ProGuard habilitado)

## 🚨 Consideraciones Importantes

### Seguridad
- **Keystore**: Guarda el archivo `gestor-creditos-release.keystore` en lugar seguro
- **Contraseñas**: Anota las contraseñas del keystore
- **Backup**: Haz backup del keystore antes de distribuir

### Distribución
- **Google Play**: No aplica (distribución directa)
- **Sideloading**: Los usuarios necesitarán habilitar "Fuentes desconocidas"
- **Actualizaciones**: Deberás distribuir manualmente las actualizaciones

### PayPal
- **Webhooks**: Configura webhooks en PayPal para notificaciones
- **Monitoreo**: Revisa regularmente los logs de PayPal
- **Testing**: Prueba con montos pequeños antes del lanzamiento

## 📞 Soporte

### Enlaces Importantes
- **EULA**: https://gestordecreditos.netlify.app/eula.html
- **Política de Privacidad**: https://gestordecreditos.netlify.app/POLITICA_PRIVACIDAD.md
- **Términos de Servicio**: https://gestordecreditos.netlify.app/TERMINOS_SERVICIO.md

### Contacto
- **Email**: [Tu email de soporte]
- **Sitio Web**: https://gestordecreditos.netlify.app

## 🎯 Próximos Pasos

1. **Generar APK** usando uno de los comandos arriba
2. **Probar APK** en dispositivos reales
3. **Configurar webhooks** de PayPal
4. **Preparar documentación** para usuarios
5. **Distribuir APK** a usuarios finales

---

**¡Tu app está lista para distribución! 🎉**
