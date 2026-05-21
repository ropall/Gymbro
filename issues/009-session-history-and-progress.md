## PRD padre

`issues/prd.md`

## Tipo

AFK

## Que construir

Implementar la vista de historial de sesiones completadas y el tracking de progreso por ejercicio. El historial muestra una lista cronológica de sesiones con fecha, nombre del bloque, ejercicios completados, y acceso al detalle. La vista de detalle de sesión muestra cada ejercicio con sus series, pesos levantados, reps reales y RPE real registrados. El tracking de progreso por ejercicio permite al usuario seleccionar un ejercicio y ver una gráfica o tabla con la evolución de pesos y reps a lo largo del tiempo (sesiones) para planificar sobrecarga progresiva. Escribir tests que validen: (a) la lista de sesiones se muestra ordenada por fecha, (b) el detalle de sesión muestra todos los datos registrados por serie, (c) el progreso de un ejercicio muestra datos históricos correctos.

## Criterios de aceptacion

- [ ] Página de historial accesible desde el tab "Historial"
- [ ] Lista cronológica de sesiones completadas: fecha, nombre del bloque, cantidad de ejercicios
- [ ] Cada sesión en la lista es cliqueable para ver detalle
- [ ] Detalle de sesión: tabla con ejercicios, series, peso (kg), reps reales, RPE real por serie
- [ ] Indicador visual de la diferencia entre reps/RPE objetivo y real (ej. verde si igual o mejor, gris si menor)
- [ ] Página de progreso por ejercicio: selector de ejercicio (buscador/filtro desde catálogo)
- [ ] Gráfica o tabla de progreso: eje X = fechas de sesiones, eje Y = peso máximo o volumen (peso x reps)
- [ ] Vista de progreso alterna entre peso máximo por sesión y volumen total por sesión
- [ ] Los datos de progreso solo muestran ejercicios del usuario autenticado (RLS)
- [ ] `npm run test` pasa con tests de historial y progreso

## Bloqueado por

- Bloqueado por `issues/008-active-workout-mode.md`

## Historias de usuario abordadas

- Historia de usuario 25
