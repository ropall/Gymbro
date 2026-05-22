# Pruebas Manuales - Issue 004: Profile & Metrics

## Resumen
Página de perfil con métricas corporales (IMC, TMB), historial de peso semanal, medidas corporales quincenales, y fotos de progreso con Supabase Storage.

## Pruebas automáticas existentes
Tests validan: CRUD de peso con historial, cálculo IMC/TMB, registro de medidas por tipo, upload de foto con galería.

```bash
cd frontend && npm run test -- --testPathPattern=profile
```

---

## Pruebas manuales (UI)

### Requisitos previos
1. Usuario autenticado (Google OAuth)
2. Datos de perfil poblados
3. `npm run dev`

### 1. Ver métricas básicas
1. Navegar al tab "Perfil"
2. Verificar que muestra:
   - Edad (calculada desde `fecha_nacimiento`)
   - Sexo
   - Altura (cm)
   - Peso actual (último registro)
   - IMC calculado: peso / (altura/100)²
   - TMB calculado: Mifflin-St Jeor (diferente para hombres/mujeres)

### 2. Registrar peso semanal
1. En la sección de historial de peso, hacer clic en "Registrar peso"
2. Ingresar un peso (ej. 70.5 kg)
3. Seleccionar fecha
4. Guardar
5. Verificar que el peso aparece en la tabla/lista de historial
6. Verificar que el "Peso actual" en métricas básicas se actualiza al último registro
7. Verificar que IMC se recalcula automáticamente

### 3. Registrar medidas corporales
1. Hacer clic en "Registrar medida"
2. Seleccionar tipo: pecho, cintura, cadera, bíceps, muslo
3. Ingresar valor en cm (ej. 95)
4. Seleccionar fecha
5. Guardar
6. Repetir para cada tipo de medida
7. Verificar que cada tipo muestra su propio historial cronológico
8. Verificar que se puede filtrar por tipo de medida

### 4. Subir fotos de progreso
1. Hacer clic en "Subir foto" o botón de cámara/imagen
2. Seleccionar un archivo de imagen (JPG/PNG)
3. Asignar fecha a la foto
4. Guardar
5. Verificar que la foto aparece en la galería como thumbnail
6. Hacer clic en un thumbnail → debe abrirse un visor con la imagen completa
7. Verificar que las fotos están ordenadas por fecha (más reciente primero)

### 5. Eliminar foto
1. En la galería, hacer clic en el botón de eliminar en una foto
2. Confirmar eliminación
3. Verificar que la foto desaparece de la galería

### 6. Formulario post-registro (skip permitido)
1. Crear un usuario nuevo (primer login)
2. Debe aparecer un formulario para completar métricas
3. Intentar hacer skip en algunos campos (omitir sin llenar)
4. Verificar que se puede avanzar sin completar todos los campos
5. Completar el resto más tarde desde el Perfil

---

## Pruebas de endpoints (Postman)

### Obtener perfil
```
GET {{base_url}}/rest/v1/profiles?id=eq.{{user_id}}&select=*
Header: Authorization: Bearer {{access_token}}
```

### Actualizar perfil
```
PATCH {{base_url}}/rest/v1/profiles?id=eq.{{user_id}}
Body: { "altura": 173, "sexo": "masculino", "fecha_nacimiento": "1994-05-15" }
```

### Insertar peso
```
POST {{base_url}}/rest/v1/weight_history
Body: { "user_id": "{{user_id}}", "peso": 70.5, "fecha": "2025-05-20" }
```

### Obtener historial de peso
```
GET {{base_url}}/rest/v1/weight_history?user_id=eq.{{user_id}}&order=fecha.desc
```

### Subir foto a Storage (bucket: progress-photos)
1. Crear bucket `progress-photos` en Supabase Dashboard (público o con políticas)
2. Subir archivo:
```
POST {{base_url}}/storage/v1/object/progress-photos/{{user_id}}/foto1.jpg
Body: form-data con el archivo binario
Header: Authorization: Bearer {{access_token}}
```
3. Obtener URL pública:
```
GET {{base_url}}/storage/v1/object/public/progress-photos/{{user_id}}/foto1.jpg
```
