# 🚀 Guía Completa: Deployment en Netlify para AdMob

## 📋 Paso a Paso para Subir tu Sitio Web

### 🎯 Paso 1: Preparar los Archivos (✅ COMPLETADO)

Los siguientes archivos ya están listos en tu proyecto:
- ✅ `app-ads.txt` - Archivo principal para AdMob
- ✅ `index.html` - Página principal del sitio
- ✅ `support.html` - Página de soporte
- ✅ `netlify.toml` - Configuración de Netlify
- ✅ `_redirects` - Configuración de redirecciones
- ✅ Documentos legales (POLITICA_PRIVACIDAD.md, TERMINOS_SERVICIO.md)

### 🌐 Paso 2: Crear Cuenta en Netlify

1. **Ve a Netlify**:
   - Abre tu navegador y ve a: https://netlify.com
   - Haz clic en "Sign up" (Registrarse)

2. **Crear cuenta**:
   - Puedes usar tu email o conectar con GitHub/Google
   - **Recomendación**: Usa GitHub para facilitar futuras actualizaciones

3. **Verificar email** (si usas email directo):
   - Revisa tu bandeja de entrada
   - Haz clic en el enlace de verificación

### 📁 Paso 3: Subir los Archivos

#### Opción A: Arrastrar y Soltar (MÁS FÁCIL)

1. **Preparar archivos**:
   - Crea una carpeta en tu escritorio llamada "gestor-creditos-web"
   - Copia estos archivos a esa carpeta:
     ```
     📁 gestor-creditos-web/
     ├── app-ads.txt
     ├── index.html
     ├── support.html
     ├── netlify.toml
     ├── _redirects
     ├── POLITICA_PRIVACIDAD.md
     └── TERMINOS_SERVICIO.md
     ```

2. **Subir a Netlify**:
   - En el dashboard de Netlify, busca la sección "Deploy"
   - Arrastra la carpeta "gestor-creditos-web" a la zona de "drag and drop"
   - Netlify automáticamente subirá todos los archivos

#### Opción B: Conectar con GitHub (RECOMENDADO)

1. **Crear repositorio en GitHub**:
   - Ve a github.com y crea un nuevo repositorio público
   - Nombre sugerido: "gestor-creditos-website"

2. **Subir archivos al repositorio**:
   ```bash
   git add app-ads.txt index.html support.html netlify.toml _redirects POLITICA_PRIVACIDAD.md TERMINOS_SERVICIO.md
   git commit -m "Add website files for AdMob verification"
   git push origin main
   ```

3. **Conectar en Netlify**:
   - En Netlify, haz clic en "New site from Git"
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio "gestor-creditos-website"
   - Haz clic en "Deploy site"

### 🔗 Paso 4: Configurar Dominio

1. **Obtener URL**:
   - Netlify te asignará una URL como: `https://amazing-name-123456.netlify.app`
   - **IMPORTANTE**: Anota esta URL completa

2. **Personalizar dominio (OPCIONAL)**:
   - En el dashboard de Netlify, ve a "Domain settings"
   - Haz clic en "Change site name"
   - Cambia a algo como: `gestordecreditos` 
   - Tu nueva URL será: `https://gestordecreditos.netlify.app`

### ✅ Paso 5: Verificar que Todo Funciona

1. **Verificar página principal**:
   - Ve a: `https://tu-sitio.netlify.app`
   - Debe mostrar la página principal con "Gestor de Créditos"

2. **Verificar app-ads.txt** (MUY IMPORTANTE):
   - Ve a: `https://tu-sitio.netlify.app/app-ads.txt`
   - Debe mostrar exactamente:
     ```
     google.com, pub-4349408589058649, DIRECT, f08c47fec0942fa0
     # iOS App Bundle ID: com.gestordecreditos.app
     # AdMob App ID: ca-app-pub-4349408589058649~7588427896
     ```

3. **Verificar otras páginas**:
   - Support: `https://tu-sitio.netlify.app/support.html`
   - Privacidad: `https://tu-sitio.netlify.app/POLITICA_PRIVACIDAD.md`

### 🎯 Ejemplo Completo de URLs

Si tu sitio se llama "gestordecreditos", las URLs serán:
- **Sitio principal**: https://gestordecreditos.netlify.app
- **app-ads.txt**: https://gestordecreditos.netlify.app/app-ads.txt
- **Soporte**: https://gestordecreditos.netlify.app/support.html

### 🔍 Verificación Final

Después de que el sitio esté en línea:

1. **Prueba en el navegador**:
   ```
   https://tu-sitio.netlify.app/app-ads.txt
   ```
   
2. **Verifica el contenido**:
   - Debe mostrar el contenido del archivo sin errores 404
   - No debe haber redirecciones
   - El tipo de contenido debe ser "text/plain"

### ⚠️ Problemas Comunes y Soluciones

1. **Error 404 en app-ads.txt**:
   - Verifica que el archivo esté en la raíz
   - Verifica que no haya espacios en el nombre

2. **Contenido incorrecto**:
   - Re-sube el archivo con el contenido exacto
   - Espera 5-10 minutos para que se actualice

3. **Sitio no se actualiza**:
   - Ve al dashboard de Netlify
   - Haz clic en "Trigger deploy"
   - Espera unos minutos

### ⏱️ Tiempos Esperados

- **Deployment**: 2-5 minutos
- **Propagación DNS**: 5-15 minutos  
- **Verificación AdMob**: 24-48 horas después

### 📞 Siguiente Paso

Una vez que el sitio esté funcionando correctamente, el siguiente paso será configurar este dominio en AdMob (te ayudaré con eso en el siguiente paso).

---

**¿Todo listo?** Cuando tengas tu sitio funcionando en Netlify, avísame y te ayudo con la configuración de AdMob. 🚀
