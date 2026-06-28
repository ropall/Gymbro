import { useWorkoutStore } from '../../stores/workoutStore'

interface SetTrackerProps {
  onSetComplete: () => void
}

export function SetTracker({ onSetComplete }: SetTrackerProps) {
  const exercises = useWorkoutStore((s) => s.exercises)
  const currentExerciseIndex = useWorkoutStore((s) => s.currentExerciseIndex)
  const currentSetIndex = useWorkoutStore((s) => s.currentSetIndex)
  const restTimerStarted = useWorkoutStore((s) => s.restTimerStarted)
  const previousSets = useWorkoutStore((s) => s.previousSets)

  const currentExercise = exercises[currentExerciseIndex]
  if (!currentExercise) return null

  const prevSetsForExercise = previousSets[currentExercise.blockExercise.id] ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-brand-mutedText text-xs font-bold uppercase tracking-wider">
          Series
        </h3>
        <span className="text-xs text-brand-mutedText">
          {currentExercise.sets.filter((s) => s.completed).length} / {currentExercise.sets.length}
        </span>
      </div>

      <div className="space-y-2">
        {currentExercise.sets.map((set, idx) => {
          const isCurrent = idx === currentSetIndex
          const isCompleted = set.completed
          const isPast = idx < currentSetIndex
          const prev = prevSetsForExercise[idx]

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-[10px] border transition-all ${
                isCurrent
                  ? 'bg-brand-lightAccent/10 border-brand-lightAccent'
                  : isCompleted || isPast
                    ? 'bg-brand-accent/15 border-brand-accent/40'
                    : 'bg-brand-card border-brand-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isCompleted
                      ? 'bg-brand-accent text-white'
                      : isCurrent
                        ? 'bg-brand-lightAccent text-brand-inverseText'
                        : 'bg-brand-dark text-brand-mutedText'
                  }`}
                >
                  {isCompleted ? '✓' : set.orden}
                </div>
                <div>
                  <span className={`text-sm font-medium ${isCompleted ? 'text-brand-lightAccent' : 'text-brand-primaryText'}`}>
                    Serie {set.orden}
                  </span>
                  {prev && (
                    <p className="text-[11px] text-brand-mutedText leading-tight mt-0.5">
                      Ant:{' '}
                      {prev.peso != null ? `${prev.peso}kg` : '—'}
                      {prev.reps_reales != null ? ` × ${prev.reps_reales}` : ''}
                    </p>
                  )}
                </div>
              </div>

              {isCurrent && !restTimerStarted && (
                <button
                  onClick={onSetComplete}
                  className="btn-primary h-9 px-4 text-[13px]"
                >
                  Completar
                </button>
              )}

              {isCompleted && (
                <span className="text-brand-lightAccent text-xs font-medium tabular-nums">
                  {set.peso ? `${set.peso}kg` : '—'}
                  {set.reps_reales ? ` × ${set.reps_reales}` : ''}
                  {set.rpe_real ? ` · RPE ${set.rpe_real}` : ''}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
