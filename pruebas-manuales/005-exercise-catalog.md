# Pruebas Manuales - Issue 005: Exercise Catalog

## Resumen
Browser del catálogo de ejercicios con filtrado por grupo muscular, jerarquía padre/hijo (variaciones), y CRUD de catálogo privado por usuario.

## Pruebas automáticas existentes
Tests validan: filtrado por grupo muscular, jerarquía padre/hijo, creación de ejercicio personalizado, catálogo global es solo lectura.

```bash
cd frontend && npm run test -- --testPathPattern=catalog
```

---

## Pruebas manuales (UI)

### Requisitos previos
1. Usuario autenticado
2. Catálogo semilla poblado en Supabase
3. `npm run dev`

### 1. Navegar al catálogo
1. Ir al tab "Rutinas"
2. Buscar acceso al catálogo de ejercicios (sub-página o botón "Ver catálogo")
3. Verificar que se muestran ejercicios organizados

### 2. Filtrar por grupo muscular
1. Verificar que hay tabs/filtros para los 11 grupos:
   - Pecho, Espalda, Hombros, Bíceps/Antebrazos, Tríceps, Cuádriceps, Isquiotibiales, Glúteos, Pantorrillas, Abdomen/Core, Cuerpo Completo
2. Hacer clic en "Pecho"
3. Solo deben mostrarse ejercicios de pecho (ej. Press Banca, Fondos, Aperturas)
4. Hacer clic en "Espalda"
5. Solo deben mostrarse ejercicios de espalda (ej. Dominadas, Remo con Barra, Jalón al Pecho)

### 3. Ver jerarquía padre/hijo (variaciones)
1. Buscar "Press Banca" en el catálogo
2. Hacer clic para ver detalle
3. Deben aparecer sus variaciones: Press Banca Agarre Cerrado, Press Banca Agarre Ancho, Press Banca Inclinado, etc.
4. Verificar que las variaciones son ejercicios hijos (parent_id apunta al Press Banca)
5. Navegar a otro ejercicio con variaciones (ej. Sentadilla → Sentadilla Frontal, Sentadilla Búlgara)

### 4. Crear ejercicio personalizado
1. Hacer clic en "Agregar ejercicio personalizado"
2. Llenar formulario:
   - Nombre: "Press Arnold Unilateral" (requerido)
   - Grupo muscular: "Hombros" (select)
   - Ejercicio base (opcional): "Press Arnold" (del catálogo global)
3. Guardar
4. Verificar que el ejercicio aparece en el catálogo con algún indicador visual de que es personalizado (ej. badge "Tuyo", color diferente, ícono)
5. Filtrar por "Hombros" → debe aparecer el nuevo ejercicio

### 5. Editar ejercicio personalizado
1. Hacer clic en el ejercicio personalizado creado
2. Modificar el nombre o grupo muscular
3. Guardar cambios
4. Verificar que los cambios se reflejan inmediatamente

### 6. Eliminar ejercicio personalizado
1. Hacer clic en eliminar en un ejercicio personalizado
2. Confirmar eliminación
3. Verificar que desaparece del catálogo

### 7. Catálogo global es solo lectura
1. Hacer clic en un ejercicio del catálogo global (ej. "Press Banca")
2. Verificar que NO aparecen botones de editar o eliminar
3. Solo los ejercicios personalizados deben tener opciones de edición/eliminación

### 8. Búsqueda de ejercicios
1. Usar el campo de búsqueda (si existe)
2. Escribir "press"
3. Deben aparecer todos los ejercicios que contengan "press": Press Banca, Press Militar, Press Arnold, etc.
4. Escribir "sentadilla"
5. Deben aparecer todas las variantes de sentadilla

---

## Pruebas de endpoints (Postman)

### Obtener catálogo global
```
GET {{base_url}}/rest/v1/global_exercises?select=*&order=nombre.asc
```

### Filtrar por grupo muscular
```
GET {{base_url}}/rest/v1/global_exercises?grupo_muscular=eq.Pecho&select=*
```

### Obtener variaciones de un ejercicio
```
GET {{base_url}}/rest/v1/global_exercises?parent_id=eq.{{exercise_id}}&select=*
```

### Crear ejercicio personalizado (user)
```
POST {{base_url}}/rest/v1/user_exercises
Body: {
  "user_id": "{{user_id}}",
  "nombre": "Press Arnold Unilateral",
  "grupo_muscular": "Hombros",
  "parent_id": null
}
```

### Listar ejercicios del usuario
```
GET {{base_url}}/rest/v1/user_exercises?user_id=eq.{{user_id}}&select=*
```

### Eliminar ejercicio personalizado
```
DELETE {{base_url}}/rest/v1/user_exercises?id=eq.{{exercise_id}}
```

### Verificar que usuario no puede modificar catálogo global (RLS)
```
POST {{base_url}}/rest/v1/global_exercises
Body: { "nombre": "Ejercicio Malicioso", "grupo_muscular": "Pecho" }
Header: Authorization: Bearer {{access_token}}
```
Debe devolver error 401/403 (solo lectura para usuarios).
