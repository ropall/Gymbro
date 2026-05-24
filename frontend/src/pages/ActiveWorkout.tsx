import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkoutStore } from '../stores/workoutStore'
import { useRoutineStore } from '../stores/routineStore'
import { ExerciseInfo } from '../components/workout/ExerciseInfo'
import { SetTracker } from '../components/workout/SetTracker'
import { SetInputs } from '../components/workout/SetInputs'
import { RestTimer } from '../components/workout/RestTimer'
import { CelebrationScreen } from '../components/workout/CelebrationScreen'
import { RecoveryChecklist } from '../components/workout/RecoveryChecklist'

export function ActiveWorkout() {
  const { blockId } = useParams<{ blockId: string }>()
  const navigate = useNavigate()

  const phase = useWorkoutStore((s) => s.phase)
  const blockName = useWorkoutStore((s) => s.blockName)
  const exercises = useWorkoutStore((s) => s.exercises)
  const currentExerciseIndex = useWorkoutStore((s) => s.currentExerciseIndex)
  const currentSetIndex = useWorkoutStore((s) => s.currentSetIndex)
  const restTimerStarted = useWorkoutStore((s) => s.restTimerStarted)
  const restTimerRunning = useWorkoutStore((s) => s.restTimerRunning)
  const restSecondsRemaining = useWorkoutStore((s) => s.restSecondsRemaining)
  const restWarningDismissed = useWorkoutStore((s) => s.restWarningDismissed)

  const initializeWorkout = useWorkoutStore((s) => s.initializeWorkout)
  const completeSet = useWorkoutStore((s) => s.completeSet)
  const advanceToNextExercise = useWorkoutStore((s) => s.advanceToNextExercise)
  const setPhase = useWorkoutStore((s) => s.setPhase)
  const reset = useWorkoutStore((s) => s.reset)

  const blocks = useRoutineStore((s) => s.blocks)
  const blockExercises = useRoutineStore((s) => s.blockExercises)
  const loadBlocksAndCycle = useRoutineStore((s) => s.loadBlocksAndCycle)

  useEffect(() => {
    loadBlocksAndCycle()
  }, [loadBlocksAndCycle])

  useEffect(() => {
    if (!blockId || blocks.length === 0) return

    const block = blocks.find((b) => b.id === blockId)
    if (!block) return

    const blockExs = blockExercises.filter((e) => e.block_id === blockId)
    if (blockExs.length === 0) return

    initializeWorkout(block.id, block.nombre, blockExs)
  }, [blockId, blocks, blockExercises, initializeWorkout])

  const handleSetComplete = useCallback(() => {
    completeSet()
  }, [completeSet])

  const handleNextSet = useCallback(() => {
    const currentExercise = exercises[currentExerciseIndex]
    if (!currentExercise) return

    const allSetsCompleted = currentExercise.sets.every((s) => s.completed)
    if (allSetsCompleted) {
      advanceToNextExercise()
    }
  }, [exercises, currentExerciseIndex, advanceToNextExercise])

  const handleSkipRestWarning = useCallback(() => {
    const currentExercise = exercises[currentExerciseIndex]
    if (!currentExercise) return

    const allSetsCompleted = currentExercise.sets.every((s) => s.completed)
    if (allSetsCompleted) {
      advanceToNextExercise()
    }
  }, [exercises, currentExerciseIndex, advanceToNextExercise])

  const handleTimerComplete = useCallback(() => {
    // Timer finished, user can now proceed
  }, [])

  const handleCelebrationContinue = useCallback(() => {
    setPhase('recovery')
  }, [setPhase])

  const handleRecoveryFinish = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleCancel = useCallback(() => {
    reset()
    navigate('/rutinas')
  }, [reset, navigate])

  if (!blockId || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
          Cargando entrenamiento...
        </div>
      </div>
    )
  }

  const currentExercise = exercises[currentExerciseIndex]
  const currentSet = currentExercise?.sets[currentSetIndex]
  const showRestTimer = restTimerStarted && !currentSet?.completed

  return (
    <div className="min-h-screen bg-brand-dark">
      {phase === 'celebrating' && (
        <CelebrationScreen onContinue={handleCelebrationContinue} />
      )}

      {phase === 'recovery' && (
        <div className="p-4 pb-8 max-w-lg mx-auto">
          <RecoveryChecklist onFinish={handleRecoveryFinish} />
        </div>
      )}

      {phase === 'exercising' && (
        <div className="p-4 pb-8 max-w-lg mx-auto space-y-6">
          {/* Cancel button */}
          <div className="flex justify-end">
            <button
              onClick={handleCancel}
              className="text-brand-mutedText text-sm font-medium min-h-[48px] px-3 active:text-brand-primaryText transition-colors"
            >
              Cancelar
            </button>
          </div>

          {/* Exercise info */}
          <ExerciseInfo
            blockName={blockName}
            totalExercises={exercises.length}
          />

          {/* Set tracker */}
          <SetTracker onSetComplete={handleSetComplete} />

          {/* Rest timer */}
          {showRestTimer && (
            <RestTimer onTimerComplete={handleTimerComplete} />
          )}

          {/* Set inputs (weight + RPE) */}
          {currentSet?.completed && (
            <SetInputs
              onNextSet={handleNextSet}
              onSkipRestWarning={handleSkipRestWarning}
            />
          )}

          {/* Rest warning overlay */}
          {restTimerRunning && restSecondsRemaining > 0 && !restWarningDismissed && currentSet?.completed && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-brand-card border border-brand-border rounded-xl p-6 max-w-sm w-full">
                <h3 className="text-brand-primaryText font-bold text-lg mb-2">
                  ¡Descanso en progreso!
                </h3>
                <p className="text-brand-mutedText text-sm mb-4">
                  Aún faltan {restSecondsRemaining} segundos de descanso. ¿Continuar de todos modos?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      useWorkoutStore.getState().dismissRestWarning()
                    }}
                    className="flex-1 bg-brand-dark border border-brand-border text-brand-primaryText py-3 rounded-lg font-bold min-h-[48px] active:bg-brand-card transition-colors"
                  >
                    Esperar
                  </button>
                  <button
                    onClick={handleSkipRestWarning}
                    className="flex-1 bg-brand-accent text-white py-3 rounded-lg font-bold min-h-[48px] active:bg-brand-lightAccent transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
