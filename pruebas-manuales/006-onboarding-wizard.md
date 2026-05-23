# Pruebas Manuales - Issue 006: Onboarding Wizard

## Resumen
Wizard de onboarding post-registro guiando al usuario paso a paso para crear su primera rutina: estructura semanal, grupos musculares, sugerencias de ejercicios, series/reps, confirmación.

## Pruebas automáticas existentes
Tests validan: wizard solo para usuarios nuevos, navegación entre pasos, filtrado de sugerencias por grupo muscular, creación de bloques al finalizar.

```bash
cd frontend && npm run test -- --testPathPattern=wizard|onboarding
```

---

## Pruebas manuales (UI)

### Requisitos previos
1. Usuario NUEVO (sin bloques creados) autenticado
2. `npm run dev`

### 1. Verificar CTA en dashboard para usuario nuevo
1. Iniciar sesión como usuario nuevo (primer login)
2. En el dashboard (tab Inicio), verificar que aparece un CTA prominente:
   - "Crear mi primera rutina"
   - Debe ser visible, con estilo destacado (botón grande, color brand-accent)
3. Iniciar sesión como usuario existente (que ya tiene bloques)
4. Verificar que el CTA NO aparece o es diferente

### 2. Paso 1: Estructura semanal
1. Hacer clic en "Crear mi primera rutina"
2. Verificar que se muestra el Paso 1: "Define tu semana de entrenamiento"
3. Usar el selector para indicar cuántos días se entrena (ej. 5 días)
4. Los días restantes se asignan automáticamente como descanso (ej. 2 descansos)
5. El total siempre debe ser 7 posiciones
6. Verificar que no se puede avanzar si no se ha seleccionado al menos 1 día de entrenamiento
7. Hacer clic en "Siguiente"

### 3. Paso 2: Grupos musculares por día
1. Para el Día 1 de entrenamiento: seleccionar grupo(s) muscular(es)
   - Usar multi-select con: Pecho, Espalda, Hombros, Bíceps, Tríceps, Cuádriceps, Isquios, Glúteos, Pantorrillas, Abdomen, Full Body
2. Seleccionar "Pecho" y "Tríceps" para el Día 1
3. Para el Día 2: seleccionar "Espalda" y "Bíceps"
4. Repetir para cada día de entrenamiento configurado
5. Verificar que los días de descanso no requieren selección de grupos
6. Hacer clic en "Siguiente"

### 4. Paso 3: Sugerencias de ejercicios
1. Para el Día 1 (Pecho + Tríceps):
   - Deben aparecer ejercicios del catálogo global filtrados por Pecho y Tríceps
2. Verificar ejercicios sugeridos para Pecho: Press Banca, Fondos, Aperturas, etc.
3. Verificar ejercicios sugeridos para Tríceps: Fondos en Paralelas, Extensión de Tríceps, Press Francés, etc.
4. Seleccionar/deseleccionar ejercicios con checkboxes:
   - Incluir: Press Banca, Aperturas con Mancuernas, Press Francés
   - Excluir: el resto
5. Opción de buscar ejercicios adicionales (si no aparece alguno deseado)
6. Opción de crear ejercicio personalizado inline
7. Hacer clic en "Siguiente"
8. Repetir para cada día de entrenamiento

### 5. Paso 4: Series y repeticiones
1. Para cada ejercicio asignado:
   - Input de series objetivo (ej. 4)
   - Input de repeticiones mínimas (ej. 8) y máximas (ej. 12)
   - Input de RPE objetivo (ej. 8)
   - Input de descanso sugerido en segundos (ej. 90)
2. Modificar valores según preferencia
3. Hacer clic en "Siguiente" para cada día
4. Verificar que se puede navegar con "Anterior" sin perder datos ya ingresados

### 6. Paso 5: Resumen y confirmación
1. Ver el resumen visual de los 7 días:
   - Día 1: Pecho + Tríceps (Press Banca, Aperturas, Press Francés)
   - Día 2: Espalda + Bíceps (...)
   - Día 3: Descanso
   - ... etc.
2. Verificar que el resumen es claro y muestra toda la estructura
3. Hacer clic en "Finalizar"

### 7. Verificar post-finalización
1. Al finalizar, los bloques deben crearse en Supabase
2. El primer ciclo debe iniciarse (posicion_actual = 1)
3. Redirigir al dashboard o a la vista de Rutinas
4. El CTA "Crear mi primera rutina" ya NO debe aparecer
5. Ir al tab "Rutinas" → deben verse los bloques creados con sus ejercicios

---

## Pruebas de endpoints (Postman)

### Verificar bloques creados
```
GET {{base_url}}/rest/v1/blocks?user_id=eq.{{user_id}}&select=*
```
Debe devolver 5 bloques de entrenamiento + 2 de descanso (7 total).

### Verificar ejercicios en un bloque
```
GET {{base_url}}/rest/v1/block_exercises?block_id=eq.{{block_id}}&select=*
```

### Verificar ciclo iniciado
```
GET {{base_url}}/rest/v1/cycles?user_id=eq.{{user_id}}&select=*
```
Debe devolver un ciclo con `activo: true` y `posicion_actual: 1`.
