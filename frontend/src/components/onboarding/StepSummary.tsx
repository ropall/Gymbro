import { useOnboardingStore } from '../../stores/onboardingStore'

export function StepSummary() {
  const days = useOnboardingStore((s) => s.days)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-brand-primaryText mb-2 font-heading">
          Resumen de tu rutina
        </h3>
        <p className="text-brand-mutedText text-sm mb-4">
          Revisa cómo quedó tu ciclo de 7 días antes de guardarlo.
        </p>
      </div>

      <div className="space-y-3">
        {days.map((day, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 ${
              day.isRest
                ? 'bg-brand-card border-brand-border opacity-70'
                : 'bg-brand-card border-brand-lightAccent/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-brand-primaryText font-bold font-heading">
                Día {i + 1}
              </h4>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  day.isRest
                    ? 'bg-brand-border text-brand-mutedText'
                    : 'bg-brand-accent/20 text-brand-lightAccent'
                }`}
              >
                {day.isRest ? 'Descanso' : 'Entrenamiento'}
              </span>
            </div>

            {!day.isRest && day.muscleGroups.length > 0 && (
              <p className="text-brand-mutedText text-xs mb-2">
                {day.muscleGroups.join(', ')}
              </p>
            )}

            {!day.isRest && (
              <div className="space-y-2">
                {day.exercises.length === 0 ? (
                  <p className="text-brand-mutedText text-xs">Sin ejercicios asignados.</p>
                ) : (
                  day.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="bg-brand-dark border border-brand-border rounded-lg p-2 text-sm"
                    >
                      <p className="text-brand-primaryText font-medium">{ex.nombre}</p>
                      <p className="text-brand-mutedText text-xs">
                        {ex.series} series · {ex.repsMin}-{ex.repsMax} reps · RPE {ex.rpe} ·{' '}
                        {ex.descanso}s descanso
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
