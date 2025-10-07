@echo off
echo ========================================
echo   Subiendo EULA a Netlify
echo ========================================
echo.

REM Verificar si Netlify CLI está instalado
where netlify >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Netlify CLI no está instalado
    echo.
    echo Instalando Netlify CLI...
    npm install -g netlify-cli
    if %errorlevel% neq 0 (
        echo ❌ Error al instalar Netlify CLI
        echo Por favor, ejecuta manualmente: npm install -g netlify-cli
        pause
        exit /b 1
    )
)

echo ✅ Netlify CLI encontrado
echo.
echo 📁 Preparando archivos para deploy...

REM Crear carpeta temporal para deploy
if exist ".netlify-deploy" rmdir /s /q ".netlify-deploy"
mkdir ".netlify-deploy"

REM Copiar archivos necesarios
echo Copiando archivos...
copy "eula.html" ".netlify-deploy\" >nul
copy "support.html" ".netlify-deploy\" >nul
copy "POLITICA_PRIVACIDAD.md" ".netlify-deploy\" >nul
copy "TERMINOS_SERVICIO.md" ".netlify-deploy\" >nul
copy "index.html" ".netlify-deploy\" >nul
copy "verificar-sitio.html" ".netlify-deploy\" >nul
copy "_redirects" ".netlify-deploy\" >nul
copy "netlify.toml" ".netlify-deploy\" >nul

echo.
echo 🚀 Desplegando a Netlify...
echo.

cd ".netlify-deploy"
netlify deploy --prod --dir .

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✅ Deploy completado con éxito!
    echo ========================================
    echo.
    echo 🌐 Verifica tu sitio:
    echo    https://gestordecreditos.netlify.app/eula.html
    echo.
) else (
    echo.
    echo ❌ Error en el deploy
    echo.
    echo Si dice que no estás autenticado, ejecuta:
    echo    netlify login
    echo.
    echo Luego vuelve a ejecutar este script.
)

cd ..

echo.
echo Limpiando archivos temporales...
rmdir /s /q ".netlify-deploy"

echo.
pause
