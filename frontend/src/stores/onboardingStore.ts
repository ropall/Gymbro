import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { MuscleGroup, WizardDay, WizardExercise } from '../types'

interface OnboardingState {
  step: number
  days: WizardDay[]
  activeDayIndex: number | null
  routineName: string
  isSubmitting: boolean
  error: string | null

  setStep: (step: number) => void
  setActiveDayIndex: (index: number | null) => void
  setRoutineName: (name: string) => void
  toggleDayRest: (dayIndex: number) => void
  toggleMuscleGroup: (dayIndex: number, group: MuscleGroup) => void
  toggleExercise: (dayIndex: number, exercise: WizardExercise) => void
  updateExerciseParams: (
    dayIndex: number,
    exerciseId: string,
    updates: Partial<Pick<WizardExercise, 'series' | 'repsMin' | 'repsMax' | 'rpe' | 'descanso' | 'equipo' | 'variacion'>>
  ) => void
  submitWizard: () => Promise<void>
  reset: () => void
}

const createInitialDays = (): WizardDay[] =>
  Array.from({ length: 7 }, (_, i) => ({
    isRest: i >= 3,
    muscleGroups: [],
    exercises: [],
  }))

const initialState = {
  step: 1,
  days: createInitialDays(),
  activeDayIndex: null,
  routineName: '',
  isSubmitting: false,
  error: null,
}

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setActiveDayIndex: (index) => set({ activeDayIndex: index }),

  setRoutineName: (name) => set({ routineName: name }),

  toggleDayRest: (dayIndex) => {
    const days = [...get().days]
    const day = days[dayIndex]
    days[dayIndex] = day.isRest
      ? { isRest: false, muscleGroups: [], exercises: [] }
      : { isRest: true, muscleGroups: [], exercises: [] }
    set({ days })
  },

  toggleMuscleGroup: (dayIndex, group) => {
    const days = [...get().days]
    const day = days[dayIndex]
    const hasGroup = day.muscleGroups.includes(group)
    days[dayIndex] = {
      ...day,
      muscleGroups: hasGroup
        ? day.muscleGroups.filter((g) => g !== group)
        : [...day.muscleGroups, group],
    }
    set({ days })
  },

  toggleExercise: (dayIndex, exercise) => {
    const days = [...get().days]
    const day = days[dayIndex]
    const exists = day.exercises.find((ex) => ex.id === exercise.id)
    let nextExercises: WizardExercise[]
    if (exists) {
      nextExercises = day.exercises.filter((ex) => ex.id !== exercise.id)
    } else {
      nextExercises = [...day.exercises, exercise]
    }
    const nextMuscleGroups = [...new Set(nextExercises.map((ex) => ex.grupoMuscular))]
    days[dayIndex] = {
      ...day,
      exercises: nextExercises,
      muscleGroups: nextMuscleGroups,
    }
    set({ days })
  },

  updateExerciseParams: (dayIndex, exerciseId, updates) => {
    const days = [...get().days]
    const day = days[dayIndex]
    days[dayIndex] = {
      ...day,
      exercises: day.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      ),
    }
    set({ days })
  },

  submitWizard: async () => {
    set({ isSubmitting: true, error: null })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay usuario autenticado')

      const state = get()
      const createdBlocks: { id: string; posicion: number }[] = []

      // 0. Deactivate any routine the user already had active, then create the
      // new one as active (covers both first-time onboarding and building an
      // additional routine from the routine switcher).
      const { error: deactivateError } = await supabase
        .from('routines')
        .update({ activa: false })
        .eq('profile_id', userId)
        .eq('activa', true)

      if (deactivateError) throw deactivateError

      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          profile_id: userId,
          nombre: state.routineName.trim() || 'Mi rutina',
          activa: true,
        })
        .select('id')
        .single()

      if (routineError) throw routineError
      const routineId = routineData.id

      // 1. Create blocks for all 7 positions
      for (let i = 0; i < 7; i++) {
        const day = state.days[i]
        const blockName = day.isRest
          ? `Descanso`
          : `Día ${i + 1}${day.muscleGroups.length > 0 ? ' - ' + day.muscleGroups.join(', ') : ''}`

        const { data: blockData, error: blockError } = await supabase
          .from('blocks')
          .insert({
            profile_id: userId,
            routine_id: routineId,
            nombre: blockName,
            posicion: i + 1,
            es_descanso: day.isRest,
          })
          .select('id')
          .single()

        if (blockError) throw blockError
        createdBlocks.push({ id: blockData.id, posicion: i + 1 })
      }

      // 2. Create block_exercises for training days
      for (let i = 0; i < 7; i++) {
        const day = state.days[i]
        if (day.isRest || day.exercises.length === 0) continue

        const blockId = createdBlocks[i].id
        const inserts = day.exercises.map((ex) => ({
          block_id: blockId,
          global_exercise_id: ex.isCustom ? null : ex.id,
          user_exercise_id: ex.isCustom ? ex.id : null,
          series_objetivo: ex.series,
          reps_objetivo_min: ex.repsMin,
          reps_objetivo_max: ex.repsMax,
          rpe_objetivo: ex.rpe,
          descanso_segundos: ex.descanso,
        }))

        const { error: beError } = await supabase
          .from('block_exercises')
          .insert(inserts)

        if (beError) throw beError
      }

      // 3. Create active cycle
      const { error: cycleError } = await supabase.from('cycles').insert({
        profile_id: userId,
        routine_id: routineId,
        posicion_actual: 1,
        activo: true,
      })

      if (cycleError) throw cycleError

      set({ isSubmitting: false })
    } catch (err: any) {
      set({ isSubmitting: false, error: err.message ?? 'Error guardando rutina' })
      throw err
    }
  },

  reset: () => set(initialState),
}))
