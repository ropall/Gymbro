## PRD padre

`issues/prd.md`

## Tipo

AFK

## Que construir

Inicializar el proyecto con Vite + React 18 + TypeScript. Configurar Tailwind CSS v4 mediante el plugin de Vite con la paleta de colores brand extraída de la plantilla estática (`plantilla-estatica/index.html`). Instalar y configurar Zustand para manejo de estado, Supabase client con variables de entorno, y vitest + @testing-library/react para tests. Implementar el layout base con navegación por tabs inferiores (Inicio, Rutinas, Historial, Nutrición, Perfil) mobile-first usando la tipografía Montserrat/Roboto y el tema oscuro de la plantilla. El layout debe ser 100% responsivo. Escribir al menos un test de integración que verifique que el layout renderiza los cinco tabs correctamente.

## Criterios de aceptacion

- [ ] `npm create vite@latest` ejecutado con React + TypeScript
- [ ] Tailwind CSS v4 configurado con plugin de Vite y paleta `brand` (dark, card, accent, lightAccent, mutedText, border)
- [ ] Fuentes Montserrat y Roboto cargadas desde Google Fonts
- [ ] Zustand instalado y configurado con middleware de persistencia
- [ ] Supabase client inicializado desde variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] Layout con 5 tabs inferiores visibles en mobile (Inicio, Rutinas, Historial, Nutrición, Perfil)
- [ ] Layout responsive: en desktop los tabs pueden mostrarse como sidebar o top nav
- [ ] `npm run build` exitoso sin errores
- [ ] `npm run test` ejecuta al menos 1 test que renderiza el layout y verifica los 5 tabs

## Bloqueado por

Ninguno - puede comenzar inmediatamente.

## Historias de usuario abordadas

- Historia de usuario 30

## QA - Pruebas manuales

### Navegación UI

1. Ejecutar `cd frontend && npm run dev` y abrir `http://localhost:5173`
2. Verificar 5 tabs inferiores: Inicio, Rutinas, Historial, Nutrición, Perfil — "Inicio" resaltado por defecto
3. Hacer clic en cada tab: Rutinas → "Gestiona tus bloques de entrenamiento", Historial → "Revisa tus sesiones anteriores", Nutrición → "Referencias de menus y macros", Perfil → "Tus metricas y progreso"
4. Verificar tema oscuro: fondo `#0f120f`, tab activo verde `#81d997`, tab inactivo gris `#a5ada4`, boton CTA verde `#2d874e`

### Responsive

1. DevTools → modo responsive (ej. iPhone 12)
2. Verificar 5 tabs visibles y usables sin desborde horizontal

### Build y Typecheck

```bash
cd frontend && npm run build   # debe completar sin errores
cd frontend && npm run typecheck   # debe completar sin errores
```

### Tests automáticos

```bash
cd frontend && npm run test   # 3 tests pasan: render 5 tabs, highlight active, switch on click
```
