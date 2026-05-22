import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, WeightEntry, MeasurementEntry, ProgressPhoto } from '../types'
import { generateId, todayISO } from '../utils/calculations'

interface MetricsState {
  // Perfil
  profile: Profile | null
  setProfile: (profile: Profile) => void
  skipField: (field: keyof Profile) => void

  // Peso
  weightEntries: WeightEntry[]
  addWeight: (peso: number, fecha?: string) => void
  removeWeight: (id: string) => void
  getLatestWeight: () => WeightEntry | undefined

  // Medidas
  measurementEntries: MeasurementEntry[]
  addMeasurement: (tipo: MeasurementEntry['tipo'], valor: number, fecha?: string) => void
  removeMeasurement: (id: string) => void
  getMeasurementsByType: (tipo: MeasurementEntry['tipo']) => MeasurementEntry[]

  // Fotos
  photoEntries: ProgressPhoto[]
  addPhoto: (url: string, fecha?: string) => void
  removePhoto: (id: string) => void

  // Reset para tests
  reset: () => void
}

const initialState = {
  profile: null,
  weightEntries: [],
  measurementEntries: [],
  photoEntries: [],
}

export const useMetricsStore = create<MetricsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      skipField: (field) => {
        const current = get().profile
        if (!current) return
        const next = { ...current }
        delete next[field]
        set({ profile: next })
      },

      addWeight: (peso, fecha) =>
        set((state) => ({
          weightEntries: [
            ...state.weightEntries,
            { id: generateId(), peso, fecha: fecha ?? todayISO() },
          ].sort((a, b) => a.fecha.localeCompare(b.fecha)),
        })),

      removeWeight: (id) =>
        set((state) => ({
          weightEntries: state.weightEntries.filter((e) => e.id !== id),
        })),

      getLatestWeight: () => {
        const entries = get().weightEntries
        return entries.length > 0 ? entries[entries.length - 1] : undefined
      },

      addMeasurement: (tipo, valor, fecha) =>
        set((state) => ({
          measurementEntries: [
            ...state.measurementEntries,
            { id: generateId(), tipo, valor, fecha: fecha ?? todayISO() },
          ].sort((a, b) => a.fecha.localeCompare(b.fecha)),
        })),

      removeMeasurement: (id) =>
        set((state) => ({
          measurementEntries: state.measurementEntries.filter((e) => e.id !== id),
        })),

      getMeasurementsByType: (tipo) =>
        get().measurementEntries.filter((e) => e.tipo === tipo),

      addPhoto: (url, fecha) =>
        set((state) => ({
          photoEntries: [
            ...state.photoEntries,
            { id: generateId(), url, fecha: fecha ?? todayISO() },
          ].sort((a, b) => a.fecha.localeCompare(b.fecha)),
        })),

      removePhoto: (id) =>
        set((state) => ({
          photoEntries: state.photoEntries.filter((p) => p.id !== id),
        })),

      reset: () => set(initialState),
    }),
    { name: 'gymbro-metrics-state' }
  )
)
