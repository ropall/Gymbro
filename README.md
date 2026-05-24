# Gymbro

App de entrenamiento y nutrición personal — planifica rutinas, registra cada serie en tiempo real y lleva el control de tu alimentación. Funciona como PWA instalable en el teléfono para usarla en el gimnasio sin conexión.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS v4 |
| Estado | Zustand (con persistencia en localStorage) |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| PWA | vite-plugin-pwa (Service Worker + Manifest) |
| Tests | Vitest + Testing Library |

## Estructura del proyecto

```
.
├── frontend/             # App React + Vite
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas (rutas)
│   │   ├── stores/       # Stores Zustand
│   │   ├── test/         # Tests
│   │   └── utils/        # Hooks y utilidades
│   └── public/           # Assets estáticos + iconos PWA
├── backend/supabase/     # Migraciones y seeds de Supabase
├── plantilla-estatica/   # Referencia visual de diseño
├── issues/               # Issues activas y PRD
└── issues/done/          # Issues completadas
```

## Requisitos

- **Node.js** >= 18
- **npm** >= 9
- Una cuenta de **Supabase** (gratuita)
- **Git**

## Configuración local

### 1. Clonar el repo

```bash
git clone https://github.com/ropall/Gymbro.git
cd Gymbro
```

### 2. Configurar Supabase

Crea un proyecto en [supabase.com](https://supabase.com). Luego ejecuta las migraciones desde el SQL Editor de Supabase o con la CLI:

```bash
# Opción A: Copia y pega cada archivo .sql de backend/supabase/migrations/
# en el SQL Editor de Supabase en orden (001, 002, 003...)

# Opción B: Con Supabase CLI local
cd backend
supabase link --project-ref <tu-project-ref>
supabase db push
```

Las migraciones crean las tablas (`profiles`, `blocks`, `cycles`, `nutrition_menus`, `nutrition_meals`, etc.) y configuran Row Level Security para que cada usuario solo vea sus datos.

### 3. Configurar variables de entorno

```bash
cp .env.example frontend/.env
```

Edita `frontend/.env` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Ambos valores están en Supabase Dashboard → Settings → API.

### 4. Configurar Google OAuth

En Supabase Dashboard → Authentication → Providers → Google:
1. Habilita Google como provider
2. Configura el Client ID y Client Secret de Google Cloud Console
3. Añade `https://<tu-proyecto>.supabase.co/auth/v1/callback` como redirect URI en Google Cloud Console

### 5. Instalar dependencias y ejecutar

```bash
cd frontend
npm install
npm run dev        # Dev server en http://localhost:5173
```

### 6. Ejecutar tests

```bash
npm run test       # Tests unitarios y de integración
npm run typecheck  # Verificación de tipos TypeScript
```

## Funcionalidades

### Perfil y métricas
- Registro de sexo, altura y fecha de nacimiento
- Historial de peso con detección de duplicados por semana
- Medidas corporales (pecho, cintura, cadera, bíceps, muslo)
- Cálculo automático de IMC y TMB
- Galería de fotos de progreso

### Rutinas y ciclos
- Catálogo de ~100 ejercicios organizados por grupo muscular
- Creación de bloques de entrenamiento personalizados
- Ciclos de 7 días con avance automático
- Días de descanso configurables

### Modo de entrenamiento activo
- Interfaz optimizada para el gimnasio (mobile-first)
- Registro de peso y RPE por serie
- Cronómetro de descanso entre series
- Avance automático al siguiente ejercicio
- Pantalla de celebración al completar
- Checklist de recuperación (energía + suplementos)

### Historial y progreso
- Registro de todas las sesiones completadas
- Vista detallada de cada sesión
- Gráficos de progreso por ejercicio (carga máxima, volumen)

### Nutrición
- Menús diarios editables con comidas (pre-gimnasio, post-entreno, almuerzo, merienda, cena)
- Macros editables inline (calorías, proteínas, carbohidratos, grasas)
- Presupuesto mensual de comida
- Reorden de comidas (subir/bajar)

### PWA — Modo offline

La app es una Progressive Web App instalable. Funciona sin conexión durante el entrenamiento.

**Ciclo offline:**
1. Al iniciar un entrenamiento activo, el bloque se carga desde Supabase y se persiste en localStorage
2. Durante el entrenamiento todas las operaciones (pesos, RPE, timer) operan sobre el estado local — **no se requiere internet**
3. Al finalizar **con conexión:** la sesión se guarda directamente en Supabase
4. Al finalizar **sin conexión:** la sesión se guarda en localStorage como pendiente
5. Al reconectar, las sesiones pendientes se sincronizan automáticamente
6. Un badge en el header indica estado "Sin conexión" o "Pendiente"

## Usar Gymbro como PWA en el teléfono

### Requisito previo
La app debe estar desplegada en un servidor con HTTPS (requisito obligatorio para PWA).

### Instalación en Android

1. Abre Chrome y navega a la URL de la app desplegada
2. Inicia sesión con Google
3. Chrome mostrará un banner "Agregar a la pantalla principal" (o usa el menú ⋮ → Agregar a inicio)
4. Confirma la instalación — el icono de Gymbro aparecerá en tu pantalla de inicio
5. Abre la app desde el icono (se ejecuta en modo standalone, sin barra de navegación)

### Instalación en iOS

1. Abre Safari y navega a la URL de la app
2. Toca el botón Compartir (📤)
3. Desplázate y selecciona "Agregar a la pantalla de inicio"
4. Nombra la app y toca "Agregar"

### Comportamiento offline

- El Service Worker cachea el shell de la app (HTML, CSS, JS, fuentes)
- Las llamadas a la API de Supabase usan estrategia NetworkFirst (si hay red la usa, si no usa cache)
- **Importante:** Para usar el modo entrenamiento offline, asegúrate de iniciar el entrenamiento mientras tengas conexión (el bloque se carga desde Supabase en ese momento). Una vez iniciado, puedes quedarte sin conexión.

### No requiere conexión durante el entrenamiento

| Operación | ¿Requiere internet? |
|---|---|
| Registrar series/peso/RPE | No |
| Cronómetro de descanso | No |
| Avanzar ejercicios | No |
| Checklist de recuperación | No |
| Finalizar entrenamiento | No (se guarda local) |
| Ver historial | Sí (datos en Supabase) |

## Deploy

### Vercel (recomendado)

1. Importa el repo en [vercel.com](https://vercel.com)
2. Configura el proyecto:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Añade las variables de entorno en Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Crea un archivo `frontend/vercel.json` para SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

5. Deploya. Vercel asigna un dominio `*.vercel.app` con HTTPS automático.

### Cloudflare Pages

1. Importa el repo en Cloudflare Pages
2. Configura:
   - **Build command:** `npm run build`
   - **Build output directory:** `frontend/dist`
   - **Root directory:** `frontend`
3. Añade las variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Cloudflare Pages provee HTTPS automático y soporte nativo para SPA routing

### Supabase (backend)

El backend de Supabase ya incluye:
- **Base de datos PostgreSQL** con esquema completo y RLS
- **Autenticación** (Google OAuth)
- **API REST** autogenerada para todas las tablas

No necesitas deployar nada adicional del backend — Supabase lo gestiona.

## Comandos útiles

```bash
cd frontend

npm run dev          # Dev server (http://localhost:5173)
npm run build        # Build de producción
npm run preview      # Previsualizar build local
npm run test         # Tests unitarios (vitest)
npm run test:watch   # Tests en modo watch
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima/pública de Supabase |

## Licencia

Privado — uso personal.
