## PRD padre

`issues/prd.md`

## Tipo

AFK

## Que construir

Implementar la vista de gestión de rutinas y el motor del ciclo de entrenamiento. El usuario puede ver sus bloques organizados por posición (1-7), editar bloques que aún no han sido ejecutados en el ciclo actual, y ver el estado del ciclo (posición actual, días completados vs pendientes). El motor del ciclo maneja: avance manual en días de descanso (el usuario confirma "Hoy descanso" para avanzar), avance automático al completar un bloque de entrenamiento, y al llegar a la posición 7 y completarla, pausa el ciclo mostrando un resumen con opción de editar bloques antes de reiniciar. Cada vez que se completa un bloque de entrenamiento, se genera un snapshot inmutable de la sesión con los ejercicios, series objetivo y los registros reales (peso, reps, RPE). Escribir tests que validen: (a) el ciclo avanza correctamente en entrenamiento (automático) y descanso (manual), (b) no se pueden editar bloques de posiciones ya completadas en el ciclo actual, (c) al completar la posición 7 se muestra resumen del ciclo y opción de reiniciar, (d) la sesión completada es un snapshot inmutable (no se modifica al editar el bloque después).

## Criterios de aceptacion

- [x] Vista "Rutinas" accesible desde el tab "Rutinas"
- [x] Visualización de los 7 días del ciclo actual: posición, nombre del bloque, estado (pendiente, completado, descanso, actual)
- [x] Indicador visual de la posición actual del ciclo
- [x] Botón "Empezar Rutina" visible en el día de entrenamiento actual (redirige al Modo Activo — implementado en issue 008)
- [x] Días de descanso: botón "Hoy descanso" para avanzar manualmente a la siguiente posición
- [x] Edición de bloques: solo posiciones futuras (no la actual ni las ya completadas) son editables
- [x] Editor de bloque: agregar/quitar ejercicios, modificar series/reps/RPE/descanso
- [x] Al completar un bloque (vía Modo Activo), la sesión se guarda como snapshot inmutable
- [x] Al llegar a posición 7 y completar: pantalla de resumen del ciclo con estadísticas (sesiones completadas, ejercicios, pesos)
- [x] En la pausa entre ciclos: opción de editar cualquier bloque antes de reiniciar
- [x] Botón "Iniciar nuevo ciclo" reinicia a posición 1 con los bloques (editados o no)
- [x] `npm run test` pasa con tests de ciclo y bloques

## Bloqueado por

- Bloqueado por `issues/006-onboarding-wizard.md`

## Historias de usuario abordadas

- Historia de usuario 12
- Historia de usuario 13
- Historia de usuario 14
