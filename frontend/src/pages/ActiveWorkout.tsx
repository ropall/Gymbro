import { useEffect, useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkoutStore } from '../stores/workoutStore'
import { useRoutineStore } from '../stores/routineStore'
import { ExerciseInfo } from '../components/workout/ExerciseInfo'
import { SetTracker } from '../components/workout/SetTracker'
import { RestTimerModal } from '../components/workout/RestTimerModal'
import { CelebrationScreen } from '../components/workout/CelebrationScreen'
import { RecoveryChecklist } from '../components/workout/RecoveryChecklist'

export function ActiveWorkout() {
  const { blockId } = useParams<{ blockId: string }>()
  const navigate = useNavigate()

  const phase = useWorkoutStore((s) => s.phase)
  const blockName = useWorkoutStore((s) => s.blockName)
  const exercises = useWorkoutStore((s) => s.exercises)

  const initializeWorkout = useWorkoutStore((s) => s.initializeWorkout)
  const loadPreviousSession = useWorkoutStore((s) => s.loadPreviousSession)
  const completeSet = useWorkoutStore((s) => s.completeSet)
  const setPhase = useWorkoutStore((s) => s.setPhase)
  const reset = useWorkoutStore((s) => s.reset)

  const blocks = useRoutineStore((s) => s.blocks)
  const cycle = useRoutineStore((s) => s.cycle)
  const blockExercises = useRoutineStore((s) => s.blockExercises)
  const loadBlocksAndCycle = useRoutineStore((s) => s.loadBlocksAndCycle)
  const advancePosition = useRoutineStore((s) => s.advancePosition)

  const [loadDone, setLoadDone] = useState(false)

  useEffect(() => {
    loadBlocksAndCycle().finally(() => setLoadDone(true))
  }, [loadBlocksAndCycle])

  useEffect(() => {
    // Wait until the routine + cycle have finished loading before deciding anything,
    // otherwise we'd act on the initial empty state.
    if (!loadDone) return

    // No active cycle (e.g. the previous cycle just ended) → there's nothing to train.
    // Send the user to Rutinas to start a new cycle instead of hanging on "Cargando".
    if (!cycle?.activo) {
      navigate('/rutinas', { replace: true })
      return
    }

    const block = blocks.find((b) => b.id === blockId)
    const blockExs = block ? blockExercises.filter((e) => e.block_id === blockId) : []
    if (!block || blockExs.length === 0) {
      navigate('/rutinas', { replace: true })
      return
    }

    initializeWorkout(block.id, block.nombre, blockExs, cycle.id)
    loadPreviousSession(block.id)
  }, [loadDone, blockId, blocks, blockExercises, cycle?.activo, cycle?.id, initializeWorkout, loadPreviousSession, navigate])

  const handleSetComplete = useCallback(() => {
    completeSet()
  }, [completeSet])

  const handleCelebrationContinue = useCallback(() => {
    setPhase('recovery')
  }, [setPhase])

  const handleRecoveryFinish = useCallback(async () => {
    await advancePosition()
    navigate('/')
  }, [advancePosition, navigate])

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

          {/* Rest timer modal (appears automatically after completing a set) */}
          <RestTimerModal />
        </div>
      )}
    </div>
  )
}
