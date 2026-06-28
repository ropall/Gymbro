import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SetTracker } from '../components/workout/SetTracker'
import { RestTimerModal } from '../components/workout/RestTimerModal'
import { ExerciseInfo } from '../components/workout/ExerciseInfo'
import { CelebrationScreen } from '../components/workout/CelebrationScreen'
import { RecoveryChecklist } from '../components/workout/RecoveryChecklist'
import { useWorkoutStore } from '../stores/workoutStore'

// Mock Web Audio API and sound module to avoid errors in test environment
vi.mock('../lib/sound', () => ({
  playStartSound: vi.fn(),
  playTimerDoneSound: vi.fn(),
}))

const mockBlockExercises = [
  {
    id: 'be1',
    block_id: 'b1',
    global_exercise_id: 'g1',
    user_exercise_id: null,
    series_objetivo: 3,
    reps_objetivo_min: 8,
    reps_objetivo_max: 12,
    rpe_objetivo: 7,
    descanso_segundos: 90,
    exercise: {
      id: 'g1',
      nombre: 'Press de Banca',
      grupoMuscular: 'Pecho' as const,
      equipo: 'Barra',
      variaciones: null,
      isCustom: false,
    },
  },
]

describe('Active Workout Mode', () => {
  beforeEach(() => {
    useWorkoutStore.getState().reset()
    vi.restoreAllMocks()
  })

  describe('ExerciseInfo', () => {
    it('displays exercise name and params', () => {
      useWorkoutStore.getState().initializeWorkout('b1', 'Día 1 - Pecho', mockBlockExercises, 'test-cycle-id')

      render(<ExerciseInfo blockName="Día 1 - Pecho" totalExercises={1} />)

      expect(screen.getByText(/Día 1 - Pecho/i)).toBeInTheDocument()
      expect(screen.getByText(/Ejercicio 1 de 1/i)).toBeInTheDocument()
      expect(screen.getByText(/Press de Banca/i)).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
      expect(screen.getByText('90s')).toBeInTheDocument()
    })

    it('shows progress bar', () => {
      useWorkoutStore.getState().initializeWorkout('b1', 'Día 1 - Pecho', mockBlockExercises, 'test-cycle-id')

      render(<ExerciseInfo blockName="Día 1 - Pecho" totalExercises={1} />)

      expect(screen.getByText(/Progreso del bloque/i)).toBeInTheDocument()
      expect(screen.getByText('0/1')).toBeInTheDocument()
    })
  })

  describe('SetTracker', () => {
    it('shows correct number of sets', () => {
      useWorkoutStore.getState().initializeWorkout('b1', 'Día 1 - Pecho', mockBlockExercises, 'test-cycle-id')

      render(<SetTracker onSetComplete={() => {}} />)

      expect(screen.getByText(/Serie 1/i)).toBeInTheDocument()
      expect(screen.getByText(/Serie 2/i)).toBeInTheDocument()
      expect(screen.getByText(/Serie 3/i)).toBeInTheDocument()
    })

    it('shows Completar button for current set', () => {
      useWorkoutStore.getState().initializeWorkout('b1', 'Día 1 - Pecho', mockBlockExercises, 'test-cycle-id')

      render(<SetTracker onSetComplete={() => {}} />)

      expect(screen.getByRole('button', { name: /Completar/i })).toBeInTheDocument()
    })

    it('marks set as completed when clicked', async () => {
      const user = userEvent.setup()
      useWorkoutStore.getState().initializeWorkout('b1', 'Día 1 - Pecho', mockBlockExercises, 'test-cycle-id')

      render(<SetTracker onSetComplete={() => useWorkoutStore.getState().completeSet()} />)

      await user.click(screen.getByRole('button', { name: /Completar/i }))

      expect(useWorkoutStore.getState().exercises[0].sets[0].completed).toBe(true)
      expect(screen.getByText('✓')).toBeInTheDocument()
    })
  })

  describe('RestTimerModal', () => {
    it('appears automatically after completing a set', async () => {
      const user = userEvent.setup()
      useWorkoutStore.getState().initializeWorkout('b1', 'Día 1 - Pecho', mockBlockExercises, 'test-cycle-id')

      render(
        <>
          <SetTracker onSetComplete={() => useWorkoutStore.getState().completeSet()} />
          <RestTimerModal />
        </>
      )

      await user.click(screen.getByRole('button', { name: /Completar/i }))

      expect(screen.getByText(/Descanso/i)).toBeInTheDocument()
      expect(screen.getByText('00:01:30')).toBeInTheDocument()
    })

    it('shows weight, reps and RPE inputs inside the modal', async () => {
      const user = userEvent.setup()
      useWorkoutStore.getState().initializeWorkout('b1', 'Día 1 - Pecho', mockBlockExercises, 'test-cycle-id')

      render(
        <>
          <SetTracker onSetComplete={() => useWorkoutStore.getState().completeSet()} />
          <RestTimerModal />
        </>
      )

      await user.click(screen.getByRole('button', { name: /Completar/i }))

      expect(screen.getByLabelText(/Peso \(kg\)/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Repeticiones/i)).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('allows entering weight and reps', async () => {
      const user = userEvent.setup()
      useWorkoutStore.getState().initializeWorkout('b1', 'Día 1 - Pecho', mockBlockExercises, 'test-cycle-id')

      render(
        <>
          <SetTracker onSetComplete={() => useWorkoutStore.getState().completeSet()} />
          <RestTimerModal />
        </>
      )

      await user.click(screen.getByRole('button', { name: /Completar/i }))

      const weightInput = screen.getAllByPlaceholderText('0')[0]
      await user.type(weightInput, '80')
      expect(weightInput).toHaveValue(80)

      const repsInput = screen.getAllByPlaceholderText('0')[1]
      await user.type(repsInput, '10')
      expect(repsInput).toHaveValue(10)
    })

    it('allows selecting RPE', async () => {
      const user = userEvent.setup()
      useWorkoutStore.getState().initializeWorkout('b1', 'Día 1 - Pecho', mockBlockExercises, 'test-cycle-id')

      render(
        <>
          <SetTracker onSetComplete={() => useWorkoutStore.getState().completeSet()} />
          <RestTimerModal />
        </>
      )

      await user.click(screen.getByRole('button', { name: /Completar/i }))
      await user.click(screen.getByText('7'))

      expect(useWorkoutStore.getState().exercises[0].sets[0].rpe_real).toBe(7)
    })

    it('shows pause button while running', async () => {
      const user = userEvent.setup()
      useWorkoutStore.getState().initializeWorkout('b1', 'Día 1 - Pecho', mockBlockExercises, 'test-cycle-id')

      render(
        <>
          <SetTracker onSetComplete={() => useWorkoutStore.getState().completeSet()} />
          <RestTimerModal />
        </>
      )

      await user.click(screen.getByRole('button', { name: /Completar/i }))

      expect(screen.getByRole('button', { name: /Pausar/i })).toBeInTheDocument()
    })

    it('advances to next set when continuing', async () => {
      const user = userEvent.setup()
      useWorkoutStore.getState().initializeWorkout('b1', 'Día 1 - Pecho', mockBlockExercises, 'test-cycle-id')

      render(
        <>
          <SetTracker onSetComplete={() => useWorkoutStore.getState().completeSet()} />
          <RestTimerModal />
        </>
      )

      await user.click(screen.getByRole('button', { name: /Completar/i }))
      await user.click(screen.getByRole('button', { name: /Aceptar/i }))
      await user.click(screen.getByRole('button', { name: /Saltar descanso/i }))
      await user.click(screen.getByRole('button', { name: /Siguiente serie/i }))

      expect(useWorkoutStore.getState().currentSetIndex).toBe(1)
    })
  })

  describe('CelebrationScreen', () => {
    it('shows celebration message', () => {
      render(<CelebrationScreen onContinue={() => {}} />)

      expect(screen.getByRole('heading', { name: /Entrenamiento Completado/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument()
    })

    it('calls onContinue when button clicked', async () => {
      const user = userEvent.setup()
      const onContinue = vi.fn()

      render(<CelebrationScreen onContinue={onContinue} />)

      await user.click(screen.getByRole('button', { name: /Continuar/i }))

      expect(onContinue).toHaveBeenCalled()
    })
  })

  describe('RecoveryChecklist', () => {
    it('shows energy level selector', () => {
      render(<RecoveryChecklist onFinish={() => {}} />)

      expect(screen.getByText(/Nivel de energía/i)).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('shows supplement checkboxes', () => {
      render(<RecoveryChecklist onFinish={() => {}} />)

      expect(screen.getByText(/Creatina/i)).toBeInTheDocument()
      expect(screen.getByText(/Proteína/i)).toBeInTheDocument()
      expect(screen.getByText(/Glicinato de magnesio/i)).toBeInTheDocument()
    })

    it('finish button is disabled without energy level', () => {
      render(<RecoveryChecklist onFinish={() => {}} />)

      const finishBtn = screen.getByRole('button', { name: /Finalizar entrenamiento/i })
      expect(finishBtn).toBeDisabled()
    })

    it('finish button is enabled after selecting energy level', async () => {
      const user = userEvent.setup()
      // A session needs at least one completed set to be finishable.
      useWorkoutStore.getState().initializeWorkout('b1', 'Test', mockBlockExercises, 'test-cycle-id')
      useWorkoutStore.getState().completeSet()
      render(<RecoveryChecklist onFinish={() => {}} />)

      await user.click(screen.getByText('5'))

      const finishBtn = screen.getByRole('button', { name: /Finalizar entrenamiento/i })
      expect(finishBtn).not.toBeDisabled()
    })

    it('toggles supplements', async () => {
      const user = userEvent.setup()
      render(<RecoveryChecklist onFinish={() => {}} />)

      const creatinaBtn = screen.getByText(/Creatina/i).closest('button')!
      await user.click(creatinaBtn)

      expect(useWorkoutStore.getState().supplements.creatina).toBe(true)

      await user.click(creatinaBtn)
      expect(useWorkoutStore.getState().supplements.creatina).toBe(false)
    })
  })

  describe('WorkoutStore', () => {
    it('initializes with correct number of sets', () => {
      useWorkoutStore.getState().initializeWorkout('b1', 'Test', mockBlockExercises, 'test-cycle-id')

      const state = useWorkoutStore.getState()
      expect(state.exercises.length).toBe(1)
      expect(state.exercises[0].sets.length).toBe(3)
      expect(state.currentExerciseIndex).toBe(0)
      expect(state.currentSetIndex).toBe(0)
    })

    it('completes a set and starts rest timer automatically', () => {
      useWorkoutStore.getState().initializeWorkout('b1', 'Test', mockBlockExercises, 'test-cycle-id')
      useWorkoutStore.getState().completeSet()

      const state = useWorkoutStore.getState()
      expect(state.exercises[0].sets[0].completed).toBe(true)
      expect(state.currentSetIndex).toBe(0)
      expect(state.restTimerStarted).toBe(true)
      expect(state.restTimerRunning).toBe(true)
      expect(state.restSecondsRemaining).toBe(90)
      expect(state.restTotalSeconds).toBe(90)
    })

    it('advances to next set after finishing rest', () => {
      useWorkoutStore.getState().initializeWorkout('b1', 'Test', mockBlockExercises, 'test-cycle-id')
      useWorkoutStore.getState().completeSet()
      useWorkoutStore.getState().finishSetRest()

      const state = useWorkoutStore.getState()
      expect(state.currentSetIndex).toBe(1)
      expect(state.restTimerStarted).toBe(false)
    })

    it('advances to next exercise when all sets completed', () => {
      useWorkoutStore.getState().initializeWorkout('b1', 'Test', [
        { ...mockBlockExercises[0], series_objetivo: 1 },
        {
          id: 'be2',
          block_id: 'b1',
          global_exercise_id: 'g2',
          user_exercise_id: null,
          series_objetivo: 1,
          reps_objetivo_min: 10,
          reps_objetivo_max: 15,
          rpe_objetivo: 8,
          descanso_segundos: 60,
          exercise: {
            id: 'g2',
            nombre: 'Aperturas',
            grupoMuscular: 'Pecho' as const,
            equipo: 'Mancuernas',
            variaciones: null,
            isCustom: false,
          },
        },
      ], 'test-cycle-id')

      useWorkoutStore.getState().completeSet()
      useWorkoutStore.getState().finishSetRest()

      const state = useWorkoutStore.getState()
      expect(state.phase).toBe('exercising')
      expect(state.currentExerciseIndex).toBe(1)
    })

    it('shows celebration when last exercise completed', () => {
      useWorkoutStore.getState().initializeWorkout('b1', 'Test', [
        { ...mockBlockExercises[0], series_objetivo: 1 },
      ], 'test-cycle-id')

      useWorkoutStore.getState().completeSet()
      useWorkoutStore.getState().finishSetRest()

      const state = useWorkoutStore.getState()
      expect(state.phase).toBe('celebrating')
    })

    it('starts rest timer manually', () => {
      useWorkoutStore.getState().initializeWorkout('b1', 'Test', mockBlockExercises, 'test-cycle-id')
      useWorkoutStore.getState().startRestTimer(90)

      const state = useWorkoutStore.getState()
      expect(state.restSecondsRemaining).toBe(90)
      expect(state.restTimerRunning).toBe(true)
      expect(state.restTimerStarted).toBe(true)
    })

    it('ticks rest timer', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValueOnce(now).mockReturnValueOnce(now + 1500)

      useWorkoutStore.getState().initializeWorkout('b1', 'Test', mockBlockExercises, 'test-cycle-id')
      useWorkoutStore.getState().startRestTimer(90)
      useWorkoutStore.getState().tickRestTimer()

      vi.restoreAllMocks()
      expect(useWorkoutStore.getState().restSecondsRemaining).toBe(89)
    })

    it('pauses and resumes rest timer', () => {
      useWorkoutStore.getState().initializeWorkout('b1', 'Test', mockBlockExercises, 'test-cycle-id')
      useWorkoutStore.getState().startRestTimer(90)

      useWorkoutStore.getState().pauseRestTimer()
      expect(useWorkoutStore.getState().restTimerRunning).toBe(false)

      useWorkoutStore.getState().resumeRestTimer()
      expect(useWorkoutStore.getState().restTimerRunning).toBe(true)
    })
  })
})
