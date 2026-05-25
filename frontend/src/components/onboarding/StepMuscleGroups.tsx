import { useState } from 'react'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { ExercisePickerModal } from './ExercisePickerModal'
import { Plus, Dumbbell } from 'lucide-react'

export function StepMuscleGroups() {
  const days = useOnboardingStore((s) => s.days)

  const [pickerDayIndex, setPickerDayIndex] = useState<number | null>(null)

  const trainingDayIndices = days
    .map((d, i) => ({ ...d, index: i }))
    .filter((d) => !d.isRest)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-brand-primaryText mb-2 font-heading tracking-tight">
          Construye tu rutina
        </h3>
        <p className="text-brand-mutedText text-sm mb-4 leading-relaxed">
          Crea los ejercicios para cada día de entrenamiento. El sistema detectará automáticamente los grupos musculares.
        </p>
      </div>

      {trainingDayIndices.length === 0 && (
        <p className="text-brand-mutedText text-sm">No hay días de entrenamiento configurados. Vuelve al paso anterior y selecciona al menos un día.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {trainingDayIndices.map((day) => {
          const dayNumber = String(day.index + 1).padStart(2, '0')
          const hasExercises = day.exercises.length > 0

          return (
            <div
              key={day.index}
              className="relative flex flex-col items-center bg-brand-card border border-brand-border rounded-3xl px-5 py-6 transition-all hover:border-brand-accent/60 hover:shadow-[0_0_32px_rgba(45,135,78,0.45)]"
              style={{
                boxShadow: '0 4px 20px rgba(45, 135, 78, 0.08), 0 1px 3px rgba(45, 135, 78, 0.06)',
                minHeight: '340px',
              }}
            >
              {/* Etiqueta Día */}
              <div className="w-full flex justify-start mb-2">
                <span className="inline-block bg-white/90 text-black text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                  Día
                </span>
              </div>

              {/* Número del día — centrado, grande */}
              <div className="flex items-center justify-center flex-1 w-full">
                <span className="font-heading font-black tabular-nums select-none text-brand-mutedText/60"
                  style={{ fontSize: 'clamp(5rem, 14vw, 8rem)', lineHeight: 1 }}>
                  {dayNumber}
                </span>
              </div>

              {/* Información */}
              <div className="w-full text-left space-y-1.5 mb-5">
                <p className="text-sm font-medium text-brand-mutedText tracking-wide">
                  Grupo muscular:{day.muscleGroups.length > 0
                    ? ` ${day.muscleGroups.join(', ')}`
                    : ''}
                </p>

                {hasExercises ? (
                  <div className="flex items-center gap-1.5 text-xs text-brand-secondaryText">
                    <Dumbbell className="w-3 h-3" />
                    <span>
                      {day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-brand-mutedText/60">Sin ejercicios asignados</p>
                )}
              </div>

              {/* Botón */}
              <button
                onClick={() => setPickerDayIndex(day.index)}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-brand-accent text-white px-4 py-3 rounded-2xl text-sm font-semibold active:bg-brand-lightAccent transition-colors shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                {hasExercises ? 'Editar' : 'Crear'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Exercise Picker Modal */}
      {pickerDayIndex !== null && (
        <ExercisePickerModal
          dayIndex={pickerDayIndex}
          isOpen={true}
          onClose={() => setPickerDayIndex(null)}
        />
      )}
    </div>
  )
}
