export type Sexo = 'masculino' | 'femenino'

export type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'intenso'

export type ObjetivoPrincipal = 'hipertrofia' | 'perdida_grasa' | 'fuerza_maxima' | 'resistencia'

export type NivelExperiencia = 'principiante' | 'intermedio' | 'avanzado'

export type Cronotipo = 'alondra' | 'buho'

export type SplitPreferido = 'PPL' | 'upper_lower' | 'fullbody'

export type Somatotipo = 'ectomorfo' | 'mesomorfo' | 'endomorfo'

export const NIVEL_ACTIVIDAD_LABELS: Record<NivelActividad, string> = {
  sedentario: 'Sedentario',
  ligero: 'Ligero (1-2 días/semana)',
  moderado: 'Moderado (3-5 días/semana)',
  intenso: 'Intenso (6-7 días/semana)',
}

export const OBJETIVO_LABELS: Record<ObjetivoPrincipal, string> = {
  hipertrofia: 'Hipertrofia',
  perdida_grasa: 'Pérdida de grasa',
  fuerza_maxima: 'Fuerza máxima',
  resistencia: 'Resistencia',
}

export const CRONOTIPO_LABELS: Record<Cronotipo, string> = {
  alondra: 'Alondra (más activo por la mañana)',
  buho: 'Búho (más activo por la noche)',
}

export const SPLIT_LABELS: Record<SplitPreferido, string> = {
  PPL: 'PPL (Push/Pull/Legs)',
  upper_lower: 'Upper/Lower',
  fullbody: 'Fullbody',
}

export const NIVEL_EXPERIENCIA_LABELS: Record<NivelExperiencia, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
}

export const SOMATOTIPO_LABELS: Record<Somatotipo, string> = {
  ectomorfo: 'Ectomorfo (delgado, dificultad para ganar peso)',
  mesomorfo: 'Mesomorfo (atlético, gana músculo con facilidad)',
  endomorfo: 'Endomorfo (tiende a acumular grasa)',
}

export interface Profile {
  fullName: string | null
  sexo: Sexo
  altura: number // cm
  fechaNacimiento: string // ISO date YYYY-MM-DD
  pesoObjetivo: number | null
  nivelActividad: NivelActividad | null
  objetivoPrincipal: ObjetivoPrincipal | null
  nivelExperiencia: NivelExperiencia | null
  cronotipo: Cronotipo | null
  splitPreferido: SplitPreferido | null
  diasDisponibles: string | null
  nivelEnergia: number | null
  somatotipo: Somatotipo | null
  horarioSueno: string | null
  fotoPerfil: string | null
  onboardingCompletado: boolean
}

export interface WeightEntry {
  id: string
  peso: number // kg
  fecha: string // ISO date YYYY-MM-DD
}

export type MeasurementType = 'pecho' | 'cintura' | 'cadera' | 'biceps' | 'muslo'

export const MEASUREMENT_TYPES: MeasurementType[] = [
  'pecho',
  'cintura',
  'cadera',
  'biceps',
  'muslo',
]

export const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  pecho: 'Pecho',
  cintura: 'Cintura',
  cadera: 'Cadera',
  biceps: 'Bíceps',
  muslo: 'Muslo',
}

export interface MeasurementEntry {
  id: string
  tipo: MeasurementType
  valor: number // cm
  fecha: string // ISO date YYYY-MM-DD
}

export interface ProgressPhoto {
  id: string
  url: string // data URL or public URL
  fecha: string // ISO date YYYY-MM-DD
}

export type MuscleGroup =
  | 'Pecho'
  | 'Espalda'
  | 'Hombros'
  | 'Bíceps/Antebrazos'
  | 'Tríceps'
  | 'Cuádriceps'
  | 'Isquiotibiales'
  | 'Glúteos'
  | 'Pantorrillas'
  | 'Abdomen/Core'
  | 'Cuerpo Completo'

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Bíceps/Antebrazos',
  'Tríceps',
  'Cuádriceps',
  'Isquiotibiales',
  'Glúteos',
  'Pantorrillas',
  'Abdomen/Core',
  'Cuerpo Completo',
]

export interface Exercise {
  id: string
  nombre: string
  grupoMuscular: MuscleGroup
  equipo: string
  variaciones: string | null
  isCustom: boolean
  parentId?: string // optional reference to a base exercise
}

export interface WizardExercise {
  id: string
  nombre: string
  grupoMuscular: MuscleGroup
  isCustom: boolean
  series: number
  repsMin: number
  repsMax: number
  rpe: number
  descanso: number
  equipo?: string
  variacion?: string
}

export interface WizardDay {
  isRest: boolean
  muscleGroups: MuscleGroup[]
  exercises: WizardExercise[]
}

export const ONBOARDING_MUSCLE_GROUP_LABELS: Record<string, MuscleGroup> = {
  Pecho: 'Pecho',
  Espalda: 'Espalda',
  Hombros: 'Hombros',
  'Bíceps': 'Bíceps/Antebrazos',
  Tríceps: 'Tríceps',
  Cuádriceps: 'Cuádriceps',
  Isquios: 'Isquiotibiales',
  Glúteos: 'Glúteos',
  Pantorrillas: 'Pantorrillas',
  Abdomen: 'Abdomen/Core',
  'Full Body': 'Cuerpo Completo',
}

export const ONBOARDING_MUSCLE_GROUPS = Object.keys(ONBOARDING_MUSCLE_GROUP_LABELS)

export interface Routine {
  id: string
  profile_id: string
  nombre: string
  activa: boolean
  created_at?: string
}

export interface Block {
  id: string
  profile_id: string
  routine_id: string
  nombre: string
  posicion: number
  es_descanso: boolean
  created_at?: string
}

export interface BlockExercise {
  id: string
  block_id: string
  global_exercise_id: string | null
  user_exercise_id: string | null
  exercise?: Exercise // populated after join
  series_objetivo: number
  reps_objetivo_min: number | null
  reps_objetivo_max: number | null
  rpe_objetivo: number | null
  descanso_segundos: number | null
}

export interface Cycle {
  id: string
  profile_id: string
  routine_id: string | null
  fecha_inicio: string
  posicion_actual: number
  activo: boolean
  created_at?: string
}

export interface WorkoutSession {
  id: string
  cycle_id: string
  block_id: string | null
  fecha_completado: string
  created_at?: string
}

export interface SessionSet {
  id: string
  session_id: string
  block_exercise_id: string
  peso: number | null
  reps_reales: number | null
  rpe_real: number | null
  orden_serie: number
  // Immutable snapshot of exercise data at session time
  snapshot_nombre?: string | null
  snapshot_grupo_muscular?: string | null
  snapshot_series_objetivo?: number | null
  snapshot_reps_objetivo_min?: number | null
  snapshot_reps_objetivo_max?: number | null
  snapshot_rpe_objetivo?: number | null
  snapshot_descanso_segundos?: number | null
}

export interface RecoveryChecklist {
  id?: string
  session_id: string
  nivel_energia: number // 1-10
  suplementos: {
    creatina?: boolean
    proteina?: boolean
    glicinato_magnesio?: boolean
  }
}

export type WorkoutPhase = 'exercising' | 'celebrating' | 'recovery'

export interface NutritionMenu {
  id: string
  profile_id: string
  nombre: string
  calorias: number | null
  proteinas: number | null
  carbohidratos: number | null
  grasas: number | null
  presupuesto: string | null
  created_at?: string
  meals: NutritionMeal[]
}

export interface NutritionMeal {
  id: string
  menu_id: string
  nombre_comida: string
  descripcion: string | null
  orden: number
  created_at?: string
}

export const DEFAULT_MEAL_NAMES = [
  'Pre-Gimnasio',
  'Post-Entreno',
  'Almuerzo',
  'Merienda',
  'Cena',
]
