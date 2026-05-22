# Pruebas Manuales - Issue 010: Nutrition Reference Editor

## Resumen
Sección de nutrición con menús diarios editables. CRUD de menús y comidas, macros y calorías editables manualmente, presupuesto mensual configurable.

## Pruebas automáticas existentes
Tests validan: CRUD de menús, CRUD de comidas dentro de un menú, macros y calorías son editables, datos aislados por usuario.

```bash
cd frontend && npm run test -- --testPathPattern=nutrition
```

---

## Pruebas manuales (UI)

### Requisitos previos
1. Usuario autenticado
2. `npm run dev`

### 1. Ver sección de nutrición
1. Navegar al tab "Nutrición"
2. Verificar que muestra:
   - Macros diarios totales (calorías, proteínas g, carbohidratos g, grasas g) como campos editables
   - Campo de presupuesto mensual (ej. "400,000 COP/mes") editable
3. Si no hay menús creados, mostrar mensaje para crear el primero

### 2. Editar macros y presupuesto
1. Hacer clic en el campo de calorías totales
2. Cambiar de 2900 a 3000 kcal
3. El cambio debe guardarse (inline o con botón de guardar)
4. Cambiar proteínas de 180g a 190g
5. Cambiar presupuesto mensual
6. Recargar la página → verificar que los cambios persisten
7. Verificar que estos datos son por usuario (otro usuario tiene sus propios valores)

### 3. Crear menú
1. Hacer clic en "Nuevo menú"
2. Ingresar nombre del menú: "Día de entrenamiento - Volumen"
3. Guardar
4. Verificar que el menú aparece como una card expandible
5. Estilo de card: fondo brand-card (#161d17), borde brand-border (#2b322b)

### 4. Agregar comidas al menú
1. En la card del menú creado, hacer clic en "Agregar comida"
2. Llenar formulario:
   - Nombre de comida: "Pre-Gimnasio (4:00 AM)"
   - Descripción: "Avena 80g + Whey Protein 1 scoop + Banana + Miel"

3. Guardar
4. Verificar que la comida aparece dentro del menú
5. Agregar más comidas:
   - "Post-Entreno (7:30 AM)": "Whey Protein 1 scoop + Creatina 5g + Pan Blanco 100g + Mermelada"
   - "Almuerzo (12:00 PM)": "Arroz 250g + Pechuga de Pollo 200g + Ensalada + Aguacate"
   - "Merienda (4:00 PM)": "Yogur Griego + Granola + Frutos Secos"
   - "Cena (8:00 PM)": "Pasta 200g + Atún 150g + Glicinato de Magnesio"

### 5. Ordenar comidas
1. Verificar que las comidas tienen botones para subir/bajar (reordenar)
2. Mover "Cena" arriba de "Merienda" usando el botón de subir
3. Verificar que el orden cambia visualmente
4. Recargar la página → verificar que el orden persiste

### 6. Editar comida
1. Hacer clic en editar una comida existente
2. Modificar el nombre o descripción
3. Guardar
4. Verificar que los cambios se reflejan

### 7. Eliminar comida
1. Hacer clic en eliminar una comida
2. Debe aparecer confirmación: "¿Eliminar esta comida?"
3. Confirmar
4. Verificar que la comida desaparece del menú

### 8. Crear múltiples menús
1. Crear un segundo menú: "Día de descanso"
2. Agregar algunas comidas
3. Verificar que ambos menús se muestran como cards independientes
4. Verificar que las comidas de un menú no aparecen en el otro

### 9. Eliminar menú
1. Hacer clic en eliminar un menú completo
2. Debe aparecer confirmación: "¿Eliminar este menú y todas sus comidas?"
3. Confirmar
4. Verificar que el menú y todas sus comidas desaparecen

### 10. Diseño consistente
1. Verificar que las cards de menú siguen el estilo de la plantilla estática
2. Colores: títulos en blanco, texto secundario en brand-mutedText (#a5ada4)
3. Bordes y fondos consistentes con el tema oscuro

---

## Pruebas de endpoints (Postman)

### Obtener menús del usuario
```
GET {{base_url}}/rest/v1/nutrition_menus?user_id=eq.{{user_id}}&select=*,nutrition_meals(*)
```

### Crear menú
```
POST {{base_url}}/rest/v1/nutrition_menus
Body: {
  "user_id": "{{user_id}}",
  "nombre": "Día de entrenamiento - Volumen"
}
```

### Agregar comida a menú
```
POST {{base_url}}/rest/v1/nutrition_meals
Body: {
  "menu_id": "{{menu_id}}",
  "nombre_comida": "Pre-Gimnasio (4:00 AM)",
  "descripcion": "Avena 80g + Whey Protein 1 scoop + Banana + Miel",
  "orden": 1
}
```

### Reordenar comidas
```
PATCH {{base_url}}/rest/v1/nutrition_meals?id=eq.{{meal_id}}
Body: { "orden": 2 }
```

### Eliminar comida
```
DELETE {{base_url}}/rest/v1/nutrition_meals?id=eq.{{meal_id}}
```

### Eliminar menú (cascade)
```
DELETE {{base_url}}/rest/v1/nutrition_menus?id=eq.{{menu_id}}
```
Verificar que las comidas asociadas también se eliminaron.
