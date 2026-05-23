import { useWorkoutStore } from '../../stores/workoutStore'

interface SetTrackerProps {
  onSetComplete: () => void
}

export function SetTracker({ onSetComplete }: SetTrackerProps) {
  const exercises = useWorkoutStore((s) => s.exercises)
  const currentExerciseIndex = useWorkoutStore((s) => s.currentExerciseIndex)
  const currentSetIndex = useWorkoutStore((s) => s.currentSetIndex)
  const restTimerStarted = useWorkoutStore((s) => s.restTimerStarted)

  const currentExercise = exercises[currentExerciseIndex]
  if (!currentExercise) return null

  return (
    <div className="space-y-2">
      <h3 className="text-brand-mutedText text-sm font-bold uppercase tracking-wide">Series</h3>
      {currentExercise.sets.map((set, idx) => {
        const isCurrent = idx === currentSetIndex
        const isCompleted = set.completed
        const isPast = idx < currentSetIndex

        return (
          <div
            key={idx}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              isCurrent
                ? 'bg-brand-lightAccent/10 border-brand-lightAccent'
                : isCompleted || isPast
                  ? 'bg-brand-accent/20 border-brand-accent/50'
                  : 'bg-brand-card border-brand-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isCompleted
                    ? 'bg-brand-accent text-white'
                    : isCurrent
                      ? 'bg-brand-lightAccent text-brand-dark'
                      : 'bg-brand-dark text-brand-mutedText'
                }`}
              >
                {isCompleted ? '✓' : set.orden}
              </div>
              <span className={`text-sm font-medium ${isCompleted ? 'text-brand-lightAccent' : 'text-white'}`}>
                Serie {set.orden}
              </span>
            </div>

            {isCurrent && !restTimerStarted && (
              <button
                onClick={onSetComplete}
                className="bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-bold min-h-[48px] active:bg-brand-lightAccent transition-colors"
              >
                Completar
              </button>
            )}

            {isCompleted && (
              <span className="text-brand-lightAccent text-xs font-medium">
                {set.peso ? `${set.peso}kg` : '—'}
                {set.rpe_real ? ` · RPE ${set.rpe_real}` : ''}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
