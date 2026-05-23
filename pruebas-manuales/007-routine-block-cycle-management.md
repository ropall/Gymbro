# Pruebas Manuales - Issue 007: Routine Block & Cycle Management

## Resumen
Vista de gestión de rutinas con el motor del ciclo de entrenamiento de 7 posiciones. Avance manual en descansos, avance automático al completar bloque, edición de bloques futuros, snapshots inmutables de sesiones, resumen y reinicio de ciclo.

## Pruebas automáticas existentes
Tests validan: avance del ciclo en entrenamiento y descanso, bloqueo de edición en posiciones completadas, resumen al completar posición 7, inmutabilidad de snapshots.

```bash
cd frontend && npm run test -- --testPathPattern=cycle|block|routine
```

---

## Pruebas manuales (UI)

### Requisitos previos
1. Usuario autenticado con bloques creados y ciclo activo
2. `npm run dev`

### 1. Ver ciclo actual
1. Navegar al tab "Rutinas"
2. Verificar que se muestran las 7 posiciones del ciclo
3. Cada posición debe mostrar:
   - Número de día (1-7)
   - Nombre del bloque o "Descanso"
   - Estado: pendiente, completado, descanso, actual
4. La posición actual debe tener un indicador visual destacado
5. Verificar botón "Empezar Rutina" en el día de entrenamiento actual

### 2. Avance en día de descanso (manual)
1. Si la posición actual es un día de descanso:
   - Debe aparecer un botón "Hoy descanso"
2. Hacer clic en "Hoy descanso"
3. Debe aparecer confirmación: "¿Confirmas que hoy es día de descanso?"
4. Confirmar
5. El ciclo debe avanzar a la siguiente posición (posicion_actual + 1)
6. Verificar que el indicador de posición actual se movió

### 3. Avance al completar bloque (automático vía Modo Activo)
1. Desde el tab Rutinas, hacer clic en "Empezar Rutina" (redirige al Modo Activo)
2. Completar el entrenamiento (flujo del issue 008)
3. Al finalizar y guardar la sesión, volver a Rutinas
4. Verificar que la posición completada ahora muestra estado "completado"
5. Verificar que el ciclo avanzó a la siguiente posición

### 4. Editar bloques futuros
1. Con el ciclo en posición 3 (por ejemplo):
   - Las posiciones 4, 5, 6, 7 deben ser editables
   - La posición 3 (actual) y 1, 2 (completadas) NO deben ser editables
2. Hacer clic en "Editar" en la posición 4
3. Modificar: agregar/quitar ejercicios, cambiar series/reps/RPE/descanso
4. Guardar
5. Verificar que los cambios se reflejan en el bloque
6. Intentar editar la posición 1 o 2 → no debe ser posible (botón deshabilitado o no visible)

### 5. Verificar snapshot inmutable de sesión
1. Completar un bloque mediante el Modo Activo
2. Ir al historial (tab Historial) y ver la sesión recién creada
3. Volver a Rutinas y editar el bloque correspondiente (cambiar series o ejercicios)
4. Volver al Historial y ver la misma sesión → debe seguir mostrando los datos originales (snapshot no se modificó)

### 6. Completar ciclo (llegar a posición 7)
1. Avanzar manualmente los días de descanso y completar los bloques hasta llegar a la posición 7
2. Completar el bloque de la posición 7 mediante el Modo Activo
3. Debe aparecer pantalla de resumen del ciclo:
   - Estadísticas: sesiones completadas (5), total ejercicios, pesos máximos
   - Resumen visual de lo completado
4. Verificar que hay opción de "Editar bloques antes de reiniciar"
5. Hacer clic en "Editar bloques" → poder modificar cualquier bloque
6. Guardar cambios

### 7. Reiniciar ciclo
1. En la pantalla de resumen, hacer clic en "Iniciar nuevo ciclo"
2. El ciclo se reinicia a posición 1
3. Los bloques deben reflejar los cambios hechos (si se editaron)
4. Las sesiones del ciclo anterior permanecen en el historial

---

## Pruebas de endpoints (Postman)

### Obtener ciclo activo
```
GET {{base_url}}/rest/v1/cycles?user_id=eq.{{user_id}}&activo=eq.true&select=*
```

### Avanzar ciclo manualmente (día de descanso)
```
PATCH {{base_url}}/rest/v1/cycles?id=eq.{{cycle_id}}
Body: { "posicion_actual": {{next_position}} }
```

### Obtener bloques del ciclo
```
GET {{base_url}}/rest/v1/blocks?user_id=eq.{{user_id}}&select=*&order=posicion.asc
```

### Editar bloque futuro
```
PATCH {{base_url}}/rest/v1/blocks?id=eq.{{block_id}}
Body: { "nombre": "Nuevo nombre del bloque" }
```

### Verificar que no se puede editar bloque pasado
Intentar PATCH a un bloque de posición < posicion_actual con estado "completado". Debe ser rechazado por lógica de negocio.

### Obtener sesión (snapshot)
```
GET {{base_url}}/rest/v1/sessions?cycle_id=eq.{{cycle_id}}&select=*
```

### Verificar inmutabilidad del snapshot
Modificar el bloque original y verificar que la sesión no cambió:
```
GET {{base_url}}/rest/v1/session_sets?session_id=eq.{{session_id}}&select=*
```
Los datos deben permanecer como se registraron originalmente.
