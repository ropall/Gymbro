import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Exercise, MuscleGroup } from '../types'
import { SEED_EXERCISES } from '../data/seed-exercises'
import { generateId } from '../utils/calculations'

function mapSeedGroupToMuscleGroup(seedGroup: string): MuscleGroup {
  if (seedGroup.includes('Pecho')) return 'Pecho'
  if (seedGroup.includes('Espalda')) return 'Espalda'
  if (seedGroup.includes('Hombros')) return 'Hombros'
  if (seedGroup.includes('Bíceps')) return 'Bíceps/Antebrazos'
  if (seedGroup.includes('Tríceps')) return 'Tríceps'
  if (seedGroup.includes('Cuádriceps')) return 'Cuádriceps'
  if (seedGroup.includes('Isquiosurales') || seedGroup.includes('Femorales')) return 'Isquiosurales'
  if (seedGroup.includes('Glúteos')) return 'Glúteos'
  if (seedGroup.includes('Pantorrillas')) return 'Pantorrillas'
  if (seedGroup.includes('Abdomen') || seedGroup.includes('Core')) return 'Abdomen/Core'
  return 'Cuerpo Completo'
}

const globalExercises: Exercise[] = SEED_EXERCISES.map((seed) => ({
  id: seed.id,
  nombre: seed.nombre,
  grupoMuscular: mapSeedGroupToMuscleGroup(seed.grupoMuscular),
  equipo: seed.equipo,
  variaciones: seed.variaciones,
  isCustom: false,
}))

interface ExerciseCatalogState {
  globalExercises: Exercise[]
  customExercises: Exercise[]
  searchQuery: string
  activeGroup: MuscleGroup | 'todos'
  setSearchQuery: (query: string) => void
  setActiveGroup: (group: MuscleGroup | 'todos') => void
  addCustomExercise: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => void
  updateCustomExercise: (id: string, updates: Partial<Exercise>) => void
  removeCustomExercise: (id: string) => void
  getFilteredExercises: () => Exercise[]
  getExerciseById: (id: string) => Exercise | undefined
  reset: () => void
}

const initialState = {
  globalExercises,
  customExercises: [],
  searchQuery: '',
  activeGroup: 'todos' as MuscleGroup | 'todos',
}

export const useExerciseStore = create<ExerciseCatalogState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveGroup: (group) => set({ activeGroup: group }),

      addCustomExercise: (exercise) =>
        set((state) => ({
          customExercises: [
            ...state.customExercises,
            { ...exercise, id: generateId(), isCustom: true },
          ],
        })),

      updateCustomExercise: (id, updates) =>
        set((state) => ({
          customExercises: state.customExercises.map((ex) =>
            ex.id === id ? { ...ex, ...updates } : ex
          ),
        })),

      removeCustomExercise: (id) =>
        set((state) => ({
          customExercises: state.customExercises.filter((ex) => ex.id !== id),
        })),

      getFilteredExercises: () => {
        const state = get()
        const all = [...state.globalExercises, ...state.customExercises]
        const query = state.searchQuery.toLowerCase().trim()

        return all.filter((ex) => {
          const matchesGroup =
            state.activeGroup === 'todos' || ex.grupoMuscular === state.activeGroup
          const matchesSearch =
            !query ||
            ex.nombre.toLowerCase().includes(query) ||
            ex.equipo.toLowerCase().includes(query) ||
            ex.grupoMuscular.toLowerCase().includes(query)
          return matchesGroup && matchesSearch
        })
      },

      getExerciseById: (id) => {
        const state = get()
        return (
          state.globalExercises.find((ex) => ex.id === id) ||
          state.customExercises.find((ex) => ex.id === id)
        )
      },

      reset: () => set({ ...initialState, customExercises: [] }),
    }),
    { name: 'gymbro-exercise-catalog' }
  )
)
