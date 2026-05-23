import { useOnboardingStore } from '../../stores/onboardingStore'
import { ONBOARDING_MUSCLE_GROUP_LABELS, ONBOARDING_MUSCLE_GROUPS } from '../../types'
import type { MuscleGroup } from '../../types'

export function StepMuscleGroups() {
  const days = useOnboardingStore((s) => s.days)
  const toggleMuscleGroup = useOnboardingStore((s) => s.toggleMuscleGroup)

  const trainingDayIndices = days
    .map((d, i) => ({ ...d, index: i }))
    .filter((d) => !d.isRest)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-2 font-[Montserrat]">
          Grupos musculares por día
        </h3>
        <p className="text-brand-mutedText text-sm mb-4">
          Secciona los grupos musculares que quieres trabajar en cada día de entrenamiento.
        </p>
      </div>

      {trainingDayIndices.length === 0 && (
        <p className="text-brand-mutedText text-sm">No hay días de entrenamiento configurados.</p>
      )}

      <div className="space-y-4">
        {trainingDayIndices.map((day) => (
          <div
            key={day.index}
            className="bg-brand-card border border-brand-border rounded-xl p-4"
          >
            <h4 className="text-white font-bold mb-3 font-[Montserrat]">
              Día {day.index + 1}
            </h4>
            <div className="flex flex-wrap gap-2">
              {ONBOARDING_MUSCLE_GROUPS.map((label) => {
                const group = ONBOARDING_MUSCLE_GROUP_LABELS[label] as MuscleGroup
                const isActive = day.muscleGroups.includes(group)
                return (
                  <button
                    key={label}
                    onClick={() => toggleMuscleGroup(day.index, group)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      isActive
                        ? 'bg-brand-accent text-white border-brand-accent'
                        : 'bg-brand-dark text-brand-mutedText border-brand-border hover:text-white'
                    }`}
                    aria-pressed={isActive}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {day.muscleGroups.length === 0 && (
              <p className="text-brand-mutedText text-xs mt-2">Selecciona al menos un grupo muscular.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
