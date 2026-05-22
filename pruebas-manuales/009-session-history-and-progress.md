# Pruebas Manuales - Issue 009: Session History & Progress

## Resumen
Vista de historial de sesiones completadas con detalle por serie y tracking de progreso por ejercicio (evolución de pesos/reps a lo largo del tiempo).

## Pruebas automáticas existentes
Tests validan: lista de sesiones ordenada por fecha, detalle de sesión con todos los datos por serie, progreso de ejercicio con datos históricos correctos.

```bash
cd frontend && npm run test -- --testPathPattern=history|progress|session
```

---

## Pruebas manuales (UI)

### Requisitos previos
1. Usuario autenticado con al menos 2-3 sesiones completadas
2. `npm run dev`

### 1. Ver lista de sesiones
1. Navegar al tab "Historial"
2. Verificar que se muestra una lista de sesiones completadas
3. Cada sesión debe mostrar:
   - Fecha de completado
   - Nombre del bloque entrenado
   - Cantidad de ejercicios completados
4. Las sesiones deben estar ordenadas por fecha (más reciente primero)
5. Si no hay sesiones, debe mostrar un mensaje tipo "Aún no has completado ninguna sesión"

### 2. Ver detalle de sesión
1. Hacer clic en una sesión de la lista
2. Debe abrirse una vista de detalle con:
   - Tabla con cada ejercicio realizado
   - Para cada ejercicio: series ejecutadas con peso, reps reales, RPE real
   - Columnas: Serie #, Peso (kg), Reps, RPE
3. Verificar que los datos coinciden con lo registrado durante el entrenamiento
4. Comparar reps/RPE objetivo vs real:
   - Si real >= objetivo: indicador verde
   - Si real < objetivo: indicador gris/rojo

### 3. Navegar entre sesiones
1. Desde el detalle de sesión, volver a la lista
2. Seleccionar otra sesión (más antigua)
3. Verificar que muestra datos correctos de esa sesión (no se mezclan)

### 4. Tracking de progreso por ejercicio
1. Buscar la sección de "Progreso por ejercicio" o "Tracking"
2. Seleccionar un ejercicio del catálogo (buscador/filtro)
   - Ej. buscar "Press Banca"
3. Debe mostrar una gráfica o tabla con:
   - Eje X = fechas de sesiones donde se ejecutó Press Banca
   - Eje Y = peso máximo levantado por sesión
4. Cambiar vista a "Volumen total" (peso x reps)
5. Verificar que los datos cambian a mostrar volumen por sesión
6. Verificar que solo se muestran datos del usuario autenticado

### 5. Progreso a largo plazo
1. Seleccionar un ejercicio que se haya ejecutado en múltiples sesiones
2. Verificar que la gráfica/tabla muestra la progresión a lo largo del tiempo
3. Debe apreciarse si hay tendencia de sobrecarga progresiva (pesos subiendo)

### 6. Sin datos para un ejercicio
1. Seleccionar un ejercicio que nunca se ha ejecutado
2. Debe mostrar mensaje: "Sin datos para este ejercicio" o similar

---

## Pruebas de endpoints (Postman)

### Listar sesiones
```
GET {{base_url}}/rest/v1/sessions?user_id=eq.{{user_id}}&select=*&order=fecha_completado.desc
```

### Ver detalle de sesión con sets
```
GET {{base_url}}/rest/v1/sessions?id=eq.{{session_id}}&select=*,session_sets(*),recovery_checklist(*)
```

### Obtener progreso de un ejercicio
```
GET {{base_url}}/rest/v1/session_sets?select=peso,reps_reales,sessions(fecha_completado,block_exercises(ejercicio_id))&ejercicio_id=eq.{{exercise_id}}&order=session(fecha_completado).asc
```

### Verificar RLS - solo datos propios
```
GET {{base_url}}/rest/v1/sessions?select=*
Header: Authorization: Bearer {{access_token}}
```
Debe devolver solo sesiones del usuario autenticado.
