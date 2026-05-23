import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Exercise } from '../types'

export interface ExerciseProgress {
  exercise_id: string
  exercise_name: string
  snapshot_grupo_muscular: string | null
  sessions: Array<{
    session_id: string
    fecha_completado: string
    peso_max: number | null
    volumen_total: number | null
    reps_max: number | null
  }>
}

interface ProgressState {
  exercises: Exercise[]
  progress: ExerciseProgress | null
  isLoading: boolean
  error: string | null

  loadExercises: () => Promise<void>
  loadProgress: (exerciseId: string) => Promise<void>
  reset: () => void
}

const initialState = {
  exercises: [],
  progress: null,
  isLoading: false,
  error: null,
}

export const useProgressStore = create<ProgressState>()((set) => ({
  ...initialState,

  loadExercises: async () => {
    set({ isLoading: true, error: null })

    try {
      // Load global exercises
      const { data: globalData, error: globalError } = await supabase
        .from('global_exercises')
        .select('id, nombre, grupo_muscular, equipo, variaciones')

      if (globalError) throw globalError

      // Load user exercises
      const { data: userData, error: userError } = await supabase
        .from('user_exercises')
        .select('id, nombre, grupo_muscular, equipo')

      if (userError) throw userError

      const exercises: Exercise[] = [
        ...(globalData ?? []).map((e: any) => ({
          id: e.id,
          nombre: e.nombre,
          grupoMuscular: e.grupo_muscular,
          equipo: e.equipo,
          variaciones: e.variaciones,
          isCustom: false,
        })),
        ...(userData ?? []).map((e: any) => ({
          id: e.id,
          nombre: e.nombre,
          grupoMuscular: e.grupo_muscular,
          equipo: e.equipo,
          variaciones: null,
          isCustom: true,
        })),
      ]

      set({ exercises, isLoading: false })
    } catch (err: any) {
      set({ error: err.message ?? 'Error cargando ejercicios', isLoading: false })
    }
  },

  loadProgress: async (exerciseId) => {
    set({ isLoading: true, error: null })

    try {
      // Find exercise name
      const exercise = get().exercises.find((e) => e.id === exerciseId)
      if (!exercise) {
        throw new Error('Ejercicio no encontrado')
      }

      // Get all session_sets for this exercise (via block_exercises)
      // First get all block_exercises that reference this exercise
      const { data: blockExercises, error: beError } = await supabase
        .from('block_exercises')
        .select('id')
        .or(`global_exercise_id.eq.${exerciseId},user_exercise_id.eq.${exerciseId}`)

      if (beError) throw beError

      if (!blockExercises || blockExercises.length === 0) {
        set({ progress: {
          exercise_id: exerciseId,
          exercise_name: exercise.nombre,
          snapshot_grupo_muscular: exercise.grupoMuscular,
          sessions: [],
        }, isLoading: false })
        return
      }

      const blockExerciseIds = blockExercises.map((be: any) => be.id)

      // Get all session_sets for these block_exercises
      const { data: sessionSets, error: ssError } = await supabase
        .from('session_sets')
        .select(`
          session_id,
          peso,
          reps_reales,
          sessions (
            fecha_completado
          )
        `)
        .in('block_exercise_id', blockExerciseIds)
        .not('sessions', 'is', null)

      if (ssError) throw ssError

      // Group by session
      const sessionsMap = new Map<string, {
        session_id: string
        fecha_completado: string
        peso_max: number | null
        volumen_total: number | null
        reps_max: number | null
      }>()

      for (const set of sessionSets ?? []) {
        const sessionId = set.session_id
        const fecha = (set.sessions as any)?.fecha_completado ?? ''
        const peso = set.peso ?? 0
        const reps = set.reps_reales ?? 0
        const volumen = peso * reps

        if (!sessionsMap.has(sessionId)) {
          sessionsMap.set(sessionId, {
            session_id: sessionId,
            fecha_completado: fecha,
            peso_max: null,
            volumen_total: null,
            reps_max: null,
          })
        }

        const session = sessionsMap.get(sessionId)!
        if (peso > 0) {
          session.peso_max = session.peso_max === null ? peso : Math.max(session.peso_max, peso)
          session.volumen_total = (session.volumen_total ?? 0) + volumen
          session.reps_max = session.reps_max === null ? reps : Math.max(session.reps_max, reps)
        }
      }

      // Sort by date
      const sessions = Array.from(sessionsMap.values())
        .sort((a, b) => new Date(b.fecha_completado).getTime() - new Date(a.fecha_completado).getTime())

      set({
        progress: {
          exercise_id: exerciseId,
          exercise_name: exercise.nombre,
          snapshot_grupo_muscular: exercise.grupoMuscular,
          sessions,
        },
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.message ?? 'Error cargando progreso', isLoading: false })
    }
  },

  reset: () => set(initialState),
}))

function get() {
  return useProgressStore.getState()
}
