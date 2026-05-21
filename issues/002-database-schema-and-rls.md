## PRD padre

`issues/prd.md`

## Tipo

HITL

## Que construir

Diseñar y ejecutar las migraciones de base de datos en Supabase para todas las entidades del sistema. Esto incluye: perfiles de usuario, métricas corporales con historial (peso, medidas, fotos), catálogo global de ejercicios con jerarquía padre/hijo, catálogo privado de ejercicios por usuario, bloques de entrenamiento (plantillas), ciclo de entrenamiento (7 posiciones), sesiones de entrenamiento (snapshots) con registros por serie, checklist de recuperación, y menús de nutrición editables. Configurar Row Level Security (RLS) para que cada usuario solo pueda leer/escribir sus propios datos. Crear la migración de datos semilla para el catálogo global de ejercicios desde `plantilla-estatica/semilla.txt`. Escribir un test que verifique que las políticas RLS impiden a un usuario acceder a datos de otro usuario (usando el cliente de Supabase en modo anónimo).

Nota HITL: Este issue requiere que el desarrollador cree un proyecto en Supabase y ejecute las migraciones. Las credenciales (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) deben documentarse como variables de entorno. El seed del catálogo debe ejecutarse con la service key.

## Criterios de aceptacion

- [ ] Tabla `profiles` creada con columnas: id (FK a auth.users), sexo, altura, fecha_nacimiento
- [ ] Tabla `weight_history` creada con FK a profiles, peso, fecha
- [ ] Tabla `measurement_history` creada con FK a profiles, tipo (pecho, cintura, cadera, biceps, muslo), valor, fecha
- [ ] Tabla `progress_photos` creada con FK a profiles, url, fecha
- [ ] Tabla `global_exercises` creada con columnas: nombre, grupo_muscular, parent_id (self-referencing FK), equipo
- [ ] Tabla `user_exercises` creada con FK a profiles, nombre, grupo_muscular, parent_id
- [ ] Tabla `blocks` creada con FK a profiles, nombre, posicion (1-7), es_descanso
- [ ] Tabla `block_exercises` creada con FK a blocks y exercises, series_objetivo, reps_objetivo_min, reps_objetivo_max, rpe_objetivo, descanso_segundos
- [ ] Tabla `cycles` creada con FK a profiles, fecha_inicio, posicion_actual, activo
- [ ] Tabla `sessions` creada con FK a cycles y blocks, fecha_completado
- [ ] Tabla `session_sets` creada con FK a sessions y block_exercises, peso, reps_reales, rpe_real, orden_serie
- [ ] Tabla `recovery_checklist` creada con FK a sessions, nivel_energia, suplementos (jsonb)
- [ ] Tabla `nutrition_menus` creada con FK a profiles, nombre
- [ ] Tabla `nutrition_meals` creada con FK a nutrition_menus, nombre_comida, descripcion, orden
- [ ] Políticas RLS para todas las tablas: usuario solo accede a sus propios datos (por FK a profiles o auth.uid())
- [ ] Catálogo semilla insertado desde `plantilla-estatica/semilla.txt` con jerarquía padre/hijo y grupos musculares
- [ ] Test que intenta acceder a datos de otro usuario y verifica que RLS lo bloquea

## Bloqueado por

Ninguno - puede comenzar inmediatamente.

## Historias de usuario abordadas

Infraestructura - habilita todas las historias de usuario.
