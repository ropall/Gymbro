## PRD padre

`issues/prd.md`

## Tipo

AFK

## Que construir

Implementar el Modo de Entrenamiento Activo: la pantalla fullscreen sin tabs que se abre al hacer clic en "Empezar Rutina". Esta pantalla muestra únicamente los ejercicios del bloque actual, de forma secuencial. Para cada ejercicio se muestran las series objetivo y los inputs correspondientes. El flujo por serie es: al terminar una serie → se habilita un campo para registrar el peso levantado + un selector de RPE real → el usuario inicia manualmente el cronómetro de descanso con el tiempo sugerido para ese ejercicio → si intenta registrar la siguiente serie antes de tiempo, la app advierte pero permite continuar → completa todas las series → el ejercicio se marca como completado y avanza automáticamente al siguiente. Al completar todos los ejercicios: pantalla de celebración con mensaje motivacional aleatorio. Inmediatamente después de la celebración: el checklist de recuperación (nivel de energía obligatorio con selector 1-10, checkboxes opcionales para creatina/proteína/glicinato de magnesio). La UI debe ser mobile-first, optimizada para uso con una mano (botones grandes, inputs accesibles). Escribir tests que validen: (a) flujo completo de un ejercicio con múltiples series, (b) el timer muestra advertencia si se intenta registrar antes de tiempo, (c) el avance automático al completar todas las series de un ejercicio, (d) la celebración se muestra al completar todos los ejercicios, (e) el checklist de energía es obligatorio (no se puede omitir).

## Criterios de aceptacion

- [x] Pantalla fullscreen sin tabs inferiores, fondo oscuro con colores brand
- [x] Encabezado: nombre del bloque actual y progreso general (ej. "Ejercicio 2 de 5")
- [x] Ejercicio actual visible de forma prominente: nombre del ejercicio, series objetivo, reps objetivo, RPE objetivo, descanso sugerido
- [x] Lista de series del ejercicio actual con indicador de completadas/pendientes
- [x] Input de peso (kg) habilitado solo después de marcar una serie como completada
- [x] Input de RPE real habilitado junto con el peso (selector o stepper 1-10)
- [x] Botón "Iniciar descanso" visible tras registrar peso+RPE, que inicia un cronómetro regresivo con el tiempo sugerido
- [x] Cronómetro de descanso: muestra segundos restantes, botón para pausar/reanudar
- [x] Si el usuario intenta registrar la siguiente serie antes de que el cronómetro llegue a 0: toast/modal de advertencia "Aún faltan X segundos de descanso. ¿Continuar?" con botón para continuar o esperar
- [x] Al completar todas las series de un ejercicio: animación de completado + transición automática al siguiente ejercicio (scroll o fade)
- [x] Progreso visual: indicador de cuántos ejercicios completados del total del bloque
- [x] Al completar el último ejercicio: pantalla de celebración fullscreen con mensaje motivacional aleatorio (mínimo 5 mensajes distintos)
- [x] La pantalla de celebración tiene un botón "Continuar" que lleva al checklist de recuperación
- [x] Checklist de recuperación: selector de nivel de energía 1-10 (obligatorio, no se puede avanzar sin seleccionar)
- [x] Checklist de recuperación: checkboxes para suplementos (creatina, proteína, glicinato de magnesio) — opcionales
- [x] Botón "Finalizar entrenamiento" guarda la sesión completa + checklist en Supabase
- [x] Diseño mobile-first: inputs grandes (min 48px touch target), texto legible, scroll vertical cómodo
- [x] `npm run test` pasa con tests del flujo de entrenamiento activo

## Bloqueado por

- Bloqueado por `issues/007-routine-block-cycle-management.md`

## Historias de usuario abordadas

- Historia de usuario 15
- Historia de usuario 16
- Historia de usuario 17
- Historia de usuario 18
- Historia de usuario 19
- Historia de usuario 20
- Historia de usuario 21
- Historia de usuario 22
- Historia de usuario 23
- Historia de usuario 24
- Historia de usuario 29
