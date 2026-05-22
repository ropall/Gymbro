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

## Estado actual

**SQL preparado y listo para ejecutar en Supabase.** Los archivos de migración y seed están en `backend/supabase/`:

- `migrations/002_full_schema.sql` — crea las 14 tablas + RLS + trigger auto-profile
- `seeds/002_seed_exercises.sql` — inserta 96 ejercicios del catálogo global

## Bloqueado por

Ninguno - puede comenzar inmediatamente.

## Historias de usuario abordadas

Infraestructura - habilita todas las historias de usuario.

## QA - Pruebas manuales (pasos de ejecución HITL)

### 1. Crear proyecto en Supabase

1. Ir a https://supabase.com y crear una cuenta
2. Crear un nuevo proyecto (selecciona región cercana a usuarios)
3. Guardar **Project URL** y **anon public API key**
4. Copiar a `frontend/.env`:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 2. Ejecutar migraciones de schema

**Opción A — Supabase CLI (recomendado):**
```bash
cd backend/supabase
supabase db push
```

**Opción B — SQL Editor (Dashboard):**
1. Abrir el proyecto en Supabase Dashboard
2. Ir a SQL Editor → New Query
3. Copiar y pegar todo el contenido de `migrations/002_full_schema.sql`
4. Ejecutar (Run)

### 3. Ejecutar seed de ejercicios

1. Ir a SQL Editor → New Query
2. Copiar y pegar todo el contenido de `seeds/002_seed_exercises.sql`
3. **Importante:** ejecutar con la **Service Role Key** (no la anon key)
4. Verificar: `SELECT COUNT(*) FROM public.global_exercises;` → debe devolver ~96

### 4. Crear bucket de Storage

1. Ir a Storage → Buckets → New Bucket
2. Nombre: `progress-photos`
3. Configurar como privado (acceso via signed URLs)
4. Agregar políticas RLS en Storage:
   - `SELECT`: `auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text`
   - `INSERT`: misma condición
   - `DELETE`: misma condición

### 5. Verificar RLS (test manual con curl)

**Test: Usuario A inserta datos, Usuario B (anónimo) intenta leer**

```bash
# 1. Crear usuario A (sign up via Supabase Auth)
curl -X POST "https://tu-proyecto.supabase.co/auth/v1/signup" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"testa@example.com","password":"TestPass123!"}'

# 2. Iniciar sesión y obtener token
curl -X POST "https://tu-proyecto.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"testa@example.com","password":"TestPass123!"}'

# 3. Insertar un registro de peso (como Usuario A)
curl -X POST "https://tu-proyecto.supabase.co/rest/v1/weight_history" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"peso":80,"fecha":"2024-01-15"}'

# 4. Intentar leer como anónimo (sin token)
curl -X GET "https://tu-proyecto.supabase.co/rest/v1/weight_history" \
  -H "apikey: $ANON_KEY"
# Esperado: [] (vacío) o error 401 — RLS bloquea

# 5. Crear Usuario B, iniciar sesión, intentar leer datos de A
curl -X POST "https://tu-proyecto.supabase.co/auth/v1/signup" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"testb@example.com","password":"TestPass123!"}'

# Iniciar sesión como B, obtener TOKEN_B
curl -X GET "https://tu-proyecto.supabase.co/rest/v1/weight_history" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_B"
# Esperado: [] (vacío) — RLS bloquea acceso a datos de otro usuario
```

### 6. Verificar tabla por tabla

Ejecutar en SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Esperado: 14 tablas (profiles, weight_history, measurement_history, 
-- progress_photos, global_exercises, user_exercises, blocks, block_exercises,
-- cycles, sessions, session_sets, recovery_checklist, nutrition_menus, nutrition_meals)
```

### 7. Verificar trigger de auto-perfil

1. Crear un nuevo usuario via Sign Up
2. Consultar: `SELECT * FROM public.profiles WHERE id = 'uid-del-usuario';`
3. Esperado: fila creada automáticamente con email y full_name
