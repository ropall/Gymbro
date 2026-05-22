# Pruebas Manuales - Issue 002: Database Schema & RLS

## Resumen
Migraciones de base de datos en Supabase para todas las entidades del sistema + Row Level Security. Incluye el catálogo semilla de ~100 ejercicios desde `plantilla-estatica/semilla.txt`.

## Pruebas manuales (Postman)

### Requisitos previos
1. Tener un proyecto creado en Supabase
2. Obtener la `service_role key` desde Supabase Dashboard → Settings → API
3. Configurar las variables de entorno:
   - `SUPABASE_URL` = URL del proyecto (ej. `https://xxx.supabase.co`)
   - `SUPABASE_SERVICE_KEY` = service_role key
   - `SUPABASE_ANON_KEY` = anon/public key

### Configuración de Postman
Crear una collection con las siguientes variables:
```
base_url: https://xxx.supabase.co
service_key: eyJhbG... (service_role key)
anon_key: eyJhbG... (anon key)
```

Configurar headers por defecto:
```
apikey: {{service_key}}
Authorization: Bearer {{service_key}}
Content-Type: application/json
```

---

### 1. Verificar creación de tablas

**GET** `{{base_url}}/rest/v1/profiles?select=*`
Header: `apikey: {{service_key}}`, `Authorization: Bearer {{service_key}}`

Debe devolver `[]` (array vacío, tabla existe).

Repetir para cada tabla:
- `GET {{base_url}}/rest/v1/weight_history?select=*`
- `GET {{base_url}}/rest/v1/measurement_history?select=*`
- `GET {{base_url}}/rest/v1/progress_photos?select=*`
- `GET {{base_url}}/rest/v1/global_exercises?select=*`
- `GET {{base_url}}/rest/v1/user_exercises?select=*`
- `GET {{base_url}}/rest/v1/blocks?select=*`
- `GET {{base_url}}/rest/v1/block_exercises?select=*`
- `GET {{base_url}}/rest/v1/cycles?select=*`
- `GET {{base_url}}/rest/v1/sessions?select=*`
- `GET {{base_url}}/rest/v1/session_sets?select=*`
- `GET {{base_url}}/rest/v1/recovery_checklist?select=*`
- `GET {{base_url}}/rest/v1/nutrition_menus?select=*`
- `GET {{base_url}}/rest/v1/nutrition_meals?select=*`

Todas deben devolver `[]` (no error 404).

---

### 2. Verificar catálogo semilla

**GET** `{{base_url}}/rest/v1/global_exercises?select=*`

Debe devolver un array con ~100 ejercicios organizados por grupo muscular. Verificar que algunos ejercicios tienen `parent_id` (variaciones).

---

### 3. Verificar RLS - Acceso anónimo bloqueado

Usando el `anon_key` (no la service key):

**GET** `{{base_url}}/rest/v1/profiles?select=*`
Header: `apikey: {{anon_key}}`

Debe devolver `[]` (RLS bloquea acceso sin autenticación).

---

### 4. Verificar RLS - Usuario solo ve sus datos

1. Crear dos usuarios (User A y User B) mediante Supabase Auth
2. Insertar datos en `weight_history` para User A usando service_key:
```
POST {{base_url}}/rest/v1/weight_history
Body: { "user_id": "<uuid_user_a>", "weight": 70, "date": "2025-01-01" }
```
3. Autenticar como User B (obtener JWT de `supabase.auth.signInWithPassword`)
4. Hacer GET `{{base_url}}/rest/v1/weight_history?select=*` con el token de User B
5. Debe devolver `[]` (User B no ve datos de User A)

---

### 5. Verificar estructura de tablas principales

```sql
-- Ejecutar en SQL Editor de Supabase:
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';
```

Tabla `profiles` debe tener: id (UUID), sexo (TEXT), altura (NUMERIC), fecha_nacimiento (DATE), created_at, updated_at.

---

### Pruebas de integración automáticas
El test verifica que RLS bloquea acceso a datos de otro usuario usando el cliente de Supabase en modo anónimo. Ejecutar con:
```bash
cd frontend && npm run test -- --testPathPattern=rl
```
