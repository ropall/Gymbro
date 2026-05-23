## PRD padre

`issues/prd.md`

## Tipo

AFK

## Que construir

Implementar la sección de nutrición como referencia editable. El usuario puede crear, editar y eliminar menús diarios. Cada menú contiene comidas (pre-gimnasio, post-entreno, almuerzo, merienda, cena) con nombre y descripción. La sección muestra un desglose de macros (proteínas, carbohidratos, grasas) y calorías totales como valores editables por el usuario (no se calculan automáticamente — el usuario ingresa los valores manualmente). El presupuesto de 400,000 COP/mes es un campo de texto libre asociado al perfil, editable. Los menús se muestran en cards como en la plantilla estática. Escribir tests que validen: (a) CRUD completo de menús, (b) CRUD de comidas dentro de un menú, (c) los macros y calorías son campos editables, (d) los datos están aislados por usuario.

## Criterios de aceptacion

- [ ] Página de nutrición accesible desde el tab "Nutrición"
- [ ] Visualización de macros diarios: calorías totales, proteínas (g), carbohidratos (g), grasas (g) — campos numéricos editables inline
- [ ] Campo de presupuesto mensual: texto libre editable (ej. "400,000 COP/mes")
- [ ] Lista de menús diarios con nombre del menú
- [ ] Botón "Nuevo menú" para crear un menú vacío
- [ ] Cada menú es una card expandible con sus comidas
- [ ] Dentro de un menú: botón "Agregar comida" que abre un formulario con nombre de comida (ej. "Pre-Gimnasio") y descripción (textarea con ingredientes y cantidades)
- [ ] Las comidas dentro de un menú tienen orden arrastrable o botones subir/bajar
- [ ] Botón de eliminar en cada menú (con confirmación)
- [ ] Botón de eliminar en cada comida (con confirmación)
- [ ] Diseño de cards similar a la plantilla estática (fondo brand-card, bordes brand-border, texto brand-mutedText)
- [ ] `npm run test` pasa con tests de nutrición

## Bloqueado por

- Bloqueado por `issues/002-database-schema-and-rls.md`
- Bloqueado por `issues/003-auth-google-oauth.md`

## Historias de usuario abordadas

- Historia de usuario 26
- Historia de usuario 27

## Guía de QA

### Prerrequisitos
- Tener sesión iniciada (Google OAuth)
- Tener un perfil creado

### Pasos de prueba manual

1. **Navegación:** Ir al tab "Nutrición" en el bottom nav → debe mostrar "Nutrición" como título y "Referencias de menús y macros" como subtítulo
2. **Crear menú:** Hacer clic en "+ Nuevo menú" → escribir "Menú de prueba" → clic en "Crear" → debe aparecer la card del nuevo menú
3. **Editar nombre del menú:** Hacer clic en el nombre del menú → se vuelve editable → cambiar nombre → Enter o blur para guardar
4. **Macros editables:** En la card expandida, ver las 4 cards de macros (Calorías Totales, Proteínas, Carbohidratos, Grasas) → hacer clic en cualquier valor → se vuelve un input numérico → cambiar valor → Enter o blur para guardar
5. **Presupuesto:** Ver el campo "Presupuesto mensual" → hacer clic en "Agregar presupuesto..." → escribir "400,000 COP/mes" → Enter o blur para guardar
6. **Agregar comida:** Hacer clic en "+ Agregar comida" → se abre formulario con nombre y descripción → seleccionar un nombre predefinido (ej. "Pre-Gimnasio") o escribir manualmente → escribir descripción → clic en "Agregar"
7. **Editar comida:** Hacer clic en el nombre de una comida para editarlo → hacer clic en la descripción para editarla
8. **Reordenar comida:** Hacer clic en el menú (⋮) de una comida → seleccionar "Subir" o "Bajar" → la posición cambia
9. **Eliminar comida:** Hacer clic en (⋮) → "Eliminar" → confirmar con "Sí"
10. **Eliminar menú:** Hacer clic en el ícono de eliminar (🗑️) en el header de la card → confirmar con "Sí"
11. **Colapsar/Expandir:** Hacer clic en el header de la card para colapsar o expandir el contenido de la card

### Validaciones backend (RLS)
- Los menús y comidas creados por un usuario NO deben ser visibles para otros usuarios
- Verificar en la tabla `nutrition_menus` que `profile_id` corresponde al `auth.uid()` del usuario autenticado
