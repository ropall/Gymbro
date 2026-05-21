## PRD padre

`issues/prd.md`

## Tipo

AFK

## Que construir

Configurar la PWA (Progressive Web App) con vite-plugin-pwa para que la app sea instalable en dispositivos móviles y funcione sin conexión durante el Modo de Entrenamiento Activo. Implementar el modo offline híbrido pragmático: al entrar al Modo Activo, el bloque completo y los datos del usuario se cargan en localStorage vía el middleware de persistencia de Zustand. Durante el entrenamiento no se requiere internet — todos los registros (pesos, RPE, timer) operan sobre el estado local. Al finalizar el entrenamiento y completar el checklist de recuperación, la sesión se guarda en Supabase. Si no hay conexión al finalizar, la sesión se persiste localmente y se sincroniza automáticamente al reconectar. Escribir tests que validen: (a) el estado del entrenamiento activo persiste en localStorage y sobrevive a un refresh de página, (b) al perder conexión durante el entrenamiento la app sigue funcionando, (c) una sesión guardada offline se sincroniza al reconectar.

## Criterios de aceptacion

- [ ] vite-plugin-pwa instalado y configurado con estrategia de cacheo para assets estáticos
- [ ] Manifest JSON configurado: nombre "Gymbro", iconos (mínimo 192x192 y 512x512), theme_color #0f120f, background_color #0f120f, display standalone
- [ ] Service Worker registrado y cacheando shell de la app (HTML, CSS, JS, fuentes)
- [ ] La app es instalable en iOS (PWA) y Android (Add to Home Screen)
- [ ] Zustand store del entrenamiento activo persiste en localStorage (middleware `persist`)
- [ ] Al entrar al Modo Activo: el bloque se carga desde Supabase y se guarda en localStorage
- [ ] Durante el entrenamiento: todas las operaciones (registrar series, timer, completar ejercicios) funcionan sin internet
- [ ] Al finalizar entrenamiento con conexión: sesión y checklist se guardan directamente en Supabase
- [ ] Al finalizar entrenamiento sin conexión: sesión se guarda en localStorage con flag `pendingSync: true`
- [ ] Al reconectar: detección de conexión (evento `online`) dispara sincronización de sesiones pendientes
- [ ] Indicador visual de estado offline/online (ej. badge en el header)
- [ ] `npm run test` pasa con tests de offline y persistencia

## Bloqueado por

- Bloqueado por `issues/001-project-scaffolding-and-layout.md`
- Bloqueado por `issues/008-active-workout-mode.md`

## Historias de usuario abordadas

- Historia de usuario 28
