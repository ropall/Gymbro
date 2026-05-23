import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Exercise, MuscleGroup } from '../types'

interface ExerciseCatalogState {
  globalExercises: Exercise[]
  customExercises: Exercise[]
  searchQuery: string
  activeGroup: MuscleGroup | 'todos'
  isLoading: boolean
  error: string | null

  setSearchQuery: (query: string) => void
  setActiveGroup: (group: MuscleGroup | 'todos') => void
  loadData: () => Promise<void>
  addCustomExercise: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => Promise<void>
  updateCustomExercise: (id: string, updates: Partial<Exercise>) => Promise<void>
  removeCustomExercise: (id: string) => Promise<void>
  getFilteredExercises: () => Exercise[]
  getExerciseById: (id: string) => Exercise | undefined
  reset: () => void
}

const initialState = {
  globalExercises: [],
  customExercises: [],
  searchQuery: '',
  activeGroup: 'todos' as MuscleGroup | 'todos',
  isLoading: false,
  error: null,
}

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

function mapGlobalExerciseFromDB(row: any): Exercise {
  return {
    id: row.id,
    nombre: row.nombre,
    grupoMuscular: mapSeedGroupToMuscleGroup(row.grupo_muscular),
    equipo: row.equipo ?? 'Sin equipo',
    variaciones: row.variaciones ?? null,
    isCustom: false,
    parentId: row.parent_id ?? undefined,
  }
}

function mapUserExerciseFromDB(row: any): Exercise {
  return {
    id: row.id,
    nombre: row.nombre,
    grupoMuscular: mapSeedGroupToMuscleGroup(row.grupo_muscular),
    equipo: row.equipo ?? 'Sin equipo',
    variaciones: null,
    isCustom: true,
    parentId: row.parent_id ?? undefined,
  }
}

export const useExerciseStore = create<ExerciseCatalogState>()((set, get) => ({
  ...initialState,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveGroup: (group) => set({ activeGroup: group }),

  loadData: async () => {
    set({ isLoading: true, error: null })

    try {
      // Load global exercises
      const { data: globalData, error: globalError } = await supabase
        .from('global_exercises')
        .select('id, nombre, grupo_muscular, equipo, variaciones, parent_id')
        .order('nombre', { ascending: true })

      if (globalError) throw globalError

      // Load user exercises
      const { data: userData, error: userError } = await supabase
        .from('user_exercises')
        .select('id, nombre, grupo_muscular, equipo, parent_id')
        .order('nombre', { ascending: true })

      if (userError) throw userError

      set({
        globalExercises: globalData?.map(mapGlobalExerciseFromDB) ?? [],
        customExercises: userData?.map(mapUserExerciseFromDB) ?? [],
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.message ?? 'Error cargando catálogo', isLoading: false })
    }
  },

  addCustomExercise: async (exercise) => {
    set({ isLoading: true, error: null })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay usuario autenticado')

      const { data, error } = await supabase
        .from('user_exercises')
        .insert({
          profile_id: userId,
          nombre: exercise.nombre,
          grupo_muscular: exercise.grupoMuscular,
          equipo: exercise.equipo,
          parent_id: exercise.parentId ?? null,
        })
        .select('id, nombre, grupo_muscular, equipo, parent_id')
        .single()

      if (error) throw error

      const newExercise = mapUserExerciseFromDB(data)
      set((state) => ({
        customExercises: [...state.customExercises, newExercise],
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error agregando ejercicio', isLoading: false })
    }
  },

  updateCustomExercise: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase
        .from('user_exercises')
        .update({
          nombre: updates.nombre,
          grupo_muscular: updates.grupoMuscular,
          equipo: updates.equipo,
          parent_id: updates.parentId ?? null,
        })
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        customExercises: state.customExercises.map((ex) =>
          ex.id === id ? { ...ex, ...updates } : ex
        ),
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error actualizando ejercicio', isLoading: false })
    }
  },

  removeCustomExercise: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase
        .from('user_exercises')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        customExercises: state.customExercises.filter((ex) => ex.id !== id),
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error eliminando ejercicio', isLoading: false })
    }
  },

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

  reset: () => set(initialState),
}))
