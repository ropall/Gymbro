import { useEffect, useState } from 'react'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { useExerciseStore } from '../../stores/exerciseStore'
import { MUSCLE_GROUPS } from '../../types'
import type { WizardExercise, Exercise, MuscleGroup } from '../../types'
import { Search, X, Dumbbell, Plus } from 'lucide-react'

interface ExercisePickerModalProps {
  dayIndex: number
  isOpen: boolean
  onClose: () => void
}

function parseOptions(text: string | null): string[] {
  if (!text) return []
  return text.split(/\s*\/\s*|\s*,\s+/).map((s) => s.trim()).filter(Boolean)
}

export function ExercisePickerModal({ dayIndex, isOpen, onClose }: ExercisePickerModalProps) {
  const days = useOnboardingStore((s) => s.days)
  const toggleExercise = useOnboardingStore((s) => s.toggleExercise)

  const globalExercises = useExerciseStore((s) => s.globalExercises)
  const customExercises = useExerciseStore((s) => s.customExercises)
  const loadData = useExerciseStore((s) => s.loadData)
  const addCustomExercise = useExerciseStore((s) => s.addCustomExercise)
  const searchQuery = useExerciseStore((s) => s.searchQuery)
  const setSearchQuery = useExerciseStore((s) => s.setSearchQuery)
  const activeGroup = useExerciseStore((s) => s.activeGroup)
  const setActiveGroup = useExerciseStore((s) => s.setActiveGroup)

  const [localQuery, setLocalQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [inlineSelections, setInlineSelections] = useState<Record<string, { equipo: string; variacion: string }>>({})

  // Custom exercise overlay state
  const [showCustomOverlay, setShowCustomOverlay] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customEquipo, setCustomEquipo] = useState('')
  const [customVariaciones, setCustomVariaciones] = useState('')
  const [customGrupo, setCustomGrupo] = useState<MuscleGroup>('Pecho')

  useEffect(() => {
    if (isOpen && globalExercises.length === 0 && customExercises.length === 0) {
      loadData()
    }
  }, [isOpen, loadData, globalExercises.length, customExercises.length])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery)
    }, 150)
    return () => clearTimeout(timer)
  }, [localQuery, setSearchQuery])

  useEffect(() => {
    if (!isOpen) {
      setLocalQuery('')
      setSearchQuery('')
      setActiveGroup('todos')
      setExpandedId(null)
      setInlineSelections({})
      closeCustomOverlay()
    }
  }, [isOpen, setSearchQuery, setActiveGroup])

  if (!isOpen) return null

  const day = days[dayIndex]
  const allExercises = [...globalExercises, ...customExercises]

  const selectedIds = new Set(day.exercises.map((e) => e.id))

  const filteredExercises = allExercises.filter((ex) => {
    if (selectedIds.has(ex.id)) return false
    const matchesGroup = activeGroup === 'todos' || ex.grupoMuscular === activeGroup
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !query ||
      ex.nombre.toLowerCase().includes(query) ||
      ex.equipo.toLowerCase().includes(query) ||
      ex.grupoMuscular.toLowerCase().includes(query)
    return matchesGroup && matchesSearch
  })

  function handleDeselect(exerciseId: string) {
    const existing = day.exercises.find((e) => e.id === exerciseId)
    if (existing) {
      toggleExercise(dayIndex, existing)
    }
  }

  function addExercise(ex: Exercise, equipo: string, variacion: string) {
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
      equipo: equipo || 'Sin equipo',
      variacion: variacion || undefined,
    }
    toggleExercise(dayIndex, wizardEx)
    setExpandedId(null)
  }

  function handleExerciseClick(ex: Exercise) {
    const equipoOptions = parseOptions(ex.equipo)
    const variacionOptions = parseOptions(ex.variaciones)

    // Auto-select if there's at most 1 equipment option and at most 1 variation
    if (equipoOptions.length <= 1 && variacionOptions.length <= 1) {
      addExercise(ex, equipoOptions[0] || 'Sin equipo', variacionOptions[0] || '')
      return
    }

    // Expand inline with defaults pre-selected
    setInlineSelections((prev) => ({
      ...prev,
      [ex.id]: {
        equipo: equipoOptions[0] || 'Sin equipo',
        variacion: variacionOptions[0] || '',
      },
    }))
    setExpandedId(ex.id)
  }

  function openCustomOverlay() {
    setCustomGrupo(day.muscleGroups[0] ?? 'Pecho')
    setCustomName('')
    setCustomEquipo('')
    setCustomVariaciones('')
    setShowCustomOverlay(true)
  }

  function closeCustomOverlay() {
    setShowCustomOverlay(false)
    setCustomName('')
    setCustomEquipo('')
    setCustomVariaciones('')
  }

  async function handleSaveCustom() {
    const name = customName.trim()
    if (!name) return
    await addCustomExercise({
      nombre: name,
      grupoMuscular: customGrupo,
      equipo: customEquipo.trim() || 'Sin equipo',
      variaciones: customVariaciones.trim() || null,
    })
    const latestCustom = useExerciseStore.getState().customExercises.at(-1)
    if (latestCustom) {
      addExercise(latestCustom, customEquipo.trim() || 'Sin equipo', customVariaciones.trim())
    }
    closeCustomOverlay()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-brand-dark">
      {/* Header */}
      <header className="sticky top-0 bg-brand-dark/95 backdrop-blur border-b border-brand-border px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-brand-primaryText font-bold font-heading text-lg">
            Día {dayIndex + 1}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-brand-card border border-brand-border text-brand-mutedText hover:text-brand-primaryText transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-mutedText pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar ejercicios..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-brand-primaryText placeholder:text-brand-mutedText text-sm min-h-[44px] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30"
          />
          {localQuery && (
            <button
              onClick={() => setLocalQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-mutedText hover:text-brand-primaryText"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Muscle group filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setActiveGroup('todos')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeGroup === 'todos'
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-brand-card text-brand-mutedText border-brand-border hover:text-brand-primaryText'
            }`}
          >
            Todos
          </button>
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeGroup === group
                  ? 'bg-brand-accent text-white border-brand-accent'
                  : 'bg-brand-card text-brand-mutedText border-brand-border hover:text-brand-primaryText'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Selected exercises bar — inside header so it scrolls together with search & filters */}
        <div className="mt-3 pt-2 border-t border-brand-border">
          <div className="flex items-center gap-2 text-xs text-brand-lightAccent mb-2">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>
              {day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''} seleccionado
              {day.exercises.length !== 1 ? 's' : ''}
            </span>
            {day.muscleGroups.length > 0 && (
              <span className="text-brand-mutedText ml-1">
                ({day.muscleGroups.join(', ')})
              </span>
            )}
          </div>

          {day.exercises.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              {day.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="shrink-0 inline-flex items-center gap-1.5 bg-brand-accent/15 border border-brand-accent/30 rounded-full pl-2.5 pr-1 py-1"
                >
                  <span className="text-brand-primaryText text-xs font-medium truncate max-w-[140px]">
                    {ex.nombre}
                  </span>
                  <button
                    onClick={() => handleDeselect(ex.id)}
                    className="text-brand-mutedText hover:text-red-400 p-0.5 rounded-full hover:bg-brand-accent/10 transition-colors"
                    aria-label="Quitar ejercicio"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Exercise list */}
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-10 h-10 text-brand-mutedText mx-auto mb-3 opacity-50" />
            <p className="text-brand-mutedText text-sm">
              {searchQuery.trim()
                ? 'No se encontraron ejercicios con esos criterios.'
                : 'No hay ejercicios disponibles.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExercises.map((ex) => {
              const isExpanded = expandedId === ex.id
              const equipoOptions = parseOptions(ex.equipo)
              const variacionOptions = parseOptions(ex.variaciones)
              const selections = inlineSelections[ex.id] || { equipo: equipoOptions[0] || 'Sin equipo', variacion: variacionOptions[0] || '' }

              return (
                <div
                  key={ex.id}
                  className={`rounded-xl border transition-colors ${
                    isExpanded
                      ? 'bg-brand-card border-brand-accent/50'
                      : 'bg-brand-card border-brand-border hover:border-brand-borderStrong'
                  }`}
                >
                  <button
                    onClick={() => handleExerciseClick(ex)}
                    className="w-full flex items-center gap-3 p-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-brand-primaryText text-sm font-medium truncate">
                        {ex.nombre}
                      </p>
                      <p className="text-brand-mutedText text-xs">{ex.grupoMuscular}</p>
                    </div>
                    {(equipoOptions.length > 1 || variacionOptions.length > 1) && !isExpanded && (
                      <span className="text-brand-lightAccent text-xs font-medium shrink-0">
                        Opciones
                      </span>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3">
                      {/* Equipment options */}
                      {equipoOptions.length > 1 && (
                        <div>
                          <p className="text-brand-lightAccent text-xs font-medium mb-1.5">Equipo</p>
                          <div className="flex flex-wrap gap-1.5">
                            {equipoOptions.map((opt) => (
                              <button
                                key={opt}
                                onClick={() =>
                                  setInlineSelections((prev) => ({
                                    ...prev,
                                    [ex.id]: { ...selections, equipo: opt },
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                  selections.equipo === opt
                                    ? 'bg-brand-accent text-white border-brand-accent'
                                    : 'bg-brand-dark text-brand-primaryText border-brand-border hover:border-brand-borderStrong'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Variation options */}
                      {variacionOptions.length > 1 && (
                        <div>
                          <p className="text-brand-lightAccent text-xs font-medium mb-1.5">Variación</p>
                          <div className="flex flex-wrap gap-1.5">
                            {variacionOptions.map((opt) => (
                              <button
                                key={opt}
                                onClick={() =>
                                  setInlineSelections((prev) => ({
                                    ...prev,
                                    [ex.id]: { ...selections, variacion: opt },
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                  selections.variacion === opt
                                    ? 'bg-brand-accent text-white border-brand-accent'
                                    : 'bg-brand-dark text-brand-primaryText border-brand-border hover:border-brand-borderStrong'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => addExercise(ex, selections.equipo, selections.variacion)}
                        className="w-full bg-brand-accent text-white py-2.5 rounded-xl text-sm font-bold active:bg-brand-lightAccent transition-colors"
                      >
                        Agregar ejercicio
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-brand-dark/95 backdrop-blur border-t border-brand-border px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-brand-card text-brand-primaryText border border-brand-border px-4 py-2.5 rounded-xl font-semibold active:bg-brand-border transition-colors text-sm"
          >
            Listo
          </button>
          <button
            onClick={openCustomOverlay}
            className="flex-1 bg-brand-accent text-white px-4 py-2.5 rounded-xl font-semibold active:bg-brand-lightAccent transition-colors text-sm inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Crear ejercicio
          </button>
        </div>
      </footer>

      {/* Custom exercise overlay */}
      {showCustomOverlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm bg-brand-card border border-brand-border rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-brand-primaryText font-bold text-base">Crear ejercicio</h3>
              <button
                onClick={closeCustomOverlay}
                className="text-brand-mutedText hover:text-brand-primaryText p-1"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-brand-lightAccent text-xs font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Curl Martillo"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2.5 text-brand-primaryText placeholder:text-brand-mutedText text-sm min-h-[44px] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30"
                />
              </div>

              <div>
                <label className="block text-brand-lightAccent text-xs font-medium mb-1">Grupo muscular</label>
                <div className="flex flex-wrap gap-1.5">
                  {MUSCLE_GROUPS.map((group) => (
                    <button
                      key={group}
                      onClick={() => setCustomGrupo(group)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        customGrupo === group
                          ? 'bg-brand-accent text-white border-brand-accent'
                          : 'bg-brand-dark text-brand-primaryText border-brand-border hover:border-brand-borderStrong'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-brand-lightAccent text-xs font-medium mb-1">Equipo / Máquinas (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Mancuernas / Barra"
                  value={customEquipo}
                  onChange={(e) => setCustomEquipo(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2.5 text-brand-primaryText placeholder:text-brand-mutedText text-sm min-h-[44px] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30"
                />
              </div>

              <div>
                <label className="block text-brand-lightAccent text-xs font-medium mb-1">Variaciones (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Agarre neutro, cruzado"
                  value={customVariaciones}
                  onChange={(e) => setCustomVariaciones(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2.5 text-brand-primaryText placeholder:text-brand-mutedText text-sm min-h-[44px] focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={closeCustomOverlay}
                className="flex-1 bg-brand-card text-brand-primaryText border border-brand-border px-4 py-2.5 rounded-xl font-semibold active:bg-brand-border transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCustom}
                disabled={!customName.trim()}
                className="flex-1 bg-brand-accent text-white px-4 py-2.5 rounded-xl font-semibold active:bg-brand-lightAccent transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
