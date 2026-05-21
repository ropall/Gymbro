## PRD padre

`issues/prd.md`

## Tipo

AFK

## Que construir

Implementar un browser del catálogo de ejercicios que muestre el catálogo global (semilla) y permita al usuario agregar ejercicios a su catálogo privado. El browser debe tener navegación por grupo muscular (Pecho, Espalda, Hombros, Bíceps/Antebrazos, Tríceps, Cuádriceps, Isquiosurales, Glúteos, Pantorrillas, Abdomen/Core, Cuerpo Completo). Al seleccionar un ejercicio, se muestran sus variaciones (ejercicios hijos con parent_id) en una vista de detalle. El usuario puede agregar ejercicios personalizados a su catálogo privado (nombre, grupo muscular, variación de un ejercicio existente opcional). Escribir tests que validen: (a) filtrado de ejercicios por grupo muscular, (b) visualización de jerarquía padre/hijo, (c) creación de ejercicio personalizado asociado al perfil del usuario, (d) el catálogo global es de solo lectura para usuarios regulares.

## Criterios de aceptacion

- [ ] Página de catálogo accesible desde el tab "Rutinas" o como sub-página
- [ ] Tabs o filtro por grupo muscular (11 grupos)
- [ ] Lista de ejercicios filtrada con nombre y grupo muscular
- [ ] Vista de detalle del ejercicio: muestra variaciones (hijos) si existen
- [ ] El catálogo global es de solo lectura (los usuarios no pueden modificar ejercicios globales)
- [ ] Botón "Agregar ejercicio personalizado" que abre un modal/formulario
- [ ] Formulario de ejercicio personalizado: nombre (requerido), grupo muscular (select), ejercicio base (select opcional del catálogo global para crear variante)
- [ ] Ejercicios personalizados visibles en el browser junto a los del catálogo global (identificables visualmente)
- [ ] CRUD completo del catálogo privado (crear, editar, eliminar ejercicios propios)
- [ ] `npm run test` pasa con tests de catálogo

## Bloqueado por

- Bloqueado por `issues/002-database-schema-and-rls.md`
- Bloqueado por `issues/003-auth-google-oauth.md`

## Historias de usuario abordadas

- Historia de usuario 6
- Historia de usuario 7
