## PRD padre

`issues/prd.md`

## Tipo

AFK

## Que construir

Implementar la página de perfil con dos secciones: (a) métricas básicas y (b) historiales. La sección de métricas básicas muestra edad, sexo, altura, peso actual y calcula automáticamente IMC y TMB. La sección de historiales permite al usuario registrar peso semanalmente, medidas corporales con cinta quincenalmente (pecho, cintura, cadera, bíceps, muslo), y fotos de progreso mensualmente. Cada tipo de métrica muestra su historial cronológico. La recolección de métricas post-registro debe permitir skip por campo (si un dato no se tiene a mano, se omite y se completa después). Escribir tests que validen: (a) CRUD de peso con verificación de fecha y visualización de historial, (b) cálculo correcto de IMC y TMB, (c) registro de medidas con selección de tipo, (d) upload de foto con visualización en galería.

## Criterios de aceptacion

- [ ] Página de perfil accesible desde el tab "Perfil"
- [ ] Sección de métricas básicas: edad, sexo, altura, peso actual (con último registro)
- [ ] IMC calculado automáticamente: peso(kg) / altura(m)²
- [ ] TMB estimado automáticamente según fórmula de Mifflin-St Jeor (diferenciada por sexo)
- [ ] Registro de peso semanal: input numérico + selector de fecha, validación de frecuencia
- [ ] Historial de peso: tabla/lista cronológica con fechas y valores
- [ ] Registro de medidas corporales: selector de tipo (pecho, cintura, cadera, bíceps, muslo) + valor en cm + fecha
- [ ] Historial de medidas: filtrable por tipo, orden cronológico
- [ ] Upload de fotos de progreso: botón para seleccionar imagen + fecha
- [ ] Galería de fotos: thumbnails ordenados por fecha, visor al hacer clic
- [ ] Formulario post-registro: campos requeridos con opción de skip individual por campo
- [ ] Todos los datos protegidos por RLS (solo el usuario autenticado accede a sus métricas)
- [ ] `npm run test` pasa con tests de perfil y métricas

## Bloqueado por

- Bloqueado por `issues/002-database-schema-and-rls.md`
- Bloqueado por `issues/003-auth-google-oauth.md`

## Historias de usuario abordadas

- Historia de usuario 2
- Historia de usuario 8
- Historia de usuario 9
- Historia de usuario 10
- Historia de usuario 11
