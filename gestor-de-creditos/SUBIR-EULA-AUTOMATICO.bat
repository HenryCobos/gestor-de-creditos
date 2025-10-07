@echo off
echo ================================================
echo   SUBIENDO EULA A NETLIFY - AUTOMATICO
echo ================================================
echo.

cd ..

echo [1/4] Copiando archivos...
copy "gestor-de-creditos\eula.html" "gestor-creditos-website\" >nul
copy "gestor-de-creditos\support.html" "gestor-creditos-website\" >nul
copy "gestor-de-creditos\POLITICA_PRIVACIDAD.md" "gestor-creditos-website\" >nul
copy "gestor-de-creditos\TERMINOS_SERVICIO.md" "gestor-creditos-website\" >nul
copy "gestor-de-creditos\EULA.md" "gestor-creditos-website\" >nul

echo.
echo [2/4] Entrando al repositorio correcto...
cd gestor-creditos-website

echo.
echo [3/4] Agregando archivos a Git...
git add eula.html support.html POLITICA_PRIVACIDAD.md TERMINOS_SERVICIO.md EULA.md

echo.
echo [4/4] Haciendo commit y push...
git commit -m "Agregar EULA para Apple App Review"
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo Intentando con rama master...
    git push origin master
)

echo.
echo ================================================
echo   LISTO! Netlify desplegara en 1-2 minutos
echo ================================================
echo.
echo Verifica en:
echo https://gestordecreditos.netlify.app/eula.html
echo.

pause
