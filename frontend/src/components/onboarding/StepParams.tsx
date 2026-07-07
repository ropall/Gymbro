import { useOnboardingStore } from '../../stores/onboardingStore'

export function StepParams() {
  const days = useOnboardingStore((s) => s.days)
  const updateExerciseParams = useOnboardingStore((s) => s.updateExerciseParams)

  const trainingDays = days
    .map((d, i) => ({ ...d, index: i }))
    .filter((d) => !d.isRest && d.exercises.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-brand-primaryText mb-2 font-heading">
          Parámetros de entrenamiento
        </h3>
        <p className="text-brand-mutedText text-sm mb-4">
          Ajusta series, repeticiones, RPE objetivo y descanso para cada ejercicio.
        </p>
      </div>

      {trainingDays.length === 0 && (
        <p className="text-brand-mutedText text-sm">No hay ejercicios seleccionados.</p>
      )}

      <div className="space-y-4">
        {trainingDays.map((day) => (
          <div
            key={day.index}
            className="bg-brand-card border border-brand-border rounded-xl p-4 space-y-3"
          >
            <h4 className="text-brand-primaryText font-bold font-heading">
              Día {day.index + 1}
            </h4>

            <div className="space-y-3">
              {day.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-brand-dark border border-brand-border rounded-lg p-3 space-y-2"
                >
                  <p className="text-brand-primaryText text-sm font-medium">{ex.nombre}</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-brand-mutedText text-[10px] uppercase tracking-wider">
                        Series
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={ex.series || ''}
                        onChange={(e) =>
                          updateExerciseParams(day.index, ex.id, {
                            series: Number(e.target.value),
                          })
                        }
                        className="w-full bg-brand-card border border-brand-border rounded px-2 py-1.5 text-brand-primaryText text-sm min-h-[40px]"
                      />
                    </div>
                    <div>
                      <label className="text-brand-mutedText text-[10px] uppercase tracking-wider">
                        Descanso (s)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={15}
                        value={ex.descanso || ''}
                        onChange={(e) =>
                          updateExerciseParams(day.index, ex.id, {
                            descanso: Number(e.target.value),
                          })
                        }
                        className="w-full bg-brand-card border border-brand-border rounded px-2 py-1.5 text-brand-primaryText text-sm min-h-[40px]"
                      />
                    </div>
                    <div>
                      <label className="text-brand-mutedText text-[10px] uppercase tracking-wider">
                        Rep min
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={ex.repsMin || ''}
                        onChange={(e) =>
                          updateExerciseParams(day.index, ex.id, {
                            repsMin: Number(e.target.value),
                          })
                        }
                        className="w-full bg-brand-card border border-brand-border rounded px-2 py-1.5 text-brand-primaryText text-sm min-h-[40px]"
                      />
                    </div>
                    <div>
                      <label className="text-brand-mutedText text-[10px] uppercase tracking-wider">
                        Rep max
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={ex.repsMax || ''}
                        onChange={(e) =>
                          updateExerciseParams(day.index, ex.id, {
                            repsMax: Number(e.target.value),
                          })
                        }
                        className="w-full bg-brand-card border border-brand-border rounded px-2 py-1.5 text-brand-primaryText text-sm min-h-[40px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-brand-mutedText text-[10px] uppercase tracking-wider">
                        RPE objetivo (1-10)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={ex.rpe || ''}
                        onChange={(e) =>
                          updateExerciseParams(day.index, ex.id, {
                            rpe: Number(e.target.value),
                          })
                        }
                        className="w-full bg-brand-card border border-brand-border rounded px-2 py-1.5 text-brand-primaryText text-sm min-h-[40px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
