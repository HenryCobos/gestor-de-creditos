# 🚀 Cómo Subir el EULA a Netlify - 3 Métodos Simples

## ⚡ MÉTODO 1: Script Automático (MÁS FÁCIL)

### Opción A: Con Netlify CLI

1. Abre PowerShell en esta carpeta
2. Ejecuta:
   ```bash
   .\deploy-eula-netlify.bat
   ```

3. Si es la primera vez, te pedirá autenticarte:
   - Se abrirá tu navegador
   - Inicia sesión con tu cuenta de Netlify
   - Autoriza la aplicación
   - Vuelve a ejecutar el script

4. ¡Listo! El script subirá todo automáticamente

### Opción B: Con Git (si tienes GitHub conectado a Netlify)

1. Abre PowerShell en esta carpeta
2. Ejecuta:
   ```bash
   .\subir-eula-git.bat
   ```

3. El archivo se subirá a GitHub y Netlify lo desplegará automáticamente en 1-2 minutos

---

## 📁 MÉTODO 2: Drag & Drop en Netlify (SUPER SIMPLE)

1. Ve a: https://app.netlify.com/drop

2. Abre la carpeta del proyecto en Explorador de Archivos

3. **Arrastra ESTA CARPETA COMPLETA** a la página de Netlify:
   ```
   C:\Users\HENRY\creditos-app\gestor-de-creditos
   ```

4. Netlify subirá todo automáticamente (esto REEMPLAZARÁ tu sitio actual con todos los archivos)

5. Espera 30 segundos y verifica:
   ```
   https://gestordecreditos.netlify.app/eula.html
   ```

---

## 🖱️ MÉTODO 3: Desde el Panel de Netlify (MANUAL PERO SEGURO)

### Paso 1: Acceder a tu sitio
1. Ve a: https://app.netlify.com
2. Inicia sesión con tu cuenta
3. Haz clic en tu sitio "gestordecreditos"

### Paso 2: Subir el archivo

**Opción A: Deploy completo**
1. Ve a la pestaña **Deploys**
2. Arrastra la carpeta completa del proyecto al área que dice "Need to update your site?"
3. Espera a que termine el deploy (1-2 minutos)

**Opción B: File upload (si está disponible)**
1. Busca la opción de subir archivos individuales
2. Sube el archivo `eula.html` que está en la raíz del proyecto

---

## 🔍 MÉTODO 4: Solo si tienes Repositorio GitHub

Si tu sitio de Netlify está conectado a un repositorio de GitHub:

1. **Verifica la conexión:**
   - Ve a tu sitio en Netlify
   - Ve a **Site settings** > **Build & deploy**
   - Verifica si hay un repositorio conectado

2. **Si HAY repositorio conectado:**
   ```bash
   # Abre PowerShell y ejecuta:
   git status
   git add eula.html support.html app.json
   git commit -m "Agregar EULA HTML para Apple Review"
   git push
   ```

3. Netlify detectará el cambio y desplegará automáticamente

---

## ✅ Verificar que Funcionó

Después de subir, verifica estos enlaces:

1. **EULA (EL IMPORTANTE):**
   ```
   https://gestordecreditos.netlify.app/eula.html
   ```
   ✅ Debería mostrar una página HTML bonita con el EULA

2. **Support:**
   ```
   https://gestordecreditos.netlify.app/support.html
   ```
   ✅ Debería incluir el enlace al EULA

3. **Privacy Policy (verificar que siga funcionando):**
   ```
   https://gestordecreditos.netlify.app/POLITICA_PRIVACIDAD.md
   ```

---

## 🆘 Solución de Problemas

### Error: "Command not found: netlify"
**Solución:** Instala Netlify CLI:
```bash
npm install -g netlify-cli
```

### Error: "Not authorized"
**Solución:** Inicia sesión en Netlify CLI:
```bash
netlify login
```

### Error: "No git repository"
**Solución:** Usa el Método 2 (Drag & Drop)

### Error: "Permission denied"
**Solución:** Ejecuta PowerShell como Administrador

### Los scripts .bat no funcionan
**Solución:** Ejecuta los comandos manualmente:

```powershell
# Para método con Netlify CLI:
netlify login
netlify deploy --prod --dir .

# Para método con Git:
git add eula.html support.html app.json
git commit -m "Agregar EULA"
git push
```

---

## 📞 ¿Nada Funciona?

Si ningún método funciona, puedes:

1. **Crear un sitio nuevo en Netlify:**
   - Ve a https://app.netlify.com/drop
   - Arrastra esta carpeta completa
   - Copia la URL que te da
   - Actualiza los enlaces en `app.json` con la nueva URL

2. **Usar otro servicio:**
   - GitHub Pages
   - Vercel
   - Firebase Hosting

3. **Contactarme:**
   - Dame más detalles del error que te sale
   - Capturas de pantalla si es posible

---

## 🎯 Después de Subir

1. ✅ Verifica que `https://gestordecreditos.netlify.app/eula.html` funcione
2. ✅ Ve a App Store Connect
3. ✅ Verifica que la descripción incluya el enlace al EULA
4. ✅ Responde al rechazo de Apple
5. ✅ Espera la aprobación (24-48 horas)

---

**Última actualización:** 5 de octubre de 2025  
**Dificultad:** ⭐ Muy fácil con los scripts  
**Tiempo estimado:** 2-5 minutos
