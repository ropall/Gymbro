### Datos personales y de Identificacion
    Nombre / Alias: para personalizar la interfaz
    Correo Electronico: Para gestion de cuenta y recuperacion.
    Foto de perfil: Opcional, ayudara a dar una sensacion de pertenencia.
    Fecha de nacimineto: Vital para calculos metabolicos automaticos(edad).

### Perfil Metabolico y Biométrico
Estos son los datos que usaras para calcular los requerimientos nutricionales (macros) y que el usuario pueda ajustar la intensidad de las rutinas
    Sexo Biologico: Factor determinante en el calculo metabolico basal (MTB)
    Peso Inicial y Peso Objetivo: para calcular el déficit o superávit Calorico
    Estatura: Necesaria para el calculo de indice de maca sorporal (IMC) y TMB
    Nivel de Actividad Diaria:(Sedentario, ligero, moderado, intenso).
    Tipo de Somatotipo: con una breve descripcion de que es cada uno (ectomorfo, mesomorfo, o endomorfo) ayuda a ajustar la distribucion de macros inicial.

### Perfil de Ritmo Cardiaco y Preferencias
Dado que mencionaste esto como un pilar fundamental en tu HTML, es vital almacenarlo:
 Cronotipo: ¿Eres "alondra" (mañanero) o "búho" (nocturno)? Esto ayuda a la app a sugerirte horarios ideales para entrenar o comer.
 Horario de sueño: Hora de acostarse y levantarse.
 Nivel de energía esperado: Un selector numérico (1-10) que estableces como tu "estándar" para luego compararlo con tu registro diario.

### Objetivos y Nivel de Entrenamiento
Esto permitirá que la app sea inteligente y no sugiera rutinas que no pueda (o deba) realizar.
 Objetivo Principal: (Hipertrofia, Pérdida de grasa, Fuerza máxima, Resistencia).
 Nivel de Experiencia: (Principiante, Intermedio, Avanzado). Esto dicta el volumen semanal.
 Split Preferido: (PPL, Upper/Lower, Fullbody).
 Días disponibles para entrenar: (ej. Lunes a Viernes).

 ### Flujo de Onboarding: "Tu Camino a Élite"
El objetivo es dividir la configuración en 3 pasos breves que se sientan como una conversación, no como un trámite burocrático.
Paso 1: Identidad Básica (La bienvenida)
 Pantalla: "¡Bienvenido, Gymbro! Vamos a configurar tu perfil."
 Acción: Nombre/Alias y Fecha de Nacimiento (para calcular edad y TMB).
 Input: Foto de perfil opcional (da sensación de pertenencia inmediata).
 CTA (Botón): "Continuar"
Paso 2: Realidad Biológica (El "Cerebro" de la app)
 Pantalla: "¿Cuáles son tus datos actuales?"
 Inputs:
 Estatura y Peso actual.
 Sexo Biológico (clave para el cálculo del metabolismo basal).
 Nivel de Actividad Diaria (Selector: Sedentario, Ligero, Moderado, Intenso).
 Nota de Valor: "Estos datos nos ayudan a calcular tus necesidades calóricas exactas".
 CTA: "Siguiente"
Paso 3: Estilo de Vida y Objetivos (Personalización)
 Pantalla: "Personalicemos tu experiencia"
 Inputs:
 Objetivo Principal (Hipertrofia, Pérdida de grasa, etc.).
 Cronotipo (Selector rápido: ¿Eres más activo por la mañana o noche?).
 Split preferido (PPL, Upper/Lower, Fullbody).
 CTA: "¡Empezar a entrenar!"
💡 Estrategia para el Éxito (User Experience)
Para evitar que el usuario se aburra o se sienta abrumado, aplica estas tres reglas de oro en la programación del flujo:
1 Valores por Defecto: En los campos de "Estatura" o "Actividad", sugiere un valor promedio. Así, si el usuario no sabe qué poner, puede avanzar con un clic.
2 Progreso Visual: Usa una pequeña barra de progreso en la parte superior (1/3, 2/3, 3/3). Saber que son solo 3 pasos psicológicamente reduce la ansiedad de terminarlo rápido.
3 Diferimiento de Datos Secundarios: No le pidas el "Horario de sueño" o el "Somatotipo" en el Onboarding. Eso déjalo para la configuración avanzada dentro del perfil una vez que ya esté usando la app.