@echo off
echo 🚀 Copiando archivos para el sitio web...

REM Crear directorio temporal si no existe
if not exist "..\gestor-creditos-website" mkdir "..\gestor-creditos-website"

REM Copiar archivos principales
copy "app-ads.txt" "..\gestor-creditos-website\"
copy "index.html" "..\gestor-creditos-website\"
copy "support.html" "..\gestor-creditos-website\"
copy "netlify.toml" "..\gestor-creditos-website\"
copy "_redirects" "..\gestor-creditos-website\"
copy "POLITICA_PRIVACIDAD.md" "..\gestor-creditos-website\"
copy "TERMINOS_SERVICIO.md" "..\gestor-creditos-website\"
copy "verificar-sitio.html" "..\gestor-creditos-website\"

echo ✅ Archivos copiados a ..\gestor-creditos-website\
echo.
echo 📋 Archivos copiados:
echo - app-ads.txt (CRÍTICO para AdMob)
echo - index.html (Página principal)
echo - support.html (Soporte)
echo - netlify.toml (Configuración)
echo - _redirects (Redirecciones)
echo - POLITICA_PRIVACIDAD.md
echo - TERMINOS_SERVICIO.md
echo - verificar-sitio.html
echo.
echo 🎯 Siguiente paso: 
echo 1. Ve a la carpeta ..\gestor-creditos-website\
echo 2. Inicializa git con: git init
echo 3. Conecta con tu repositorio de GitHub
echo.
pause
