## PRD padre

`issues/prd.md`

## Tipo

HITL

## Que construir

Implementar autenticación con Google OAuth usando Supabase Auth como único proveedor. Crear la página de login con un botón "Iniciar sesión con Google" estilizado según el theme brand. Implementar el flujo de callback post-autenticación, manejo de sesión (Zustand store para el usuario autenticado), y un componente wrapper de ruta protegida que redirija al login si no hay sesión activa. Configurar verificación obligatoria de email. Al detectar un usuario nuevo (primer login), redirigir al dashboard con el CTA de onboarding en lugar de mostrarlo como usuario recurrente. Escribir tests que validen: (a) login exitoso redirige al dashboard, (b) ruta protegida sin sesión redirige al login, (c) logout limpia la sesión.

Nota HITL: Requiere configurar el proyecto en Google Cloud Console (OAuth consent screen, credentials) y en Supabase Auth (habilitar Google provider, configurar redirect URLs).

## Criterios de aceptacion

- [ ] Página de login con botón "Iniciar sesión con Google" usando el theme brand (fondo oscuro, colores brand)
- [ ] Flujo OAuth completo: click en botón → ventana Google → redirect → sesión iniciada
- [ ] Zustand auth store con estado: `user`, `session`, `isLoading`, `isNewUser`
- [ ] Componente `ProtectedRoute` que redirige a `/login` si no hay sesión
- [ ] Detección de usuario nuevo (first login) para mostrar flujo de onboarding post-registro
- [ ] Verificación de email obligatoria configurada en Supabase Auth
- [ ] Botón de logout funcional que limpia sesión y redirige a login
- [ ] Variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` documentadas
- [ ] Test: login exitoso llama al store de auth y redirige a dashboard
- [ ] Test: ruta protegida sin sesión redirige a /login
- [ ] Test: logout limpia el store de auth

## Bloqueado por

- Bloqueado por `issues/002-database-schema-and-rls.md`

## Historias de usuario abordadas

- Historia de usuario 1
