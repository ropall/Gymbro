import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface SessionWithDetails {
  id: string
  cycle_id: string
  block_id: string | null
  block_name: string | null
  fecha_completado: string
  created_at: string
  exercise_count: number
}

export interface SessionDetail {
  session: SessionWithDetails
  exercises: {
    exercise_name: string
    snapshot_grupo_muscular: string | null
    sets: Array<{
      orden_serie: number
      peso: number | null
      reps_reales: number | null
      rpe_real: number | null
      snapshot_series_objetivo: number | null
      snapshot_reps_objetivo_min: number | null
      snapshot_reps_objetivo_max: number | null
      snapshot_rpe_objetivo: number | null
    }>
  }[]
}

interface HistoryState {
  sessions: SessionWithDetails[]
  isLoading: boolean
  error: string | null

  loadSessions: () => Promise<void>
  loadSessionDetail: (sessionId: string) => Promise<SessionDetail | null>
  reset: () => void
}

const initialState = {
  sessions: [],
  isLoading: false,
  error: null,
}

export const useHistoryStore = create<HistoryState>()((set) => ({
  ...initialState,

  loadSessions: async () => {
    set({ isLoading: true, error: null })

    try {
      // Load sessions with block info
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          cycle_id,
          block_id,
          fecha_completado,
          created_at,
          blocks (
            nombre
          ),
          session_sets (
            id
          )
        `)
        .order('fecha_completado', { ascending: false })

      if (sessionsError) throw sessionsError

      const sessions: SessionWithDetails[] = (sessionsData ?? []).map((s: any) => ({
        id: s.id,
        cycle_id: s.cycle_id,
        block_id: s.block_id,
        block_name: s.blocks?.nombre ?? null,
        fecha_completado: s.fecha_completado,
        created_at: s.created_at,
        exercise_count: s.session_sets?.length ?? 0,
      }))

      set({ sessions, isLoading: false })
    } catch (err: any) {
      set({ error: err.message ?? 'Error cargando historial', isLoading: false })
    }
  },

  loadSessionDetail: async (sessionId) => {
    try {
      // Load session with block info
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id,
          cycle_id,
          block_id,
          fecha_completado,
          created_at,
          blocks (
            nombre
          )
        `)
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      // Load session sets with snapshot data
      const { data: setsData, error: setsError } = await supabase
        .from('session_sets')
        .select(`
          id,
          block_exercise_id,
          peso,
          reps_reales,
          rpe_real,
          orden_serie,
          snapshot_nombre,
          snapshot_grupo_muscular,
          snapshot_series_objetivo,
          snapshot_reps_objetivo_min,
          snapshot_reps_objetivo_max,
          snapshot_rpe_objetivo,
          snapshot_descanso_segundos
        `)
        .eq('session_id', sessionId)
        .order('orden_serie', { ascending: true })

      if (setsError) throw setsError

      // Group sets by exercise
      const exercisesMap = new Map<string, {
        exercise_name: string
        snapshot_grupo_muscular: string | null
        sets: SessionDetail['exercises'][0]['sets']
      }>()

      for (const set of setsData ?? []) {
        const key = set.block_exercise_id
        if (!exercisesMap.has(key)) {
          exercisesMap.set(key, {
            exercise_name: set.snapshot_nombre ?? 'Ejercicio',
            snapshot_grupo_muscular: set.snapshot_grupo_muscular,
            sets: [],
          })
        }
        exercisesMap.get(key)!.sets.push({
          orden_serie: set.orden_serie,
          peso: set.peso,
          reps_reales: set.reps_reales,
          rpe_real: set.rpe_real,
          snapshot_series_objetivo: set.snapshot_series_objetivo,
          snapshot_reps_objetivo_min: set.snapshot_reps_objetivo_min,
          snapshot_reps_objetivo_max: set.snapshot_reps_objetivo_max,
          snapshot_rpe_objetivo: set.snapshot_rpe_objetivo,
        })
      }

      const session: SessionDetail = {
        session: {
          id: sessionData.id,
          cycle_id: sessionData.cycle_id,
          block_id: sessionData.block_id,
          block_name: (sessionData.blocks as any)?.nombre ?? null,
          fecha_completado: sessionData.fecha_completado,
          created_at: sessionData.created_at,
          exercise_count: exercisesMap.size,
        },
        exercises: Array.from(exercisesMap.values()),
      }

      return session
    } catch (err: any) {
      set({ error: err.message ?? 'Error cargando detalle de sesión' })
      return null
    }
  },

  reset: () => set(initialState),
}))
