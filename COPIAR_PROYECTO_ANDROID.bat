@echo off
chcp 65001 > nul
echo ========================================
echo   COPIANDO PROYECTO PARA ANDROID
echo ========================================
echo.

REM Ruta del proyecto actual
set SOURCE=%~dp0
set DEST=%~dp0..\gestor-de-creditos-android

echo 📁 Origen: %SOURCE%
echo 📁 Destino: %DEST%
echo.

REM Verificar si ya existe el destino
if exist "%DEST%" (
    echo ⚠️  La carpeta destino ya existe.
    echo ⚠️  Se eliminará y creará de nuevo.
    pause
    rmdir /S /Q "%DEST%"
)

echo 📦 Creando carpeta destino...
mkdir "%DEST%"

echo.
echo 🔄 Copiando archivos (esto puede tomar unos minutos)...
echo.

REM Copiar archivos y carpetas EXCLUYENDO los que no necesitamos
xcopy "%SOURCE%*" "%DEST%\" /E /I /H /Y /EXCLUDE:%SOURCE%COPIAR_PROYECTO_ANDROID_EXCLUDE.txt

echo.
echo ✅ Copia completada!
echo.
echo 📋 Próximos pasos:
echo    1. Revisar el nuevo proyecto en: %DEST%
echo    2. Abrir la carpeta en VS Code / Cursor
echo    3. Ejecutar: npm install
echo    4. Seguir la LISTA DE TAREAS
echo.
pause

