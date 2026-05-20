# Requerimiento de Producto: App de Entrenamiento y Recuperación

**De:** RopallDev (Product Owner)
**Para:** Equipo de Desarrollo (IA)
**Contexto:** Migración de frontend estático a aplicación Full-Stack responsiva

Hola equipo,

Actualmente, el seguimiento de nuestros entrenamientos se hace de manera manual. Queremos transformar una plantilla web estática existente en una **aplicación web dinámica** que nos permita no solo planificar las rutinas, sino que actúe como un asistente en tiempo real durante cada sesión de gimnasio.

Necesitamos implementar las siguientes funcionalidades principales:

* **Separación de Entidades:** Los datos del perfil del usuario (métricas corporales, preferencias) deben estar estrictamente separados a nivel de base de datos y UI de la gestión de rutinas y ejercicios.
* **Gestión de Rutinas:** Capacidad de crear bloques de entrenamiento con el catálogo de ejercicios, definiendo series y repeticiones objetivo.
* **Modo de Entrenamiento Activo (Core Feature):**
    * Un botón de **"Empezar Rutina"** que redirija a una pantalla de enfoque exclusiva para ese día.
    * Esta pantalla debe mostrar únicamente los ejercicios correspondientes al día actual, con sus respectivas series y repeticiones.
    * Al terminar cada serie, debe habilitarse un campo (input) para registrar el **peso levantado** (en los ejercicios que lo requieran).
    * **Cronómetro de descanso:** Tras registrar una serie, el usuario debe poder iniciar manualmente un temporizador con el tiempo de recuperación sugerido antes de la siguiente serie.
    * **Flujo secuencial:** Al completar todas las series de un ejercicio, la interfaz debe indicar y pasar automáticamente al siguiente ejercicio de la rutina.
    * **Cierre de sesión:** Al finalizar toda la rutina, la app debe mostrar una pantalla de celebración con un mensaje motivacional dando felicitaciones por culminar un día más de entrenamiento.
* **Módulo de Recuperación (Post-entrenamiento):** Un checklist rápido al finalizar para registrar los niveles de energía (clave para evaluar el rendimiento en sesiones de madrugada) y confirmar la toma de suplementos (creatina, proteína, glicinato de magnesio).

**Restricciones y Reglas de Negocio:**
* **Diseño 100% Responsivo:** La aplicación debe funcionar de manera impecable tanto en dispositivos móviles (para su uso en el gimnasio) como en PC (para la planificación en casa). Priorizar enfoque Mobile-First en la UI del Modo de Entrenamiento Activo.
* **Cero funciones sociales:** La información es estrictamente personal. No habrá perfiles públicos.
* **Stack Tecnológico:**
    * Interfaz y estado dinámico: **React y Vite**.
    * Backend, Autenticación y Base de Datos Relacional: **Supabase**.
    * *Nota para el agente:* La estructura base de la interfaz y los estilos actuales se encuentran en el archivo `./plantilla-estatica/index.html`. Por favor, revisa ese archivo para extraer y modularizar los componentes.

Por favor, analicen estos requerimientos para empezar a desglosar las tareas y generar el PRD o los issues correspondientes.
