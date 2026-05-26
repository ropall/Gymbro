import { useState } from 'react'
import { useWorkoutStore } from '../../stores/workoutStore'

interface RecoveryChecklistProps {
  onFinish: () => void
}

export function RecoveryChecklist({ onFinish }: RecoveryChecklistProps) {
  const energyLevel = useWorkoutStore((s) => s.energyLevel)
  const supplements = useWorkoutStore((s) => s.supplements)
  const exercises = useWorkoutStore((s) => s.exercises)
  const setEnergyLevel = useWorkoutStore((s) => s.setEnergyLevel)
  const toggleSupplement = useWorkoutStore((s) => s.toggleSupplement)
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const completedSetsCount = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  )

  const canFinish = energyLevel !== null && completedSetsCount > 0

  const handleFinish = async () => {
    if (!canFinish) return
    setSaving(true)
    setError(null)
    try {
      await finishWorkout()
      onFinish()
    } catch (err: any) {
      setSaving(false)
      setError(err.message ?? 'Error al guardar el entrenamiento')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-brand-primaryText text-2xl font-bold font-heading mb-1">
          Recuperación
        </h2>
        <p className="text-brand-mutedText text-sm">
          ¿Cómo te sientes después del entrenamiento?
        </p>
      </div>

      {/* Energy level */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4">
        <label className="text-brand-mutedText text-xs font-bold uppercase tracking-wide block mb-3">
          Nivel de energía <span className="text-brand-danger">*</span>
        </label>
        <div className="flex gap-2 flex-wrap justify-center">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
            <button
              key={level}
              onClick={() => setEnergyLevel(level)}
              className={`w-12 h-12 rounded-lg text-sm font-bold transition-colors min-w-[48px] ${
                energyLevel === level
                  ? 'bg-brand-lightAccent text-brand-inverseText'
                  : 'bg-brand-dark border border-brand-border text-brand-primaryText active:bg-brand-card'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-1 px-1">
          <span className="text-brand-mutedText text-xs">Bajo</span>
          <span className="text-brand-mutedText text-xs">Alto</span>
        </div>
      </div>

      {/* Supplements */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4">
        <label className="text-brand-mutedText text-xs font-bold uppercase tracking-wide block mb-3">
          Suplementos tomados (opcional)
        </label>
        <div className="space-y-3">
          {[
            { key: 'creatina' as const, label: 'Creatina' },
            { key: 'proteina' as const, label: 'Proteína' },
            { key: 'glicinato_magnesio' as const, label: 'Glicinato de magnesio' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleSupplement(key)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border min-h-[48px] transition-colors ${
                supplements[key]
                  ? 'bg-brand-accent/20 border-brand-accent'
                  : 'bg-brand-dark border-brand-border'
              }`}
            >
              <div
                className={`w-6 h-6 rounded flex items-center justify-center ${
                  supplements[key] ? 'bg-brand-accent' : 'bg-brand-card border border-brand-border'
                }`}
              >
                {supplements[key] && (
                  <span className="text-brand-primaryText text-sm">✓</span>
                )}
              </div>
              <span className="text-brand-primaryText text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Validation messages */}
      {completedSetsCount === 0 && (
        <div className="p-3 bg-brand-dangerBg border border-brand-dangerBorder rounded-lg text-brand-danger text-sm">
          No has completado ninguna serie. Vuelve al entrenamiento para registrar al menos una serie.
        </div>
      )}
      {error && (
        <div className="p-3 bg-brand-dangerBg border border-brand-dangerBorder rounded-lg text-brand-danger text-sm">
          {error}
        </div>
      )}

      {/* Finish button */}
      <button
        onClick={handleFinish}
        disabled={!canFinish || saving}
        className={`w-full py-4 rounded-xl text-lg font-bold min-h-[48px] transition-colors ${
          canFinish && !saving
            ? 'bg-brand-accent text-white active:bg-brand-lightAccent'
            : 'bg-brand-dark border border-brand-border text-brand-mutedText cursor-not-allowed'
        }`}
      >
        {saving ? 'Guardando...' : 'Finalizar entrenamiento'}
      </button>
    </div>
  )
}
