## PRD padre

`issues/prd.md`

## Tipo

AFK

## Que construir

Implementar la página de perfil con dos secciones: (a) métricas básicas y (b) historiales. La sección de métricas básicas muestra edad, sexo, altura, peso actual y calcula automáticamente IMC y TMB. La sección de historiales permite al usuario registrar peso semanalmente, medidas corporales con cinta quincenalmente (pecho, cintura, cadera, bíceps, muslo), y fotos de progreso mensualmente. Cada tipo de métrica muestra su historial cronológico. La recolección de métricas post-registro debe permitir skip por campo (si un dato no se tiene a mano, se omite y se completa después). Escribir tests que validen: (a) CRUD de peso con verificación de fecha y visualización de historial, (b) cálculo correcto de IMC y TMB, (c) registro de medidas con selección de tipo, (d) upload de foto con visualización en galería.

### Almacenamiento de fotos (Supabase Storage)

Las fotos de progreso **no se guardan como datos binarios ni base64 en PostgreSQL**. En su lugar:
- Se crea un bucket `progress-photos` en Supabase Storage.
- Al subir una foto, el archivo se almacena en el bucket bajo la ruta `{user_id}/{filename}`.
- La tabla `profile_photos` en PostgreSQL guarda únicamente: id, user_id, fecha, URL pública del archivo (o path del bucket + el storage key), thumbnail opcional y timestamps.
- Para mostrar la galería se renderizan las imágenes usando sus URLs públicas firmadas (o públicas dependiendo de la política de acceso definida).
- Para eliminar una foto se borra tanto el archivo del bucket como la fila en la tabla.
- Los mocks en tests deben simular el cliente de Supabase Storage (`supabase.storage`).

## Criterios de aceptacion

- [x] Página de perfil accesible desde el tab "Perfil"
- [x] Sección de métricas básicas: edad, sexo, altura, peso actual (con último registro)
- [x] IMC calculado automáticamente: peso(kg) / altura(m)²
- [x] TMB estimado automáticamente según fórmula de Mifflin-St Jeor (diferenciada por sexo)
- [x] Registro de peso semanal: input numérico + selector de fecha, validación de frecuencia
- [x] Historial de peso: tabla/lista cronológica con fechas y valores
- [x] Registro de medidas corporales: selector de tipo (pecho, cintura, cadera, bíceps, muslo) + valor en cm + fecha
- [x] Historial de medidas: filtrable por tipo, orden cronológico
- [x] Upload de fotos de progreso: botón para seleccionar imagen + fecha
- [x] Galería de fotos: thumbnails ordenados por fecha, visor al hacer clic
- [x] Formulario post-registro: campos requeridos con opción de skip individual por campo
- [ ] Todos los datos protegidos por RLS (solo el usuario autenticado accede a sus métricas) — **PENDIENTE: requiere migraciones de BD (issue 002, HITL)**
- [x] `npm run test` pasa con tests de perfil y métricas

## Bloqueado por

- Bloqueado por `issues/002-database-schema-and-rls.md`
- Bloqueado por `issues/003-auth-google-oauth.md`

## Historias de usuario abordadas

- Historia de usuario 2
- Historia de usuario 8
- Historia de usuario 9
- Historia de usuario 10
- Historia de usuario 11

## QA - Pruebas manuales

### Navegación UI

1. Abrir la app y hacer clic en el tab "Perfil"
2. Si es la primera vez, aparece el modal "Completa tu perfil"
3. Rellenar Sexo, Altura, Fecha de nacimiento y/o Peso (pueden omitirse individualmente)
4. Hacer clic en "Guardar perfil" — el modal desaparece

### Métricas básicas

1. Verificar que la tarjeta "Métricas básicas" muestra: Sexo, Edad, Altura, Peso actual
2. Verificar que IMC se calcula automáticamente cuando hay peso y altura
3. Verificar que TMB (Mifflin-St Jeor) se calcula automáticamente
4. Editar peso o perfil y confirmar que IMC/TMB se actualizan

### Historial de peso

1. En "Historial de peso", ingresar un peso (ej. 80) y fecha, clic en "Registrar peso"
2. Verificar que aparece en la lista con formato dd/mm/aaaa
3. Intentar registrar otro peso en la misma semana — debe mostrar error
4. Registrar un peso en otra semana — debe aceptarse
5. Clic en "Eliminar" — debe desaparecer de la lista

### Medidas corporales

1. En "Medidas corporales", seleccionar tipo (ej. Pecho), valor (42 cm), fecha, clic en "Registrar medida"
2. Verificar que aparece en la lista
3. Usar los botones de filtro (Todos, Pecho, Cintura, etc.) para mostrar solo un tipo
4. Clic en "Eliminar" — debe desaparecer

### Fotos de progreso

1. En "Fotos de progreso", seleccionar una fecha y clic en "Subir foto"
2. Seleccionar una imagen del dispositivo
3. Verificar que aparece como thumbnail en la galería
4. Clic en el thumbnail — debe abrir visor a pantalla completa
5. Clic en la "x" roja del thumbnail — debe desaparecer

### Tests automáticos

```bash
cd frontend && npm run test   # 15 tests pasan
```

### Build

```bash
cd frontend && npm run build   # debe completar sin errores
```
