## PRD padre

`issues/prd.md`

## Tipo

AFK

## Qué construir

Inicializar el proyecto con Vite + React 18 + TypeScript. Configurar Tailwind CSS v4 mediante el plugin de Vite con la paleta de colores brand extraída de la plantilla estática (`plantilla-estatica/index.html`). Instalar y configurar Zustand para manejo de estado, Supabase client con variables de entorno, y vitest + @testing-library/react para tests. Implementar el layout base con navegación por tabs inferiores (Inicio, Rutinas, Historial, Nutrición, Perfil) mobile-first usando la tipografía Montserrat/Roboto y el tema oscuro de la plantilla. El layout debe ser 100% responsivo. Escribir al menos un test de integración que verifique que el layout renderiza los cinco tabs correctamente.

## Criterios de aceptación

- [x] `npm create vite@latest` ejecutado con React + TypeScript en `frontEnd/`
- [x] Tailwind CSS v4 configurado con plugin de Vite y paleta `brand` (dark, card, accent, lightAccent, mutedText, border)
- [x] Fuentes Montserrat y Roboto cargadas desde Google Fonts
- [x] Zustand instalado y configurado con middleware de persistencia
- [x] Supabase client inicializado desde variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [x] Layout con 5 tabs inferiores visibles en mobile (Inicio, Rutinas, Historial, Nutrición, Perfil)
- [x] Layout responsive: los tabs inferiores usan ancho máximo (max-w-lg) y se centran
- [x] `npm run build` exitoso sin errores → genera `frontEnd/dist/`
- [x] `npm run test` ejecuta 2 tests que verifican los 5 tabs y la página por defecto

## Bloqueado por

Ninguno - puede comenzar inmediatamente.

## Historias de usuario abordadas

- Historia de usuario 30

## Cómo probar (QA)

1. **Build:** `cd frontEnd && npm run build`. Debe compilar sin errores y generar `frontEnd/dist/`.
2. **Tests:** `cd frontEnd && npm run test`. Pasan 2 tests (1 archivo): verifica que los 5 tabs se renderizan y que Inicio es la página por defecto.
3. **Dev server:** `cd frontEnd && npm run dev`. Abre `http://localhost:5173`. Verifica:
   - Fondo oscuro (#0f120f)
   - Bottom nav con 5 tabs: Inicio, Rutinas, Historial, Nutrición, Perfil
   - Tab activo resaltado en verde (#81d997)
   - Página Inicio muestra "Dashboard principal"
   - Al hacer clic en otros tabs, cambia la página y el tab activo
4. **Responsive:** Redimensiona a 375px. Los tabs siguen visibles y funcionales.
5. **Typecheck:** `cd frontEnd && npm run typecheck`. Sin errores de tipos.

## Estructura del build

- **Frontend:** Código fuente en `frontEnd/src/`, build output en `frontEnd/dist/`
- **Backend:** Configuración de Supabase en `backEnd/` (migrations/, edge-functions/, config.toml)
