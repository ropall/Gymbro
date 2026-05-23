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

## Guía de QA

### Prerrequisitos
- Tener sesión iniciada
- Tener un bloque de entrenamiento creado
- Build de producción para probar Service Worker: `npm run build && npm run preview`

### Pasos de prueba manual

1. **PWA manifest:** Abrir Chrome DevTools → Application → Manifest → verificar nombre "Gymbro", theme_color #0f120f, icons SVG
2. **Service Worker:** En build producción, abrir DevTools → Application → Service Workers → verificar SW registrado y cacheando assets
3. **Instalabilidad:** En Android, debería aparecer el banner "Add to Home Screen". En iOS, usar "Share → Add to Home Screen"
4. **Persistencia del workout:** Iniciar un entrenamiento activo → registrar una serie → refrescar la página (F5) → verificar que el estado del workout se mantiene (ejercicio actual, sets completados)
5. **Offline durante workout:** Iniciar entrenamiento → desconectar internet (DevTools → Network → Offline) → completar series, registrar pesos/RPE → verificar que todo funciona sin conexión
6. **Finalizar offline:** Con internet desconectado, llegar al final del entrenamiento → completar checklist de recuperación → finalizar → verificar badge "Pendiente" en el header
7. **Sincronización automática:** Reconectar internet → verificar que el badge "Pendiente" desaparece y la sesión aparece en Historial
8. **Badge de conexión:** Al desconectar, ver badge "Sin conexión" en el header. Al reconectar, el badge desaparece

### Notas técnicas
- Los tests de PWA corren en modo vitest (jsdom) — no requieren Service Worker real
- El Service Worker solo se registra en build producción (`vite build`), no en dev
- `navigator.onLine` se mockea via `vi.stubGlobal` para tests offline
