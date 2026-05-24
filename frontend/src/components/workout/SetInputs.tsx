import { useWorkoutStore } from '../../stores/workoutStore'

interface SetInputsProps {
  onNextSet: () => void
  onSkipRestWarning: () => void
}

export function SetInputs({ onNextSet, onSkipRestWarning }: SetInputsProps) {
  const exercises = useWorkoutStore((s) => s.exercises)
  const currentExerciseIndex = useWorkoutStore((s) => s.currentExerciseIndex)
  const restSecondsRemaining = useWorkoutStore((s) => s.restSecondsRemaining)
  const restTimerRunning = useWorkoutStore((s) => s.restTimerRunning)
  const restTimerStarted = useWorkoutStore((s) => s.restTimerStarted)
  const restWarningDismissed = useWorkoutStore((s) => s.restWarningDismissed)
  const updateSetWeight = useWorkoutStore((s) => s.updateSetWeight)
  const updateSetRpe = useWorkoutStore((s) => s.updateSetRpe)
  const startRestTimer = useWorkoutStore((s) => s.startRestTimer)
  const dismissRestWarning = useWorkoutStore((s) => s.dismissRestWarning)
  const advanceToNextExercise = useWorkoutStore((s) => s.advanceToNextExercise)

  const currentExercise = exercises[currentExerciseIndex]
  if (!currentExercise) return null

  // Find the most recently completed set that needs weight/RPE entry
  const completedSetIndex = [...currentExercise.sets].reverse().findIndex(
    (s) => s.completed
  )
  const lastCompletedIdx = completedSetIndex >= 0
    ? currentExercise.sets.length - 1 - completedSetIndex
    : -1

  if (lastCompletedIdx < 0) return null

  const currentSet = currentExercise.sets[lastCompletedIdx]

  const allSetsCompleted = currentExercise.sets.every((s) => s.completed)
  const restSuggested = currentExercise.blockExercise.descanso_segundos ?? 60
  const canProceed = restWarningDismissed || !restTimerStarted || restSecondsRemaining === 0

  const handleNextSet = () => {
    if (restTimerStarted && restSecondsRemaining > 0 && !restWarningDismissed) {
      return
    }
    if (allSetsCompleted) {
      advanceToNextExercise()
    } else {
      onNextSet()
    }
  }

  const handleStartRest = () => {
    startRestTimer(restSuggested)
  }

  const handleSkipRest = () => {
    dismissRestWarning()
    onSkipRestWarning()
  }

  return (
    <div className="space-y-4">
      {/* Weight input */}
      <div>
        <label htmlFor="weight-input" className="text-brand-mutedText text-xs font-bold uppercase tracking-wide block mb-2">
          Peso (kg)
        </label>
        <input
          id="weight-input"
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={currentSet.peso ?? ''}
          onChange={(e) => updateSetWeight(e.target.value ? parseFloat(e.target.value) : null, lastCompletedIdx)}
          className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-3 text-brand-primaryText text-lg font-bold min-h-[48px] focus:border-brand-lightAccent focus:outline-none"
        />
      </div>

      {/* RPE input */}
      <div>
        <label className="text-brand-mutedText text-xs font-bold uppercase tracking-wide block mb-2">
          RPE real
        </label>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((rpe) => (
            <button
              key={rpe}
              onClick={() => updateSetRpe(rpe, lastCompletedIdx)}
              className={`w-12 h-12 rounded-lg text-sm font-bold transition-colors min-w-[48px] ${
                currentSet.rpe_real === rpe
                  ? 'bg-brand-lightAccent text-brand-inverseText'
                  : 'bg-brand-dark border border-brand-border text-brand-primaryText active:bg-brand-card'
              }`}
            >
              {rpe}
            </button>
          ))}
        </div>
      </div>

      {/* Rest timer start or next set button */}
      {!restTimerStarted ? (
        <button
          onClick={handleStartRest}
          className="w-full bg-brand-accent text-white py-4 rounded-xl text-lg font-bold min-h-[48px] active:bg-brand-lightAccent transition-colors"
        >
          Iniciar descanso ({restSuggested}s)
        </button>
      ) : (
        <>
          {/* Rest warning modal */}
          {restTimerRunning && restSecondsRemaining > 0 && !restWarningDismissed && (
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
                      dismissRestWarning()
                      onSkipRestWarning()
                    }}
                    className="flex-1 bg-brand-dark border border-brand-border text-brand-primaryText py-3 rounded-lg font-bold min-h-[48px] active:bg-brand-card transition-colors"
                  >
                    Esperar
                  </button>
                  <button
                    onClick={handleSkipRest}
                    className="flex-1 bg-brand-accent text-white py-3 rounded-lg font-bold min-h-[48px] active:bg-brand-lightAccent transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleNextSet}
            disabled={!canProceed}
            className={`w-full py-4 rounded-xl text-lg font-bold min-h-[48px] transition-colors ${
              canProceed
                ? 'bg-brand-accent text-white active:bg-brand-lightAccent'
                : 'bg-brand-dark border border-brand-border text-brand-mutedText cursor-not-allowed'
            }`}
          >
            {allSetsCompleted ? 'Siguiente ejercicio →' : 'Siguiente serie →'}
          </button>
        </>
      )}
    </div>
  )
}
