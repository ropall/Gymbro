# Pruebas Manuales - Issue 003: Auth Google OAuth

## Resumen
Autenticación con Google OAuth vía Supabase Auth. Login, callback, manejo de sesión con Zustand, ruta protegida, detección de usuario nuevo.

## Pruebas automáticas existentes
3 tests validan: login redirige a dashboard, ruta protegida sin sesión redirige a login, logout limpia la sesión.

```bash
cd frontend && npm run test -- --testPathPattern=auth
```

---

## Pruebas manuales (UI)

### Requisitos previos
1. Variables de entorno configuradas en `frontend/.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Google OAuth configurado en Supabase Auth Dashboard
3. `npm run dev` ejecutándose en `http://localhost:5173`

### 1. Flujo completo de login
1. Abrir `http://localhost:5173`
2. Si no hay sesión, debe redirigir a `/login`
3. Verificar que la página de login tiene:
   - Fondo oscuro (`#0f120f`)
   - Botón "Iniciar sesión con Google" con colores brand (acento verde `#2d874e`)
   - Logo o nombre "Gymbro"
4. Hacer clic en "Iniciar sesión con Google"
5. Debe abrir ventana de Google para seleccionar cuenta
6. Seleccionar cuenta de Google
7. Debe redirigir de vuelta a la app → dashboard (Inicio)
8. Verificar que el dashboard muestra contenido (ya no redirige a login)

### 2. Verificar detección de usuario nuevo
1. Crear una cuenta de Google que nunca haya iniciado sesión en la app
2. Iniciar sesión con esa cuenta
3. Debe mostrarse el CTA "Crear mi primera rutina" prominente en el dashboard
4. El estado `isNewUser` debe ser `true` en el store de Zustand

### 3. Verificar ruta protegida
1. Cerrar sesión (hacer clic en botón de logout)
2. Intentar acceder directamente a `http://localhost:5173/rutinas`
3. Debe redirigir automáticamente a `/login`

### 4. Verificar persistencia de sesión
1. Iniciar sesión
2. Recargar la página (F5)
3. Debe mantener la sesión activa (no redirige a login)
4. El usuario debe seguir viendo el dashboard

### 5. Verificar logout
1. Estando autenticado, hacer clic en el botón de logout/salir
2. Debe limpiar la sesión completamente
3. Debe redirigir a `/login`
4. Recargar la página → debe permanecer en login

---

## Pruebas de endpoints (Postman)

### Obtener sesión actual
```
GET {{base_url}}/auth/v1/user
Header: apikey: {{anon_key}}
        Authorization: Bearer {{access_token}}
```
Debe devolver el objeto `user` con email, id, etc.

### Refrescar token
```
POST {{base_url}}/auth/v1/token?grant_type=refresh_token
Body: { "refresh_token": "{{refresh_token}}" }
```
Debe devolver nuevo `access_token` y `refresh_token`.

### Cerrar sesión (invalida token)
```
POST {{base_url}}/auth/v1/logout
Header: apikey: {{anon_key}}
        Authorization: Bearer {{access_token}}
```
Debe devolver 204 No Content.
