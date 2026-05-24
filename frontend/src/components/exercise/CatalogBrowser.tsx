import { useState } from 'react'
import { useExerciseStore } from '../../stores/exerciseStore'
import { MUSCLE_GROUPS } from '../../types'
import type { MuscleGroup, Exercise } from '../../types'

export function CatalogBrowser() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showCustomForm, setShowCustomForm] = useState(false)

  const searchQuery = useExerciseStore((state) => state.searchQuery)
  const setSearchQuery = useExerciseStore((state) => state.setSearchQuery)
  const activeGroup = useExerciseStore((state) => state.activeGroup)
  const setActiveGroup = useExerciseStore((state) => state.setActiveGroup)
  const getFilteredExercises = useExerciseStore((state) => state.getFilteredExercises)
  const removeCustomExercise = useExerciseStore((state) => state.removeCustomExercise)

  const exercises = getFilteredExercises()

  return (
    <div>
      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar ejercicio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-brand-dark border border-brand-border rounded px-3 py-2 text-brand-primaryText placeholder:text-brand-mutedText min-h-[48px]"
        />
      </div>

      {/* Muscle group filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveGroup('todos')}
          className={`flex-shrink-0 px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
            activeGroup === 'todos'
              ? 'bg-brand-accent text-white border-brand-accent'
              : 'bg-brand-card text-brand-mutedText border-brand-border'
          }`}
        >
          Todos
        </button>
        {MUSCLE_GROUPS.map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={`flex-shrink-0 px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
              activeGroup === group
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-brand-card text-brand-mutedText border-brand-border'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Exercise count */}
      <p className="text-brand-mutedText text-xs mb-3">
        {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''}
      </p>

      {/* Exercise list */}
      <div className="space-y-2">
        {exercises.length === 0 ? (
          <p className="text-brand-mutedText text-sm">No se encontraron ejercicios.</p>
        ) : (
          exercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise)}
              className="w-full text-left bg-brand-card rounded-lg p-3 border border-brand-border hover:border-brand-lightAccent transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-brand-primaryText font-medium">{exercise.nombre}</h4>
                    {exercise.isCustom && (
                      <span className="text-[10px] bg-brand-accent/20 text-brand-lightAccent px-1.5 py-0.5 rounded">
                        Personalizado
                      </span>
                    )}
                  </div>
                  <p className="text-brand-mutedText text-xs mt-0.5">
                    {exercise.grupoMuscular} · {exercise.equipo}
                  </p>
                </div>
                <span className="text-brand-mutedText text-lg">›</span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Add custom exercise button */}
      <button
        onClick={() => setShowCustomForm(true)}
        className="mt-4 w-full bg-brand-accent text-white rounded px-4 py-3 font-medium min-h-[48px] active:bg-brand-lightAccent transition-colors"
      >
        + Agregar ejercicio personalizado
      </button>

      {/* Exercise detail modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onDelete={() => {
            if (selectedExercise.isCustom) {
              removeCustomExercise(selectedExercise.id)
            }
            setSelectedExercise(null)
          }}
        />
      )}

      {/* Custom exercise form modal */}
      {showCustomForm && (
        <CustomExerciseModal onClose={() => setShowCustomForm(false)} />
      )}
    </div>
  )
}

function ExerciseDetailModal({
  exercise,
  onClose,
  onDelete,
}: {
  exercise: Exercise
  onClose: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-card w-full sm:max-w-md sm:rounded-lg rounded-t-lg p-5 border border-brand-border max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-brand-primaryText font-heading">
              {exercise.nombre}
            </h3>
            {exercise.isCustom && (
              <span className="inline-block mt-1 text-xs bg-brand-accent/20 text-brand-lightAccent px-2 py-0.5 rounded">
                Ejercicio personalizado
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-brand-mutedText hover:text-brand-primaryText text-2xl px-2"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-brand-mutedText">Grupo muscular</span>
            <p className="text-brand-primaryText">{exercise.grupoMuscular}</p>
          </div>
          <div>
            <span className="text-brand-mutedText">Equipo</span>
            <p className="text-brand-primaryText">{exercise.equipo}</p>
          </div>
          {exercise.variaciones && (
            <div>
              <span className="text-brand-mutedText">Variaciones</span>
              <p className="text-brand-primaryText mt-1">{exercise.variaciones}</p>
            </div>
          )}
          {exercise.parentId && (
            <div>
              <span className="text-brand-mutedText">Basado en</span>
              <p className="text-brand-primaryText">{exercise.parentId}</p>
            </div>
          )}
        </div>

        {exercise.isCustom && (
          <button
            onClick={onDelete}
            className="mt-5 w-full bg-brand-dangerBg text-brand-danger border border-brand-dangerBorder rounded px-4 py-2 font-medium min-h-[48px]"
          >
            Eliminar ejercicio personalizado
          </button>
        )}

        {!exercise.isCustom && (
          <p className="mt-4 text-brand-mutedText text-xs">
            Este ejercicio es de solo lectura del catálogo global.
          </p>
        )}
      </div>
    </div>
  )
}

function CustomExerciseModal({ onClose }: { onClose: () => void }) {
  const addCustomExercise = useExerciseStore((state) => state.addCustomExercise)
  const globalExercises = useExerciseStore((state) => state.globalExercises)

  const [nombre, setNombre] = useState('')
  const [grupo, setGrupo] = useState<MuscleGroup>('Pecho')
  const [equipo, setEquipo] = useState('')
  const [parentId, setParentId] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    addCustomExercise({
      nombre: nombre.trim(),
      grupoMuscular: grupo,
      equipo: equipo.trim() || 'Sin equipo',
      variaciones: null,
      parentId: parentId || undefined,
    })

    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-card w-full sm:max-w-md sm:rounded-lg rounded-t-lg p-5 border border-brand-border max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-brand-primaryText font-heading">
            Nuevo ejercicio personalizado
          </h3>
          <button
            onClick={onClose}
            className="text-brand-mutedText hover:text-brand-primaryText text-2xl px-2"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-brand-mutedText block mb-1">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Curl de Bíceps Inclinado"
              className="w-full bg-brand-dark border border-brand-border rounded px-3 py-2 text-brand-primaryText placeholder:text-brand-mutedText min-h-[48px]"
              required
            />
          </div>

          <div>
            <label className="text-sm text-brand-mutedText block mb-1">Grupo muscular</label>
            <select
              value={grupo}
              onChange={(e) => setGrupo(e.target.value as MuscleGroup)}
              className="w-full bg-brand-dark border border-brand-border rounded px-3 py-2 text-brand-primaryText min-h-[48px]"
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-brand-mutedText block mb-1">Equipo</label>
            <input
              type="text"
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
              placeholder="Ej. Mancuernas / Banco inclinado"
              className="w-full bg-brand-dark border border-brand-border rounded px-3 py-2 text-brand-primaryText placeholder:text-brand-mutedText min-h-[48px]"
            />
          </div>

          <div>
            <label className="text-sm text-brand-mutedText block mb-1">
              Ejercicio base (opcional)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded px-3 py-2 text-brand-primaryText min-h-[48px]"
            >
              <option value="">Ninguno</option>
              {globalExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.nombre}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-brand-danger text-sm">{error}</p>}

          <button
            type="submit"
            className="mt-2 w-full bg-brand-accent text-white rounded px-4 py-3 font-medium min-h-[48px] active:bg-brand-lightAccent transition-colors"
          >
            Guardar ejercicio
          </button>
        </form>
      </div>
    </div>
  )
}
