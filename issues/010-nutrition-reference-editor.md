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
