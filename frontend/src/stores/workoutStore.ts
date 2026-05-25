import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { BlockExercise, WorkoutPhase } from '../types'

export interface ActiveSet {
  orden: number
  completed: boolean
  peso: number | null
  reps_reales: number | null
  rpe_real: number | null
}

export interface ActiveExercise {
  blockExercise: BlockExercise
  sets: ActiveSet[]
  completed: boolean
}

export interface PendingSession {
  blockId: string
  exercises: ActiveExercise[]
  energyLevel: number
  supplements: { creatina: boolean; proteina: boolean; glicinato_magnesio: boolean }
  createdAt: string
}

interface WorkoutState {
  blockId: string | null
  blockName: string
  exercises: ActiveExercise[]
  currentExerciseIndex: number
  currentSetIndex: number
  phase: WorkoutPhase
  sessionId: string | null
  pendingSync: boolean

  restSecondsRemaining: number
  restTotalSeconds: number
  restTimerRunning: boolean
  restTimerStarted: boolean
  restWarningDismissed: boolean

  energyLevel: number | null
  supplements: {
    creatina: boolean
    proteina: boolean
    glicinato_magnesio: boolean
  }

  initializeWorkout: (blockId: string, blockName: string, exercises: BlockExercise[]) => void
  completeSet: () => void
  updateSetWeight: (weight: number | null, setIndex?: number) => void
  updateSetReps: (reps: number | null, setIndex?: number) => void
  updateSetRpe: (rpe: number | null, setIndex?: number) => void
  startRestTimer: (seconds: number) => void
  pauseRestTimer: () => void
  resumeRestTimer: () => void
  tickRestTimer: () => void
  dismissRestWarning: () => void
  finishSetRest: () => void
  advanceToNextExercise: () => void
  setPhase: (phase: WorkoutPhase) => void
  setEnergyLevel: (level: number) => void
  toggleSupplement: (key: 'creatina' | 'proteina' | 'glicinato_magnesio') => void
  finishWorkout: () => Promise<void>
  syncPendingSession: () => Promise<boolean>
  reset: () => void
}

const initialState = {
  blockId: null,
  blockName: '',
  exercises: [],
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  phase: 'exercising' as WorkoutPhase,
  sessionId: null,
  pendingSync: false,
  restSecondsRemaining: 0,
  restTotalSeconds: 0,
  restTimerRunning: false,
  restTimerStarted: false,
  restWarningDismissed: false,
  energyLevel: null as number | null,
  supplements: {
    creatina: false,
    proteina: false,
    glicinato_magnesio: false,
  },
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeWorkout: (blockId, blockName, exercises) => {
        const activeExercises = exercises.map((be) => ({
          blockExercise: be,
          sets: Array.from({ length: be.series_objetivo }, (_, i) => ({
            orden: i + 1,
            completed: false,
            peso: null,
            reps_reales: null,
            rpe_real: null,
          })),
          completed: false,
        }))

        set({
          ...initialState,
          blockId,
          blockName,
          exercises: activeExercises,
        })
      },

      completeSet: () => {
        const { exercises, currentExerciseIndex, currentSetIndex } = get()
        const exercise = exercises[currentExerciseIndex]
        if (!exercise || exercise.sets[currentSetIndex].completed) return

        const updatedExercises = [...exercises]
        updatedExercises[currentExerciseIndex] = {
          ...exercise,
          sets: exercise.sets.map((s, i) =>
            i === currentSetIndex ? { ...s, completed: true } : s
          ),
        }

        const restSeconds = exercise.blockExercise.descanso_segundos ?? 90

        set({
          exercises: updatedExercises,
          restTimerStarted: true,
          restTimerRunning: true,
          restSecondsRemaining: restSeconds,
          restTotalSeconds: restSeconds,
          restWarningDismissed: false,
        })
      },

      updateSetWeight: (weight, setIndex) => {
        const { exercises, currentExerciseIndex, currentSetIndex } = get()
        const idx = setIndex ?? currentSetIndex
        const updatedExercises = [...exercises]
        const exercise = updatedExercises[currentExerciseIndex]
        updatedExercises[currentExerciseIndex] = {
          ...exercise,
          sets: exercise.sets.map((s, i) =>
            i === idx ? { ...s, peso: weight } : s
          ),
        }
        set({ exercises: updatedExercises })
      },

      updateSetReps: (reps, setIndex) => {
        const { exercises, currentExerciseIndex, currentSetIndex } = get()
        const idx = setIndex ?? currentSetIndex
        const updatedExercises = [...exercises]
        const exercise = updatedExercises[currentExerciseIndex]
        updatedExercises[currentExerciseIndex] = {
          ...exercise,
          sets: exercise.sets.map((s, i) =>
            i === idx ? { ...s, reps_reales: reps } : s
          ),
        }
        set({ exercises: updatedExercises })
      },

      updateSetRpe: (rpe, setIndex) => {
        const { exercises, currentExerciseIndex, currentSetIndex } = get()
        const idx = setIndex ?? currentSetIndex
        const updatedExercises = [...exercises]
        const exercise = updatedExercises[currentExerciseIndex]
        updatedExercises[currentExerciseIndex] = {
          ...exercise,
          sets: exercise.sets.map((s, i) =>
            i === idx ? { ...s, rpe_real: rpe } : s
          ),
        }
        set({ exercises: updatedExercises })
      },

      startRestTimer: (seconds) => {
        set({
          restSecondsRemaining: seconds,
          restTimerRunning: true,
          restTimerStarted: true,
          restWarningDismissed: false,
        })
      },

      pauseRestTimer: () => {
        set({ restTimerRunning: false })
      },

      resumeRestTimer: () => {
        set({ restTimerRunning: true })
      },

      tickRestTimer: () => {
        const { restSecondsRemaining, restTimerRunning } = get()
        if (!restTimerRunning || restSecondsRemaining <= 0) return
        set({ restSecondsRemaining: restSecondsRemaining - 1 })
      },

      dismissRestWarning: () => {
        set({ restWarningDismissed: true })
      },

      finishSetRest: () => {
        const { exercises, currentExerciseIndex, currentSetIndex } = get()
        const exercise = exercises[currentExerciseIndex]
        const nextSetIndex = currentSetIndex + 1
        const allSetsCompleted = nextSetIndex >= exercise.sets.length

        set({
          restTimerStarted: false,
          restTimerRunning: false,
          restSecondsRemaining: 0,
          restTotalSeconds: 0,
          restWarningDismissed: false,
        })

        if (allSetsCompleted) {
          get().advanceToNextExercise()
        } else {
          set({ currentSetIndex: nextSetIndex })
        }
      },

      advanceToNextExercise: () => {
        const { exercises, currentExerciseIndex } = get()
        const nextIndex = currentExerciseIndex + 1

        const updatedExercises = [...exercises]
        updatedExercises[currentExerciseIndex] = {
          ...updatedExercises[currentExerciseIndex],
          completed: true,
        }

        if (nextIndex >= exercises.length) {
          set({
            exercises: updatedExercises,
            phase: 'celebrating',
            restTimerRunning: false,
            restWarningDismissed: false,
          })
        } else {
          set({
            exercises: updatedExercises,
            currentExerciseIndex: nextIndex,
            currentSetIndex: 0,
            restSecondsRemaining: 0,
            restTotalSeconds: 0,
            restTimerRunning: false,
            restTimerStarted: false,
            restWarningDismissed: false,
          })
        }
      },

      setPhase: (phase) => {
        set({ phase })
      },

      setEnergyLevel: (level) => {
        set({ energyLevel: level })
      },

      toggleSupplement: (key) => {
        const { supplements } = get()
        set({
          supplements: {
            ...supplements,
            [key]: !supplements[key],
          },
        })
      },

      finishWorkout: async () => {
        const { blockId, exercises, sessionId, energyLevel, supplements } = get()
        if (!blockId || !sessionId || energyLevel === null) {
          throw new Error('Faltan datos para finalizar el entrenamiento')
        }

        const allSets: { block_exercise_id: string; peso: number | null; reps_reales: number | null; rpe_real: number | null; orden_serie: number }[] = []

        for (const ex of exercises) {
          for (const s of ex.sets) {
            if (s.completed) {
              allSets.push({
                block_exercise_id: ex.blockExercise.id,
                peso: s.peso,
                reps_reales: s.reps_reales,
                rpe_real: s.rpe_real,
                orden_serie: s.orden,
              })
            }
          }
        }

        if (!navigator.onLine) {
          const pending: PendingSession = {
            blockId,
            exercises: JSON.parse(JSON.stringify(exercises)),
            energyLevel,
            supplements: { ...supplements },
            createdAt: new Date().toISOString(),
          }
          const raw = localStorage.getItem('gymbro-pending-sessions')
          const existing: PendingSession[] = raw ? JSON.parse(raw) : []
          existing.push(pending)
          localStorage.setItem('gymbro-pending-sessions', JSON.stringify(existing))
          set({ pendingSync: true, sessionId: null })
          return
        }

        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            cycle_id: (await supabase.from('cycles').select('id').eq('activo', true).order('created_at', { ascending: false }).limit(1).maybeSingle()).data?.id,
            block_id: blockId,
          })
          .select('id')
          .single()

        if (sessionError) throw sessionError
        const newSessionId = sessionData.id

        const blockExerciseIds = exercises.map((e) => e.blockExercise.id)
        const snapshotMap = new Map<string, any>()

        if (blockExerciseIds.length > 0) {
          const { data: beData } = await supabase
            .from('block_exercises')
            .select('id, global_exercise_id, user_exercise_id, series_objetivo, reps_objetivo_min, reps_objetivo_max, rpe_objetivo, descanso_segundos')
            .in('id', blockExerciseIds)

          if (beData) {
            const globalIds = beData.map((be: any) => be.global_exercise_id).filter(Boolean)
            const userIds = beData.map((be: any) => be.user_exercise_id).filter(Boolean)

            const globalMap = new Map<string, any>()
            const userMap = new Map<string, any>()

            if (globalIds.length > 0) {
              const { data: gData } = await supabase
                .from('global_exercises')
                .select('id, nombre, grupo_muscular')
                .in('id', globalIds)
              ;(gData ?? []).forEach((g: any) => globalMap.set(g.id, g))
            }

            if (userIds.length > 0) {
              const { data: uData } = await supabase
                .from('user_exercises')
                .select('id, nombre, grupo_muscular')
                .in('id', userIds)
              ;(uData ?? []).forEach((u: any) => userMap.set(u.id, u))
            }

            for (const be of beData) {
              const globalEx = be.global_exercise_id ? globalMap.get(be.global_exercise_id) : null
              const userEx = be.user_exercise_id ? userMap.get(be.user_exercise_id) : null
              snapshotMap.set(be.id, {
                nombre: globalEx?.nombre ?? userEx?.nombre ?? null,
                grupo_muscular: globalEx?.grupo_muscular ?? userEx?.grupo_muscular ?? null,
                series_objetivo: be.series_objetivo,
                reps_objetivo_min: be.reps_objetivo_min,
                reps_objetivo_max: be.reps_objetivo_max,
                rpe_objetivo: be.rpe_objetivo,
                descanso_segundos: be.descanso_segundos,
              })
            }
          }
        }

        if (allSets.length > 0) {
          const inserts = allSets.map((s) => {
            const snap = snapshotMap.get(s.block_exercise_id) || {}
            return {
              session_id: newSessionId,
              block_exercise_id: s.block_exercise_id,
              peso: s.peso,
              reps_reales: s.reps_reales,
              rpe_real: s.rpe_real,
              orden_serie: s.orden_serie,
              snapshot_nombre: snap.nombre ?? null,
              snapshot_grupo_muscular: snap.grupo_muscular ?? null,
              snapshot_series_objetivo: snap.series_objetivo ?? null,
              snapshot_reps_objetivo_min: snap.reps_objetivo_min ?? null,
              snapshot_reps_objetivo_max: snap.reps_objetivo_max ?? null,
              snapshot_rpe_objetivo: snap.rpe_objetivo ?? null,
              snapshot_descanso_segundos: snap.descanso_segundos ?? null,
            }
          })

          const { error: setsError } = await supabase.from('session_sets').insert(inserts)
          if (setsError) throw setsError
        }

        const { error: recoveryError } = await supabase
          .from('recovery_checklist')
          .insert({
            session_id: newSessionId,
            nivel_energia: energyLevel,
            suplementos: supplements,
          })

        if (recoveryError) throw recoveryError

        const { data: cycleData } = await supabase
          .from('cycles')
          .select('id, posicion_actual')
          .eq('activo', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (cycleData) {
          const nextPos = cycleData.posicion_actual + 1
          if (nextPos > 7) {
            await supabase
              .from('cycles')
              .update({ activo: false, posicion_actual: 7 })
              .eq('id', cycleData.id)
          } else {
            await supabase
              .from('cycles')
              .update({ posicion_actual: nextPos })
              .eq('id', cycleData.id)
          }
        }

        set({ sessionId: newSessionId })
      },

      syncPendingSession: async () => {
        const raw = localStorage.getItem('gymbro-pending-sessions')
        if (!raw) return true
        const pending: PendingSession[] = JSON.parse(raw)
        if (pending.length === 0) return true

        try {
          const { data: userData } = await supabase.auth.getUser()
          if (!userData.user) return false

          for (const session of pending) {
            const { data: sessionData, error: sessionError } = await supabase
              .from('sessions')
              .insert({
                cycle_id: (await supabase.from('cycles').select('id').eq('activo', true).order('created_at', { ascending: false }).limit(1).maybeSingle()).data?.id,
                block_id: session.blockId,
              })
              .select('id')
              .single()

            if (sessionError) throw sessionError

            const allSets: any[] = []
            for (const ex of session.exercises) {
              for (const s of ex.sets) {
                if (s.completed) {
                  allSets.push({
                    session_id: sessionData.id,
                    block_exercise_id: ex.blockExercise.id,
                    peso: s.peso,
                    reps_reales: s.reps_reales,
                    rpe_real: s.rpe_real,
                    orden_serie: s.orden,
                  })
                }
              }
            }

            if (allSets.length > 0) {
              const { error: setsError } = await supabase.from('session_sets').insert(allSets)
              if (setsError) throw setsError
            }

            const { error: recoveryError } = await supabase
              .from('recovery_checklist')
              .insert({
                session_id: sessionData.id,
                nivel_energia: session.energyLevel,
                suplementos: session.supplements,
              })
            if (recoveryError) throw recoveryError
          }

          localStorage.removeItem('gymbro-pending-sessions')
          set({ pendingSync: false })
          return true
        } catch {
          return false
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'gymbro-workout-state',
      partialize: (state) => ({
        blockId: state.blockId,
        blockName: state.blockName,
        exercises: state.exercises,
        currentExerciseIndex: state.currentExerciseIndex,
        currentSetIndex: state.currentSetIndex,
        sessionId: state.sessionId,
        pendingSync: state.pendingSync,
        energyLevel: state.energyLevel,
        supplements: state.supplements,
      }),
    }
  )
)
