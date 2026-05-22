# Pruebas Manuales - Issue 001: Project Scaffolding & Layout

## Resumen de lo implementado
Inicialización del proyecto con Vite + React 18 + TypeScript en `frontend/`, configuración de Tailwind CSS v4, Zustand, Supabase client, vitest + testing-library, layout base con 5 tabs mobile-first y tema oscuro con paleta `brand`. Separación clara: `frontend/` (React) y `backend/` (Supabase).

## Pruebas automáticas existentes
Archivo: `frontend/src/test/Layout.test.tsx`

Para ejecutarlas:
```bash
cd frontend && npm run test
```

3 tests validan:
1. Renderiza los 5 tabs de navegación
2. Resalta el tab activo
3. Cambia el contenido al hacer clic en otro tab

## Pruebas manuales (navegación en UI)

### 1. Verificar que el layout renderiza los 5 tabs
1. Ejecutar `cd frontend && npm run dev`
2. Abrir `http://localhost:5173` en el navegador
3. Verificar que en la parte inferior se ven 5 tabs: Inicio, Rutinas, Historial, Nutrición, Perfil
4. Verificar que "Inicio" aparece resaltado por defecto

### 2. Verificar navegación entre tabs
1. Hacer clic en "Rutinas" → debe mostrar "Gestiona tus bloques de entrenamiento"
2. Hacer clic en "Historial" → debe mostrar "Revisa tus sesiones anteriores"
3. Hacer clic en "Nutrición" → debe mostrar "Referencias de menús y macros"
4. Hacer clic en "Perfil" → debe mostrar "Tus métricas y progreso"
5. Hacer clic en "Inicio" → debe mostrar "Bienvenido a tu app de entrenamiento" y botón "Crear mi primera rutina"

### 3. Verificar tema oscuro y colores brand
1. El fondo debe ser oscuro (`#0f120f`)
2. Los tabs activos deben verse en verde claro (`#81d997`)
3. Los tabs inactivos deben verse en gris (`#a5ada4`)
4. El botón CTA debe ser verde (`#2d874e`)

### 4. Verificar responsive (mobile-first)
1. Abrir las DevTools (F12) y activar el modo responsive (Ctrl+Shift+M)
2. Seleccionar un dispositivo móvil (ej. iPhone 12)
3. Verificar que los 5 tabs inferiores son visibles y usables
4. Verificar que el contenido no se desborda horizontalmente

### 5. Verificar build de producción
```bash
cd frontend && npm run build
```
Debe completarse sin errores ni warnings.

### 6. Verificar typecheck
```bash
cd frontend && npm run typecheck
```
Debe completarse sin errores de TypeScript.
