import { useWorkoutStore } from '../../stores/workoutStore'

interface ExerciseInfoProps {
  blockName: string
  totalExercises: number
}

export function ExerciseInfo({ blockName, totalExercises }: ExerciseInfoProps) {
  const exercises = useWorkoutStore((s) => s.exercises)
  const currentExerciseIndex = useWorkoutStore((s) => s.currentExerciseIndex)
  const completedCount = exercises.filter((e) => e.completed).length

  const currentExercise = exercises[currentExerciseIndex]
  if (!currentExercise) return null

  const be = currentExercise.blockExercise
  const exerciseName = be.exercise?.nombre ?? 'Ejercicio'

  return (
    <div className="space-y-4">
      {/* Block name and progress */}
      <div className="text-center">
        <h2 className="text-brand-lightAccent text-sm font-bold uppercase tracking-wide">
          {blockName}
        </h2>
        <p className="text-brand-primaryText text-lg font-bold font-heading">
          Ejercicio {currentExerciseIndex + 1} de {totalExercises}
        </p>
      </div>

      {/* Exercise name */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4">
        <h1 className="text-brand-primaryText text-2xl font-bold font-heading text-center mb-3">
          {exerciseName}
        </h1>

        {/* Exercise params */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-brand-dark rounded-lg p-3 text-center">
            <p className="text-brand-mutedText text-xs">Series</p>
            <p className="text-brand-primaryText text-lg font-bold">{be.series_objetivo}</p>
          </div>
          <div className="bg-brand-dark rounded-lg p-3 text-center">
            <p className="text-brand-mutedText text-xs">Reps</p>
            <p className="text-brand-primaryText text-lg font-bold">
              {be.reps_objetivo_min}-{be.reps_objetivo_max ?? '?'}
            </p>
          </div>
          <div className="bg-brand-dark rounded-lg p-3 text-center">
            <p className="text-brand-mutedText text-xs">RPE</p>
            <p className="text-brand-primaryText text-lg font-bold">{be.rpe_objetivo ?? '—'}</p>
          </div>
          <div className="bg-brand-dark rounded-lg p-3 text-center">
            <p className="text-brand-mutedText text-xs">Descanso</p>
            <p className="text-brand-primaryText text-lg font-bold">{be.descanso_segundos ?? '—'}s</p>
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-brand-card border border-brand-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-brand-mutedText text-xs">Progreso del bloque</span>
          <span className="text-brand-lightAccent text-xs font-bold">
            {completedCount}/{totalExercises}
          </span>
        </div>
        <div className="w-full bg-brand-dark rounded-full h-2 overflow-hidden">
          <div
            className="bg-brand-accent h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / totalExercises) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
