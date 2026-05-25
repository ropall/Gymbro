# PRD: Gymbro — App de Entrenamiento y Recuperación

## Enunciado del problema

Un deportista que entrena en Fitness24Seven de madrugada (3-7 AM) necesita transformar su seguimiento manual de entrenamientos en una aplicación web dinámica. Actualmente usa una plantilla HTML estática que no permite registrar pesos por serie, cronometrar descansos, trackear métricas corporales con historial ni confirmar suplementos post-entreno. Requiere una herramienta que funcione impecablemente en móvil durante las sesiones de gimnasio y en PC para planificar rutinas, sin necesidad de conexión a internet durante el entrenamiento activo.

## Solución

Gymbro es una aplicación web full-stack (React + Vite + Supabase) con soporte PWA para funcionamiento offline en el Modo de Entrenamiento Activo. La app permite a cualquier usuario registrarse con Google, definir sus métricas corporales con historial, crear y gestionar bloques de entrenamiento mediante un wizard guiado con sugerencias inteligentes basadas en un catálogo global de ~100 ejercicios, ejecutar rutinas en un modo inmersivo con registro de peso/RPE por serie y cronómetro de descanso flexible, completar un checklist de recuperación post-entreno, y consultar una sección de nutrición editable como referencia. El ciclo de entrenamiento es de 7 días secuenciales (5 bloques + 2 descansos) con avance manual en días de descanso y pausa de revisión entre ciclos.

## Historias de usuario

1. Como usuario nuevo, quiero registrarme con mi cuenta de Google, para acceder a la app sin crear otra contraseña.
2. Como usuario nuevo, quiero que tras el registro se me soliciten mis métricas básicas (edad, sexo, altura, peso), con opción de omitir las que no tenga a mano, para completar mi perfil sin fricción.
3. Como usuario nuevo, quiero ver un dashboard con un CTA prominente para crear mi primera rutina, para entender cuál es el primer paso a seguir.
4. Como usuario nuevo, quiero un wizard que me guíe paso a paso para armar mi plan de entrenamiento semanal, definiendo cuántos días entreno y cuántos descanso, para no empezar con un lienzo vacío.
5. Como usuario armando mi rutina, quiero que el wizard me pregunte por el grupo muscular objetivo de cada día y me sugiera ejercicios del catálogo, para no tener que buscar entre 100 ejercicios manualmente.
6. Como usuario, quiero poder agregar ejercicios personalizados a mi catálogo privado, para registrar movimientos que no están en el catálogo global.
7. Como usuario, quiero que cada ejercicio del catálogo muestre sus variaciones (ej. Press Banca → Agarre cerrado, Agarre ancho), para elegir la que mejor se adapte a mi plan.
8. Como usuario, quiero ver mi perfil con todas mis métricas corporales (peso, medidas, fotos) actualizables, para trackear mi progreso físico.
9. Como usuario, quiero registrar mi peso semanalmente y ver un historial cronológico, para monitorear tendencias de ganancia muscular.
10. Como usuario, quiero registrar medidas corporales con cinta quincenalmente (pecho, cintura, cadera, bíceps, muslo) y ver su historial, para evaluar cambios de composición corporal.
11. Como usuario, quiero subir fotos de progreso mensualmente y verlas ordenadas por fecha, para comparar visualmente mi evolución.
12. Como usuario, quiero ver mis bloques de entrenamiento en una vista de gestión, para revisar qué ejercicios tengo asignados a cada día.
13. Como usuario, quiero editar bloques de entrenamiento que aún no han ocurrido en el ciclo actual, para ajustar mi plan sobre la marcha.
14. Como usuario, quiero que al finalizar el ciclo de 7 días la app me muestre un resumen de lo completado y me permita editar mis bloques antes de repetir el ciclo, para mejorar continuamente mi programación.
15. Como usuario, quiero hacer clic en "Empezar Rutina" desde el dashboard y ser redirigido a una pantalla de enfoque exclusiva, para concentrarme solo en el entrenamiento del día.
16. Como usuario en el Modo de Entrenamiento Activo, quiero ver únicamente los ejercicios del bloque actual con sus series y repeticiones objetivo, para no distraerme con información irrelevante.
17. Como usuario ejecutando una serie, quiero que al finalizar se habilite un campo para registrar el peso levantado, para llevar registro preciso de mi rendimiento.
18. Como usuario ejecutando una serie, quiero poder registrar el RPE real que sentí (esfuerzo percibido), para comparar con el RPE objetivo de la plantilla.
19. Como usuario tras registrar una serie, quiero iniciar manualmente un cronómetro de descanso con el tiempo sugerido para ese ejercicio, para respetar mis tiempos de recuperación.
20. Como usuario durante el descanso, quiero que si intento registrar la siguiente serie antes de tiempo la app me advierta pero me permita continuar, para tener flexibilidad cuando el gimnasio está lleno.
21. Como usuario completando un ejercicio, quiero que la app marque automáticamente el ejercicio como completado y muestre el siguiente, para mantener un flujo secuencial sin interrupciones.
22. Como usuario finalizando mi entrenamiento, quiero ver una pantalla de celebración con un mensaje motivacional, para sentirme reconocido por culminar un día más.
23. Como usuario post-entreno, quiero que se me solicite obligatoriamente registrar mi nivel de energía, para evaluar el impacto de las sesiones de madrugada.
24. Como usuario post-entreno, quiero confirmar opcionalmente qué suplementos tomé (creatina, proteína, glicinato de magnesio), para llevar trazabilidad de mi suplementación.
25. Como usuario, quiero ver el historial de mis sesiones completadas, para revisar cargas anteriores y planificar sobrecarga progresiva.
26. Como usuario, quiero consultar la sección de nutrición con menús de referencia y macros, para tener una base de comidas con las que cumplir mis requerimientos calóricos.
27. Como usuario, quiero poder editar los menús de nutrición (agregar, modificar o eliminar comidas), para adaptar las referencias a mis necesidades cambiantes.
28. Como usuario en el gimnasio, quiero que la app funcione sin internet durante el Modo de Entrenamiento Activo, para no depender de la señal del gimnasio.
29. Como usuario en el gimnasio, quiero que la pantalla de entrenamiento activo esté optimizada para móvil (mobile-first), para usarla cómodamente con una mano.
30. Como usuario, quiero que la app tenga navegación por tabs inferiores en móvil (Inicio, Rutinas, Historial, Nutrición, Perfil), para acceder rápido a cada sección.

## Decisiones de implementación

### Stack tecnológico

- Frontend: React 18+ con Vite
- Estilos: Tailwind CSS v4 mediante plugin de Vite
- Estado: Zustand con middleware de persistencia para localStorage
- Backend y base de datos: Supabase (PostgreSQL, Row Level Security)
- Autenticación: Supabase Auth con Google OAuth como único proveedor, verificación obligatoria de email
- PWA: vite-plugin-pwa para Service Worker y funcionamiento offline

### Modelo de datos

- **Perfil de usuario**: tabla separada con métricas corporales (edad, sexo, altura) e histórico de peso (semanal), medidas corporales (quincenal) y fotos (mensual). Totalmente aislado de la gestión de rutinas.
- **Fotos de progreso (Supabase Storage)**: Las imágenes se almacenan en un bucket de Supabase Storage (`progress-photos`). La tabla de fotos en PostgreSQL guarda únicamente la URL pública del archivo, un thumbnail (si aplica), la fecha y metadatos. No se almacenan datos binarios ni base64 en la base de datos para evitar consumo excesivo de espacio y degradación de rendimiento en consultas.
- **Catálogo de ejercicios**: tabla global con la semilla de ~100 ejercicios organizados por grupo muscular y jerarquía padre/hijo para variaciones. Cada usuario tiene su catálogo privado adicional.
- **Bloques de entrenamiento**: plantillas que definen ejercicios con series y repeticiones objetivo. Un ciclo consta de 7 posiciones (5 bloques + 2 descansos).
- **Sesiones de entrenamiento**: snapshots inmutables generados al completar un bloque. Cada sesión contiene ejercicios ejecutados con registros por serie (peso, repeticiones reales, RPE real).
- **Recovery**: checklist post-sesión con nivel de energía (obligatorio) y suplementos tomados (opcional).
- **Nutrición**: estructura de menús editables por usuario (referencia, sin tracking de consumo).

### Ciclo de entrenamiento

- Ciclo secuencial de 7 posiciones (posición 1-7), no atado a días calendario.
- El usuario avanza manualmente en días de descanso.
- Al completar el día 7, pausa con resumen del ciclo y opción de editar bloques antes de reiniciar.
- Solo se pueden editar bloques de posiciones futuras durante el ciclo activo.
- Las sesiones completadas son snapshots inmutables (Opción C del grill).

### Modo de Entrenamiento Activo

- Pantalla fullscreen sin tabs, mobile-first, diseñada para uso con una mano.
- Flujo secuencial: ejercicio actual → series → peso + RPE por serie → cronómetro → siguiente serie → siguiente ejercicio.
- Cronómetro de descanso manual con tiempo sugerido por ejercicio. Si el usuario intenta registrar antes de finalizar, advertencia no bloqueante.
- Al completar todas las series de un ejercicio, transición automática al siguiente.
- Al completar todos los ejercicios, pantalla de celebración.

### Offline (PWA)

- Al entrar al Modo de Entrenamiento Activo, el bloque completo se carga en localStorage.
- Durante el entrenamiento no se requiere internet.
- Al finalizar (celebración + checklist), se sincroniza con Supabase. Si no hay conexión, se guarda localmente y sincroniza al reconectar.

### Autenticación

- Google OAuth vía Supabase Auth.
- Verificación de email obligatoria.
- Cada usuario tiene datos aislados mediante Row Level Security en Supabase.

### Onboarding

- Post-registro, el usuario llega al dashboard con un CTA "Crear mi primera rutina".
- Wizard paso a paso: define estructura semanal (días de entrenamiento vs descanso en un marco de 7) → asigna grupo muscular a cada día → recibe sugerencias de ejercicios del catálogo → confirma, agrega o personaliza.
- Recolección de métricas básicas post-registro con opción de skip por campo.

### Navegación

- Layout con tabs inferiores (mobile-first): Inicio, Rutinas, Historial, Nutrición, Perfil.
- Modo de Entrenamiento Activo es una pantalla aparte sin tabs.

### Catálogo semilla

- ~100 ejercicios extraídos de `plantilla-estatica/semilla.txt` organizados en: Pecho, Espalda, Hombros, Bíceps/Antebrazos, Tríceps, Cuádriceps, Isquiotibiales, Glúteos, Pantorrillas, Abdomen/Core, Cuerpo Completo/Halterofilia.
- Cada ejercicio puede tener ejercicios hijos (variaciones).
- El catálogo global es de solo lectura para usuarios regulares.
- Cada usuario puede agregar ejercicios a su catálogo privado.

### Nutrición

- Sección informativa con estructura de menús diarios y desglose de macros.
- Contenido editable por el usuario (CRUD de comidas y menús).
- Sin tracking de consumo diario (fuera de alcance para MVP).

### Módulos principales

1. **Auth Module**: manejo de sesión con Supabase, login/logout con Google, verificación de email.
2. **Profile Module**: CRUD de métricas corporales con historiales por tipo (peso, medidas, fotos), cálculos de IMC/TMB.
3. **Exercise Catalog Module**: consulta del catálogo global, CRUD del catálogo privado del usuario, jerarquía padre/hijo, búsqueda por grupo muscular y equipo.
4. **Routine/Block Module**: creación y edición de bloques de entrenamiento, gestión del ciclo de 7 días (avance, pausa, reinicio), snapshot de sesiones completadas.
5. **Active Workout Module**: flujo secuencial de ejercicios, registro por serie (peso + RPE real), cronómetro de descanso flexible, persistencia offline.
6. **Recovery Module**: checklist post-entreno (energía obligatoria, suplementos opcionales), vinculación con sesión completada.
7. **Session History Module**: consulta de sesiones pasadas, visualización de pesos y RPE históricos por ejercicio.
8. **Nutrition Module**: CRUD de menús y comidas de referencia, visualización de macros.
9. **Onboarding/Wizard Module**: flujo guiado post-registro para crear la primera rutina.

## Decisiones de testing

- Se probará el comportamiento externo de todos los módulos, no sus detalles de implementación.
- Módulos cubiertos por tests: Auth, Profile, Exercise Catalog, Routine/Block, Active Workout, Recovery, Session History, Nutrition, Onboarding/Wizard.
- Para integraciones con Supabase se usarán mocks en tests unitarios y de integración local.
- Cada issue de implementación debe incluir al menos un test de integración que valide el flujo principal del módulo correspondiente.

## Fuera de alcance

- Tracking de consumo diario de alimentos (la sección de nutrición es solo referencia editable).
- Funciones sociales (perfiles públicos, compartir rutinas, leaderboards).
- Aplicación nativa (iOS/Android) — el alcance es PWA web.
- Sincronización offline completa con cola de reintentos y resolución de conflictos — solo se implementa el híbrido pragmático (carga al inicio, guarda al final).
- Exportación de datos (CSV, PDF).
- Recordatorios o notificaciones push.
- Integración con wearables o apps de salud (Apple Health, Google Fit).
- Roles de administrador para gestionar el catálogo global — la semilla se carga una vez como migración inicial.

## Notas adicionales

- La plantilla estática en `plantilla-estatica/index.html` contiene el diseño visual de referencia (paleta de colores brand, tipografía Montserrat/Roboto, estructura de tarjetas) y debe usarse como guía de estilos pero no como base de código.
- El archivo `plantilla-estatica/semilla.txt` contiene el catálogo semilla completo de ejercicios con jerarquía padre/hijo y agrupación muscular, listo para ser migrado a la base de datos.
- El presupuesto de 400,000 COP/mes mencionado en la plantilla es un dato de referencia personal del PO y debe ser editable en la sección de nutrición.
- Los tiempos de descanso por ejercicio varían entre 60 segundos y 3 minutos según la plantilla. Estos tiempos deben ser configurables por bloque/ejercicio.
