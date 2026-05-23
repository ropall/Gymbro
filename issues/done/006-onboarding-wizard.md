## PRD padre

`issues/prd.md`

## Tipo

AFK

## Que construir

Implementar el wizard de onboarding post-registro. El dashboard del usuario nuevo muestra un CTA prominente "Crear mi primera rutina" que lanza el wizard paso a paso: (1) definir estructura semanal — el usuario indica cuántos días entrena y cuántos descansa en un marco de 7 posiciones, (2) para cada día de entrenamiento, seleccionar grupo(s) muscular(es) objetivo, (3) la app sugiere ejercicios del catálogo global filtrados por el grupo muscular seleccionado — el usuario confirma, rechaza o agrega más ejercicios, (4) asignar series y repeticiones objetivo para cada ejercicio, (5) resumen final y confirmación. Al terminar, se crean los bloques y se inicia el primer ciclo. Escribir tests que validen: (a) el wizard solo se muestra para usuarios nuevos (sin bloques), (b) navegación completa entre pasos, (c) las sugerencias de ejercicios se filtran correctamente por grupo muscular, (d) los bloques se crean correctamente al finalizar.

## Criterios de aceptacion

- [ ] Dashboard muestra CTA "Crear mi primera rutina" solo si el usuario no tiene bloques creados
- [ ] Paso 1: selector de estructura semanal (slider o inputs para cantidad de días de entrenamiento, resto automático como descanso, total = 7)
- [ ] Paso 2: para cada día de entrenamiento, selector de grupo muscular (multi-select: Pecho, Espalda, Hombros, Bíceps, Tríceps, Cuádriceps, Isquios, Glúteos, Pantorrillas, Abdomen, Full Body)
- [ ] Paso 3: sugerencias de ejercicios del catálogo global filtradas por los grupos musculares seleccionados para ese día, con checkbox para incluir/excluir cada uno
- [ ] Paso 3: opción de buscar ejercicios adicionales del catálogo o crear ejercicio personalizado inline
- [ ] Paso 4: para cada ejercicio asignado, inputs de series objetivo, repeticiones (min-max o rango), RPE objetivo, y descanso sugerido (segundos)
- [ ] Paso 5: resumen visual de los 7 días del ciclo (entrenamiento vs descanso) con los ejercicios asignados
- [ ] Botón "Finalizar" crea los bloques en Supabase, inicializa el primer ciclo (posicion_actual = 1)
- [ ] Navegación con botones "Anterior" y "Siguiente" entre pasos, sin perder datos ya ingresados
- [ ] `npm run test` pasa con tests del wizard

## Bloqueado por

- Bloqueado por `issues/003-auth-google-oauth.md`
- Bloqueado por `issues/004-profile-and-metrics.md`
- Bloqueado por `issues/005-exercise-catalog.md`

## Historias de usuario abordadas

- Historia de usuario 3
- Historia de usuario 4
- Historia de usuario 5
