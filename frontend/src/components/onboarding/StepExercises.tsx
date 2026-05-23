import { useEffect, useState } from 'react'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { useExerciseStore } from '../../stores/exerciseStore'
import type { MuscleGroup, WizardExercise } from '../../types'

export function StepExercises() {
  const days = useOnboardingStore((s) => s.days)
  const toggleExercise = useOnboardingStore((s) => s.toggleExercise)
  const globalExercises = useExerciseStore((s) => s.globalExercises)
  const customExercises = useExerciseStore((s) => s.customExercises)
  const loadData = useExerciseStore((s) => s.loadData)
  const addCustomExercise = useExerciseStore((s) => s.addCustomExercise)

  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({})
  const [showCustomForms, setShowCustomForms] = useState<Record<number, boolean>>({})
  const [customNames, setCustomNames] = useState<Record<number, string>>({})

  useEffect(() => {
    if (globalExercises.length === 0 && customExercises.length === 0) {
      loadData()
    }
  }, [loadData, globalExercises.length, customExercises.length])

  const allExercises = [...globalExercises, ...customExercises]

  const trainingDays = days
    .map((d, i) => ({ ...d, index: i }))
    .filter((d) => !d.isRest)

  function getSuggestions(dayIndex: number) {
    const day = days[dayIndex]
    if (day.muscleGroups.length === 0) return []
    return allExercises.filter((ex) => day.muscleGroups.includes(ex.grupoMuscular))
  }

  function getSearchResults(dayIndex: number) {
    const query = searchQueries[dayIndex]?.toLowerCase().trim() ?? ''
    if (!query) return []
    return allExercises.filter(
      (ex) =>
        ex.nombre.toLowerCase().includes(query) &&
        !days[dayIndex].exercises.find((e) => e.id === ex.id)
    )
  }

  function isSelected(dayIndex: number, id: string) {
    return days[dayIndex].exercises.some((e) => e.id === id)
  }

  function handleToggle(dayIndex: number, ex: { id: string; nombre: string; grupoMuscular: MuscleGroup; isCustom: boolean }) {
    const existing = days[dayIndex].exercises.find((e) => e.id === ex.id)
    if (existing) {
      toggleExercise(dayIndex, existing)
    } else {
      const wizardEx: WizardExercise = {
        id: ex.id,
        nombre: ex.nombre,
        grupoMuscular: ex.grupoMuscular,
        isCustom: ex.isCustom,
        series: 3,
        repsMin: 8,
        repsMax: 12,
        rpe: 7,
        descanso: 90,
      }
      toggleExercise(dayIndex, wizardEx)
    }
  }

  async function handleAddCustom(dayIndex: number) {
    const name = customNames[dayIndex]?.trim()
    if (!name) return
    const firstGroup = days[dayIndex].muscleGroups[0] ?? 'Pecho'
    await addCustomExercise({
      nombre: name,
      grupoMuscular: firstGroup,
      equipo: 'Sin equipo',
      variaciones: null,
    })
    // The new exercise should now be in customExercises after store update.
    // We need to find it and add to the day.
    const latestCustom = useExerciseStore.getState().customExercises.at(-1)
    if (latestCustom) {
      handleToggle(dayIndex, latestCustom)
    }
    setShowCustomForms((prev) => ({ ...prev, [dayIndex]: false }))
    setCustomNames((prev) => ({ ...prev, [dayIndex]: '' }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-2 font-[Montserrat]">
          Selecciona ejercicios
        </h3>
        <p className="text-brand-mutedText text-sm mb-4">
          Revisa las sugerencias, agrégales o descártalos para cada día.
        </p>
      </div>

      {trainingDays.map((day) => (
        <div
          key={day.index}
          className="bg-brand-card border border-brand-border rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-white font-bold font-[Montserrat]">
              Día {day.index + 1}
              {day.muscleGroups.length > 0 && (
                <span className="text-brand-mutedText text-sm font-normal ml-2">
                  ({day.muscleGroups.join(', ')})
                </span>
              )}
            </h4>
            <span className="text-xs text-brand-lightAccent">
              {day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Suggestions */}
          <div>
            <p className="text-brand-mutedText text-xs mb-2">Sugerencias</p>
            {day.muscleGroups.length === 0 ? (
              <p className="text-brand-mutedText text-sm">Selecciona grupos musculares primero.</p>
            ) : (
              <div className="space-y-2">
                {getSuggestions(day.index).map((ex) => (
                  <label
                    key={ex.id}
                    className="flex items-center gap-3 bg-brand-dark border border-brand-border rounded-lg p-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(day.index, ex.id)}
                      onChange={() => handleToggle(day.index, ex)}
                      className="w-5 h-5 accent-brand-accent rounded"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{ex.nombre}</p>
                      <p className="text-brand-mutedText text-xs">{ex.grupoMuscular}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Search more */}
          <div className="pt-2 border-t border-brand-border">
            <p className="text-brand-mutedText text-xs mb-2">Buscar más ejercicios</p>
            <input
              type="text"
              placeholder="Buscar en el catálogo..."
              value={searchQueries[day.index] ?? ''}
              onChange={(e) =>
                setSearchQueries((prev) => ({ ...prev, [day.index]: e.target.value }))
              }
              className="w-full bg-brand-dark border border-brand-border rounded px-3 py-2 text-white placeholder:text-brand-mutedText text-sm min-h-[44px]"
            />
            {searchQueries[day.index]?.trim() && (
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {getSearchResults(day.index).length === 0 ? (
                  <p className="text-brand-mutedText text-xs">No se encontraron resultados.</p>
                ) : (
                  getSearchResults(day.index).map((ex) => (
                    <label
                      key={ex.id}
                      className="flex items-center gap-3 bg-brand-dark border border-brand-border rounded-lg p-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected(day.index, ex.id)}
                        onChange={() => handleToggle(day.index, ex)}
                        className="w-5 h-5 accent-brand-accent rounded"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">{ex.nombre}</p>
                        <p className="text-brand-mutedText text-xs">{ex.grupoMuscular}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Inline custom exercise */}
          <div className="pt-2">
            {!showCustomForms[day.index] ? (
              <button
                onClick={() =>
                  setShowCustomForms((prev) => ({ ...prev, [day.index]: true }))
                }
                className="text-brand-lightAccent text-sm font-medium"
              >
                + Crear ejercicio personalizado
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre del ejercicio"
                  value={customNames[day.index] ?? ''}
                  onChange={(e) =>
                    setCustomNames((prev) => ({ ...prev, [day.index]: e.target.value }))
                  }
                  className="flex-1 bg-brand-dark border border-brand-border rounded px-3 py-2 text-white placeholder:text-brand-mutedText text-sm min-h-[44px]"
                />
                <button
                  onClick={() => handleAddCustom(day.index)}
                  className="bg-brand-accent text-white px-3 py-2 rounded text-sm font-medium active:bg-brand-lightAccent transition-colors"
                >
                  Agregar
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
