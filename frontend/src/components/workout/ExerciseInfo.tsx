import { useWorkoutStore } from '../../stores/workoutStore'
import { getWeightRecommendation } from '../../utils/weightRecommendation'

interface ExerciseInfoProps {
  blockName: string
  totalExercises: number
}

const RECOMMENDATION_STYLES = {
  subir: 'bg-brand-accent/15 border-brand-accent/40 text-brand-lightAccent',
  bajar: 'bg-brand-warningBg border-brand-warningBorder text-brand-warning',
  mantener: 'bg-brand-dark border-brand-border text-brand-mutedText',
} as const

const RECOMMENDATION_ICONS = {
  subir: '↑',
  bajar: '↓',
  mantener: '→',
} as const

export function ExerciseInfo({ blockName, totalExercises }: ExerciseInfoProps) {
  const exercises = useWorkoutStore((s) => s.exercises)
  const currentExerciseIndex = useWorkoutStore((s) => s.currentExerciseIndex)
  const previousSets = useWorkoutStore((s) => s.previousSets)
  const completedCount = exercises.filter((e) => e.completed).length

  const currentExercise = exercises[currentExerciseIndex]
  if (!currentExercise) return null

  const be = currentExercise.blockExercise
  const exerciseName = be.exercise?.nombre ?? 'Ejercicio'

  const recommendation = getWeightRecommendation(
    previousSets[be.id] ?? [],
    be.reps_objetivo_min,
    be.reps_objetivo_max
  )

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

        {/* Weight recommendation based on last session's actual reps vs target */}
        {recommendation && (
          <div
            className={`mt-3 rounded-lg p-3 border flex items-start gap-2 ${RECOMMENDATION_STYLES[recommendation.direction]}`}
          >
            <span className="text-lg font-bold leading-none">
              {RECOMMENDATION_ICONS[recommendation.direction]}
            </span>
            <p className="text-xs leading-snug">{recommendation.mensaje}</p>
          </div>
        )}
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
