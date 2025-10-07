@echo off
echo ========================================
echo   Subiendo EULA via Git
echo ========================================
echo.

REM Agregar solo el archivo EULA
echo 📁 Agregando eula.html al staging...
git add eula.html
git add support.html
git add app.json

echo.
echo 💾 Creando commit...
git commit -m "Agregar EULA en HTML para cumplir requisitos de Apple App Review"

echo.
echo 🚀 Subiendo a GitHub...
git push origin master

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✅ Archivos subidos con éxito!
    echo ========================================
    echo.
    echo ⏳ Netlify desplegará automáticamente en 1-2 minutos
    echo.
    echo 🌐 Después verifica:
    echo    https://gestordecreditos.netlify.app/eula.html
    echo.
) else (
    echo.
    echo ❌ Error al subir a GitHub
    echo.
    echo Verifica:
    echo 1. Que tengas una rama 'master' (o usa 'main')
    echo 2. Que estés autenticado en Git
    echo 3. Que tengas conexión a internet
)

echo.
pause
