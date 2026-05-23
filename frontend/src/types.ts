export type Sexo = 'masculino' | 'femenino'

export interface Profile {
  sexo: Sexo
  altura: number // cm
  fechaNacimiento: string // ISO date YYYY-MM-DD
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
  | 'Isquiosurales'
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
  'Isquiosurales',
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
  Isquios: 'Isquiosurales',
  Glúteos: 'Glúteos',
  Pantorrillas: 'Pantorrillas',
  Abdomen: 'Abdomen/Core',
  'Full Body': 'Cuerpo Completo',
}

export const ONBOARDING_MUSCLE_GROUPS = Object.keys(ONBOARDING_MUSCLE_GROUP_LABELS)

export interface Block {
  id: string
  profile_id: string
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
