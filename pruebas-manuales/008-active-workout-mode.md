# Pruebas Manuales - Issue 008: Active Workout Mode

## Resumen
Pantalla fullscreen del Modo de Entrenamiento Activo. Flujo secuencial de ejercicios con registro de peso/RPE por serie, cronómetro de descanso con advertencia no bloqueante, celebración al completar, checklist de recuperación post-entreno.

## Pruebas automáticas existentes
Tests validan: flujo completo de ejercicio con series, advertencia del timer, avance automático entre ejercicios, pantalla de celebración, energía obligatoria en checklist.

```bash
cd frontend && npm run test -- --testPathPattern=workout|active
```

---

## Pruebas manuales (UI)

### Requisitos previos
1. Usuario autenticado con bloques y ciclo activo
2. `npm run dev`

### 1. Entrar al Modo Activo
1. Navegar al tab "Rutinas"
2. Hacer clic en "Empezar Rutina"
3. Debe abrirse una pantalla fullscreen:
   - Sin tabs inferiores (navegación oculta)
   - Fondo oscuro con colores brand
   - Encabezado: nombre del bloque y progreso (ej. "Ejercicio 1 de 5")

### 2. Ver ejercicio actual
1. El primer ejercicio debe mostrarse de forma prominente:
   - Nombre del ejercicio
   - Series objetivo (ej. "4 series")
   - Reps objetivo (ej. "8-12 reps")
   - RPE objetivo (ej. "RPE 8")
   - Descanso sugerido (ej. "90s")
2. Ver lista de series: 4 filas, todas en estado "pendiente"

### 3. Completar una serie
1. Hacer clic en la Serie 1 para marcarla como completada
2. Debe habilitarse un input de peso (kg) y un selector de RPE real (1-10)
3. Ingresar peso: 60 kg
4. Seleccionar RPE real: 7
5. Verificar que aparece el botón "Iniciar descanso"

### 4. Cronómetro de descanso
1. Hacer clic en "Iniciar descanso"
2. Debe iniciar un cronómetro regresivo desde el tiempo sugerido (ej. 90 segundos)
3. Verificar que el cronómetro muestra segundos restantes y va decrementando
4. Verificar que hay botón para pausar/reanudar el cronómetro
5. Esperar a que llegue a 0 (o pausar y reanudar)

### 5. Advertencia de descanso insuficiente
1. Iniciar el cronómetro para la Serie 2
2. Intentar registrar la Serie 2 antes de que el cronómetro llegue a 0
3. Debe aparecer un toast/modal de advertencia:
   - "Aún faltan X segundos de descanso. ¿Continuar?"
   - Botón "Esperar" → vuelve al cronómetro
   - Botón "Continuar" → permite registrar de todas formas (no bloqueante)
4. Hacer clic en "Continuar"
5. Verificar que se puede registrar la serie

### 6. Completar todas las series de un ejercicio
1. Completar todas las series del ejercicio actual (registrando peso y RPE)
2. Al completar la última serie:
   - Debe haber una animación de completado (check, fade, etc.)
   - Transición automática al siguiente ejercicio
3. El progreso debe actualizarse: "Ejercicio 2 de 5"

### 7. Completar todos los ejercicios (celebración)
1. Completar todos los ejercicios del bloque
2. Al terminar el último ejercicio:
   - Debe aparecer pantalla de celebración fullscreen
   - Mensaje motivacional aleatorio (mínimo 5 variantes posibles)
   - Animación o efecto visual de celebración
3. Verificar que hay un botón "Continuar"

### 8. Checklist de recuperación
1. Después de la celebración, hacer clic en "Continuar"
2. Debe aparecer el checklist de recuperación:
   - Selector de nivel de energía 1-10 (obligatorio)
   - Checkboxes de suplementos (opcionales):
     - Creatina
     - Proteína
     - Glicinato de magnesio
3. Intentar hacer clic en "Finalizar entrenamiento" sin seleccionar energía
   - Debe mostrar error: "El nivel de energía es obligatorio"
4. Seleccionar nivel de energía: 7
5. Marcar suplementos tomados: Creatina, Proteína
6. Hacer clic en "Finalizar entrenamiento"

### 9. Verificar guardado
1. Después de finalizar, volver al tab "Historial"
2. Debe aparecer la sesión recién completada con fecha de hoy
3. Entrar al detalle de la sesión
4. Verificar que muestra todos los datos registrados:
   - Ejercicios completados
   - Pesos por serie
   - RPE real por serie
   - Checklist de recuperación (energía, suplementos)

### 10. Mobile-first (una mano)
1. Abrir en dispositivo móvil real o emulado
2. Verificar que todos los botones tienen tamaño mínimo 48x48px (touch target)
3. Verificar que el texto es legible sin zoom
4. Verificar que el scroll vertical es fluido
5. Verificar que se puede operar con una mano (elementos clave accesibles con el pulgar)

---

## Pruebas de endpoints (Postman)

### Guardar sesión completada
```
POST {{base_url}}/rest/v1/sessions
Body: {
  "cycle_id": "{{cycle_id}}",
  "block_id": "{{block_id}}",
  "user_id": "{{user_id}}",
  "fecha_completado": "2025-05-21T10:30:00Z"
}
```

### Guardar sets de la sesión
```
POST {{base_url}}/rest/v1/session_sets
Body: {
  "session_id": "{{session_id}}",
  "block_exercise_id": "{{block_exercise_id}}",
  "peso": 60,
  "reps_reales": 10,
  "rpe_real": 7,
  "orden_serie": 1
}
```

### Guardar checklist de recuperación
```
POST {{base_url}}/rest/v1/recovery_checklist
Body: {
  "session_id": "{{session_id}}",
  "nivel_energia": 7,
  "suplementos": { "creatina": true, "proteina": true, "glicinato_magnesio": false }
}
```

### Verificar sesión guardada
```
GET {{base_url}}/rest/v1/sessions?id=eq.{{session_id}}&select=*,session_sets(*),recovery_checklist(*)
```
