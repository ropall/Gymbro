# Pruebas Manuales - Issue 011: Offline PWA Mode

## Resumen
Configuración de PWA con vite-plugin-pwa. App instalable en móviles, funcionamiento offline durante el Modo de Entrenamiento Activo, sincronización al reconectar.

## Pruebas automáticas existentes
Tests validan: estado del entrenamiento persiste en localStorage y sobrevive a refresh, app funciona sin conexión, sesión offline se sincroniza al reconectar.

```bash
cd frontend && npm run test -- --testPathPattern=offline|pwa
```

---

## Pruebas manuales (UI + Browser)

### Requisitos previos
1. `npm run build && npm run preview` (servir build de producción, necesario para PWA)
2. Usuario autenticado con bloques y ciclo activo
3. Chrome DevTools abiertas (F12)

---

### 1. Verificar instalabilidad (PWA)
1. Abrir la app en Chrome en `http://localhost:4173` (o el puerto de preview)
2. En la barra de direcciones, debe aparecer un ícono de "Instalar" ( ⊕ o similar)
3. Hacer clic en "Instalar"
4. La app debe abrirse en modo standalone (sin barra de direcciones del navegador)
5. Cerrar y reabrir desde el ícono en el escritorio/inicio
6. Verificar que usa el nombre "Gymbro", tema oscuro, ícono propio

### 2. Verificar manifest
1. Abrir DevTools → Application → Manifest
2. Verificar campos:
   - `name`: "Gymbro"
   - `short_name`: "Gymbro"
   - `theme_color`: "#0f120f"
   - `background_color`: "#0f120f"
   - `display`: "standalone"
   - Iconos: 192x192 y 512x512

### 3. Verificar Service Worker
1. En DevTools → Application → Service Workers
2. Debe haber un Service Worker registrado y activo
3. Estado: "activated and is running"
4. En Cache Storage, debe haber entradas cacheadas (HTML, CSS, JS, fuentes)

### 4. Verificar funcionamiento offline (Modo Activo)
1. Entrar al Modo de Entrenamiento Activo (iniciar una rutina)
2. En DevTools → Network, activar "Offline"
3. Realizar el flujo de entrenamiento completo:
   - Completar series, registrar pesos y RPE
   - Usar cronómetro de descanso
   - Avanzar entre ejercicios
4. Verificar que TODO funciona normalmente sin internet
5. Llegar hasta la celebración y checklist
6. Completar el checklist de recuperación
7. Hacer clic en "Finalizar entrenamiento"

### 5. Verificar persistencia offline al finalizar
1. Estando aún offline (Network: Offline)
2. Finalizar el entrenamiento → debe aparecer indicador "Sesión guardada localmente. Se sincronizará al reconectar"
3. La sesión debe aparecer en el historial con un badge "Pendiente de sincronización"
4. Cerrar la pestaña del navegador completamente
5. Reabrir la app → la sesión debe seguir en el historial como pendiente

### 6. Verificar sincronización al reconectar
1. Estando con una sesión pendiente de sincronizar
2. En DevTools → Network, desactivar "Offline" (volver a Online)
3. Debe detectarse automáticamente la reconexión (evento `online`)
4. Debe aparecer un toast/notificación: "Sincronizando sesiones pendientes..."
5. Al completar: "Sesión sincronizada correctamente"
6. El badge "Pendiente de sincronización" debe desaparecer del historial
7. Recargar la página → la sesión debe seguir en el historial (ya sincronizada)

### 7. Verificar persistencia del estado (refresh en Modo Activo)
1. Entrar al Modo Activo y completar algunas series
2. Sin salir del Modo Activo, recargar la página (F5)
3. Verificar que el estado del entrenamiento se restaura:
   - El ejercicio actual sigue siendo el mismo
   - Las series ya completadas siguen marcadas
   - Los pesos/RPE registrados se conservan
   - El progreso (ejercicio X de Y) se mantiene

### 8. Verificar cacheo de assets
1. Estando offline
2. Recargar la página
3. La app debe cargar completamente (HTML, CSS, JS, fuentes desde cache)
4. Navegar entre tabs → todos deben funcionar
5. Las fuentes Montserrat y Roboto deben cargar (estaban cacheadas)

### 9. Verificar indicador offline/online
1. Activar modo offline en DevTools
2. Debe aparecer un indicador visual en la UI:
   - Badge, banner o ícono indicando "Sin conexión"
   - Color: amarillo o gris
3. Volver a online
4. El indicador debe cambiar a "Conectado" o desaparecer

### 10. Verificar en dispositivo real
1. Build de producción: `npm run build`
2. Servir con HTTPS (necesario para PWA): `npx serve dist` (o deploy a Vercel/Netlify)
3. Abrir en Chrome Android o Safari iOS
4. Debe aparecer prompt "Add to Home Screen"
5. Instalar y probar flujo completo offline

---

## Pruebas de endpoints (Postman)

### Simular sincronización de sesión offline
Cuando la app vuelve a estar online, envía las sesiones pendientes:
```
POST {{base_url}}/rest/v1/sessions
Body: {
  "cycle_id": "{{cycle_id}}",
  "block_id": "{{block_id}}",
  "user_id": "{{user_id}}",
  "fecha_completado": "2025-05-21T10:30:00Z",
  "was_offline": true
}
```

### Verificar sesión sincronizada
```
GET {{base_url}}/rest/v1/sessions?user_id=eq.{{user_id}}&order=fecha_completado.desc&limit=1
```
Debe devolver la sesión recién sincronizada (sin flag pendiente).

---

## Notas para testers
- Para probar PWA correctamente se necesita HTTPS (localhost con service worker funciona sin HTTPS en Chrome)
- El modo offline en DevTools solo simula desconexión de red, pero los service workers siguen funcionando
- Para pruebas completas de instalación PWA, hacer deploy a un entorno con HTTPS (Vercel, Netlify) o usar `ngrok` con localhost
