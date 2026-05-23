## PRD padre

`issues/prd.md`

## Tipo

AFK

## Que construir

Implementar un browser del catálogo de ejercicios que muestre el catálogo global (semilla) y permita al usuario agregar ejercicios a su catálogo privado. El browser debe tener navegación por grupo muscular (Pecho, Espalda, Hombros, Bíceps/Antebrazos, Tríceps, Cuádriceps, Isquiosurales, Glúteos, Pantorrillas, Abdomen/Core, Cuerpo Completo). Al seleccionar un ejercicio, se muestran sus variaciones (ejercicios hijos con parent_id) en una vista de detalle. El usuario puede agregar ejercicios personalizados a su catálogo privado (nombre, grupo muscular, variación de un ejercicio existente opcional). Escribir tests que validen: (a) filtrado de ejercicios por grupo muscular, (b) visualización de jerarquía padre/hijo, (c) creación de ejercicio personalizado asociado al perfil del usuario, (d) el catálogo global es de solo lectura para usuarios regulares.

## Criterios de aceptacion

- [x] Página de catálogo accesible desde el tab "Rutinas"
- [x] Tabs o filtro por grupo muscular (11 grupos)
- [x] Lista de ejercicios filtrada con nombre y grupo muscular
- [x] Vista de detalle del ejercicio: muestra variaciones si existen
- [x] El catálogo global es de solo lectura (los usuarios no pueden modificar ejercicios globales)
- [x] Botón "Agregar ejercicio personalizado" que abre un modal/formulario
- [x] Formulario de ejercicio personalizado: nombre (requerido), grupo muscular (select), ejercicio base (select opcional del catálogo global para crear variante)
- [x] Ejercicios personalizados visibles en el browser junto a los del catálogo global (identificables visualmente con badge "Personalizado")
- [x] CRUD completo del catálogo privado (crear, editar, eliminar ejercicios propios)
- [x] `npm run test` pasa con tests de catálogo (23 tests)

## Bloqueado por

- Bloqueado por `issues/002-database-schema-and-rls.md`
- Bloqueado por `issues/003-auth-google-oauth.md`

## Historias de usuario abordadas

- Historia de usuario 6
- Historia de usuario 7

## QA - Pruebas manuales

### Navegación UI

1. Abrir la app y hacer clic en el tab "Rutinas"
2. Verificar que aparece el título "Rutinas" y subtítulo "Catálogo de ejercicios"
3. Verificar que hay un campo de búsqueda y tabs de grupo muscular (Todos + 11 grupos)

### Filtrado y búsqueda

1. Hacer clic en "Pecho" — solo deben aparecer ejercicios de pecho
2. Hacer clic en "Todos" — deben aparecer todos los ejercicios (~97)
3. Escribir "Press de Banca" en el buscador — solo debe mostrar ejercicios que coincidan

### Vista de detalle

1. Hacer clic en "Press de Banca Plano"
2. Verificar que aparece modal con: nombre, grupo muscular, equipo, variaciones
3. Verificar que el ejercicio global muestra "Este ejercicio es de solo lectura"
4. Cerrar el modal con la "x"

### Ejercicios personalizados

1. Hacer clic en "+ Agregar ejercicio personalizado"
2. Rellenar nombre (requerido), grupo muscular, equipo
3. Opcionalmente seleccionar un ejercicio base del catálogo global
4. Guardar — verificar que aparece en la lista con badge "Personalizado"
5. Abrir el ejercicio personalizado y hacer clic en "Eliminar"
6. Verificar que desaparece de la lista

### Tests automáticos

```bash
cd frontend && npm run test   # 23 tests pasan
```

### Build

```bash
cd frontend && npm run build   # debe completar sin errores
```
