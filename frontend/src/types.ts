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
