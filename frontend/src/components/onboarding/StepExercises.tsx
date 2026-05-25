import { useEffect, useState } from 'react'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { useExerciseStore } from '../../stores/exerciseStore'
import { MUSCLE_GROUPS } from '../../types'
import type { MuscleGroup, WizardExercise } from '../../types'
import { Search, X, Trash2 } from 'lucide-react'

export function StepExercises() {
  const days = useOnboardingStore((s) => s.days)
  const toggleExercise = useOnboardingStore((s) => s.toggleExercise)
  const globalExercises = useExerciseStore((s) => s.globalExercises)
  const customExercises = useExerciseStore((s) => s.customExercises)
  const loadData = useExerciseStore((s) => s.loadData)
  const addCustomExercise = useExerciseStore((s) => s.addCustomExercise)

  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({})
  const [activeFilters, setActiveFilters] = useState<Record<number, MuscleGroup | 'todos'>>({})
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

  function getFilteredExercises(dayIndex: number) {
    const query = searchQueries[dayIndex]?.toLowerCase().trim() ?? ''
    const groupFilter = activeFilters[dayIndex] ?? 'todos'

    return allExercises.filter((ex) => {
      const matchesGroup = groupFilter === 'todos' || ex.grupoMuscular === groupFilter
      const matchesSearch =
        !query ||
        ex.nombre.toLowerCase().includes(query) ||
        ex.equipo.toLowerCase().includes(query) ||
        ex.grupoMuscular.toLowerCase().includes(query)
      return matchesGroup && matchesSearch
    })
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
        equipo: (ex as any).equipo,
        variacion: (ex as any).variacion,
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
        <h3 className="text-lg font-bold text-brand-primaryText mb-2 font-heading tracking-tight">
          Revisa tus ejercicios
        </h3>
        <p className="text-brand-mutedText text-sm mb-4 leading-relaxed">
          Confirma los ejercicios seleccionados o agrégale más desde el catálogo.
        </p>
      </div>

      {trainingDays.map((day) => (
        <div
          key={day.index}
          className="bg-brand-card border border-brand-border rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-brand-primaryText font-bold font-heading">
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

          {/* Selected exercises */}
          {day.exercises.length > 0 && (
            <div className="space-y-2">
              {day.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 bg-brand-accent/5 border border-brand-accent/20 rounded-lg p-3"
                >
                  <div className="flex-1">
                    <p className="text-brand-primaryText text-sm font-medium">{ex.nombre}</p>
                    <p className="text-brand-mutedText text-xs">
                      {ex.grupoMuscular}
                      {ex.equipo && ` · ${ex.equipo}`}
                      {ex.variacion && ` · ${ex.variacion}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(day.index, ex)}
                    className="text-brand-mutedText hover:text-red-400 p-1"
                    aria-label="Quitar ejercicio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search and filters — always visible */}
          <div className="pt-2 border-t border-brand-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-mutedText pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar en el catálogo..."
                value={searchQueries[day.index] ?? ''}
                onChange={(e) =>
                  setSearchQueries((prev) => ({ ...prev, [day.index]: e.target.value }))
                }
                className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-9 py-2.5 text-brand-primaryText placeholder:text-brand-mutedText text-sm min-h-[44px] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30"
              />
              {searchQueries[day.index] && (
                <button
                  onClick={() =>
                    setSearchQueries((prev) => ({ ...prev, [day.index]: '' }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-mutedText hover:text-brand-primaryText"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Group filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() =>
                  setActiveFilters((prev) => ({ ...prev, [day.index]: 'todos' }))
                }
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  (activeFilters[day.index] ?? 'todos') === 'todos'
                    ? 'bg-brand-accent text-white border-brand-accent'
                    : 'bg-brand-dark text-brand-mutedText border-brand-border hover:text-brand-primaryText'
                }`}
              >
                Todos
              </button>
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group}
                  onClick={() =>
                    setActiveFilters((prev) => ({ ...prev, [day.index]: group }))
                  }
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    activeFilters[day.index] === group
                      ? 'bg-brand-accent text-white border-brand-accent'
                      : 'bg-brand-dark text-brand-mutedText border-brand-border hover:text-brand-primaryText'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getFilteredExercises(day.index).length === 0 ? (
                <p className="text-brand-mutedText text-xs py-2">
                  {(searchQueries[day.index] ?? '').trim()
                    ? 'No se encontraron resultados.'
                    : 'Escribe algo para buscar ejercicios.'}
                </p>
              ) : (
                getFilteredExercises(day.index).map((ex) => {
                  const alreadySelected = isSelected(day.index, ex.id)
                  // Skip if already shown in the selected section and no search query
                  if (alreadySelected && !(searchQueries[day.index] ?? '').trim()) return null
                  return (
                    <button
                      key={ex.id}
                      onClick={() => handleToggle(day.index, ex)}
                      className="w-full flex items-center gap-3 bg-brand-dark border border-brand-border rounded-lg p-2 text-left hover:border-brand-borderStrong transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-brand-primaryText text-sm">{ex.nombre}</p>
                        <p className="text-brand-mutedText text-xs">{ex.grupoMuscular}</p>
                      </div>
                    </button>
                  )
                }).filter(Boolean)
              )}
            </div>
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
                  className="flex-1 bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-brand-primaryText placeholder:text-brand-mutedText text-sm min-h-[44px] focus:outline-none focus:border-brand-accent"
                />
                <button
                  onClick={() => handleAddCustom(day.index)}
                  className="bg-brand-accent text-white px-3 py-2 rounded-xl text-sm font-medium active:bg-brand-lightAccent transition-colors"
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
