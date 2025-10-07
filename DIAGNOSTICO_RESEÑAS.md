# 🔍 Diagnóstico: Sistema de Reseñas en TestFlight

## Pregunta Urgente
**¿Qué build number estás probando en TestFlight?**
- Ve a Configuración en la app → Al final debería decir el número de build
- O en TestFlight → Información de la build

## Si es Build < 143 (Antes del Sistema de Reseñas)
❌ El sistema de reseñas NO existe en ese build
✅ Necesitas esperar al Build 143 que se está creando ahora

## Si es Build 143 o Mayor (Con Sistema de Reseñas)

### Checklist de Condiciones para Trigger de Reportes:

Para que aparezca el prompt cuando exportas reportes, deben cumplirse TODAS estas condiciones:

1. ✅ **Reportes exportados**: 3 o más
2. ✅ **Aperturas de app**: 5 o más
3. ✅ **No haber solicitado reseña antes** en los últimos 30 días
4. ✅ **No haber alcanzado el máximo** de 3 solicitudes totales
5. ✅ **Usuario no marcado como que ya dio reseña**
6. ✅ **Usuario no marcado como que rechazó dar reseña**

### Cómo Verificar en TestFlight:

#### Paso 1: Verifica la Build
En la app, ve a **Configuración** y busca al final el número de build.

#### Paso 2: Verifica las Estadísticas (Solo si es Build 143+)
En **Configuración**, deberías ver una sección de debug con estadísticas.

#### Paso 3: Revisa los Logs
Si tienes acceso a los logs de la app:
```
Busca logs que empiecen con:
📊 Reportes exportados: X
⭐ Solicitando reseña...
```

### Posibles Razones por las que No Aparece:

1. **iOS ya alcanzó su límite**
   - iOS limita a 3 veces por año POR DISPOSITIVO
   - Si ya probaste otras apps con reseñas, iOS puede bloquear

2. **Condiciones no cumplidas**
   - Menos de 5 aperturas de app
   - Ya se solicitó en los últimos 30 días
   - Ya se alcanzó el máximo de 3 solicitudes

3. **Instalación nueva desde TestFlight**
   - Si acabas de instalar la app, puede que falten aperturas
   - Necesitas abrir la app al menos 5 veces

4. **Build antiguo**
   - El build que estás probando no tiene el sistema de reseñas

## Solución Inmediata: Forzar el Trigger

Si estás en Build 143+, sigue estos pasos:

1. **Abre la app desde TestFlight**
2. **Ve a Configuración** → Scroll al final
3. **Presiona "Resetear Sistema de Reseñas"** (esto limpia todo)
4. **Cierra y abre la app 5 veces** (para cumplir el requisito de aperturas)
5. **Ve a Reportes y exporta 3 reportes**
6. **Al exportar el 3er reporte** → Deberías ver el prompt

## Diagnóstico Rápido

### ¿Qué build estás probando?
- [ ] Build 142 o anterior (NO tiene sistema de reseñas)
- [ ] Build 143 (SÍ tiene sistema de reseñas)

### ¿Ves la sección de Debug en Configuración?
- [ ] Sí → Estás en Build 143+
- [ ] No → Estás en build anterior

### ¿Cuántas veces has abierto la app?
- [ ] Menos de 5 veces → Necesitas abrir más
- [ ] 5 o más → Condición cumplida ✅

### ¿Has exportado reportes antes en TestFlight?
- [ ] Primera vez → Debería funcionar
- [ ] Ya exporté antes → Puede haber alcanzado límites

---

**NOTA IMPORTANTE**: El Build 143 que acabamos de crear aún se está compilando. Tardará ~30-40 minutos en estar disponible en TestFlight. Si estás probando en un build anterior, el sistema de reseñas simplemente no existe en ese build.

