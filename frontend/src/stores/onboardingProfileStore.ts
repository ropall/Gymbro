import { create } from 'zustand'
import type {
  Sexo,
  NivelActividad,
  ObjetivoPrincipal,
  Cronotipo,
  SplitPreferido,
} from '../types'
import { todayISO } from '../utils/calculations'

export interface OnboardingProfileData {
  fullName: string
  fechaNacimiento: string
  fotoPerfil: string | null
  sexo: Sexo
  altura: number
  pesoInicial: number
  pesoObjetivo: number
  nivelActividad: NivelActividad
  objetivoPrincipal: ObjetivoPrincipal
  cronotipo: Cronotipo
  splitPreferido: SplitPreferido
}

interface OnboardingProfileState {
  step: number
  data: OnboardingProfileData
  isSubmitting: boolean
  error: string | null
  setStep: (step: number) => void
  updateData: (updates: Partial<OnboardingProfileData>) => void
  setIsSubmitting: (v: boolean) => void
  setError: (e: string | null) => void
  reset: () => void
}

const defaults: OnboardingProfileData = {
  fullName: '',
  fechaNacimiento: todayISO(),
  fotoPerfil: null,
  sexo: 'masculino',
  altura: 170,
  pesoInicial: 70,
  pesoObjetivo: 70,
  nivelActividad: 'moderado',
  objetivoPrincipal: 'hipertrofia',
  cronotipo: 'alondra',
  splitPreferido: 'PPL',
}

export const useOnboardingProfileStore = create<OnboardingProfileState>()((set) => ({
  step: 1,
  data: { ...defaults },
  isSubmitting: false,
  error: null,

  setStep: (step) => set({ step }),

  updateData: (updates) =>
    set((state) => ({ data: { ...state.data, ...updates } })),

  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  setError: (error) => set({ error }),

  reset: () => set({ step: 1, data: { ...defaults }, isSubmitting: false, error: null }),
}))
