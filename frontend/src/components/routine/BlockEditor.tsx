import { useState, useMemo } from 'react'
import { useRoutineStore } from '../../stores/routineStore'
import { useExerciseStore } from '../../stores/exerciseStore'
import type { Block } from '../../types'

interface BlockEditorProps {
  block: Block
  onClose: () => void
}

export function BlockEditor({ block, onClose }: BlockEditorProps) {
  const allBlockExercises = useRoutineStore((s) => s.blockExercises)
  const blockExercises = useMemo(
    () => allBlockExercises.filter((e) => e.block_id === block.id),
    [allBlockExercises, block.id]
  )
  const addBlockExercise = useRoutineStore((s) => s.addBlockExercise)
  const removeBlockExercise = useRoutineStore((s) => s.removeBlockExercise)
  const globalExercises = useExerciseStore((s) => s.globalExercises)
  const customExercises = useExerciseStore((s) => s.customExercises)

  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [newExerciseParams, setNewExerciseParams] = useState({
    series: 3,
    repsMin: 8,
    repsMax: 12,
    rpe: 7,
    descanso: 90,
  })

  const allExercises = [...globalExercises, ...customExercises]

  function handleAddExercise() {
    const ex = allExercises.find((e) => e.id === selectedExerciseId)
    if (!ex) return

    addBlockExercise(block.id, {
      global_exercise_id: ex.isCustom ? null : ex.id,
      user_exercise_id: ex.isCustom ? ex.id : null,
      series_objetivo: newExerciseParams.series,
      reps_objetivo_min: newExerciseParams.repsMin,
      reps_objetivo_max: newExerciseParams.repsMax,
      rpe_objetivo: newExerciseParams.rpe,
      descanso_segundos: newExerciseParams.descanso,
    })

    setShowAddForm(false)
    setSelectedExerciseId('')
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-card w-full sm:max-w-lg sm:rounded-lg rounded-t-lg p-5 border border-brand-border max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white font-[Montserrat]">
            Editor de Bloque
          </h3>
          <button
            onClick={onClose}
            className="text-brand-mutedText hover:text-white text-2xl px-2"
          >
            ×
          </button>
        </div>

        <p className="text-brand-mutedText text-sm mb-4">
          {block.nombre} — Posición {block.posicion}
        </p>

        {/* Current exercises */}
        <div className="space-y-3 mb-4">
          <h4 className="text-white font-medium text-sm">Ejercicios</h4>
          {blockExercises.length === 0 && (
            <p className="text-brand-mutedText text-xs">Sin ejercicios</p>
          )}
          {blockExercises.map((be) => (
            <div
              key={be.id}
              className="bg-brand-dark border border-brand-border rounded-lg p-3 flex justify-between items-center"
            >
              <div>
                <p className="text-white text-sm font-medium">
                  {be.exercise?.nombre ?? 'Ejercicio'}
                </p>
                <p className="text-brand-mutedText text-xs">
                  {be.series_objetivo} series · {be.reps_objetivo_min}-{be.reps_objetivo_max} reps ·
                  RPE {be.rpe_objetivo} · {be.descanso_segundos}s
                </p>
              </div>
              <button
                onClick={() => removeBlockExercise(be.id)}
                className="text-red-400 text-xs font-medium px-2 py-1"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        {/* Add exercise */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-brand-accent text-white rounded px-4 py-2 text-sm font-medium active:bg-brand-lightAccent transition-colors"
          >
            + Agregar ejercicio
          </button>
        ) : (
          <div className="space-y-3 bg-brand-dark border border-brand-border rounded-lg p-3">
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full bg-brand-card border border-brand-border rounded px-3 py-2 text-white text-sm"
            >
              <option value="">Seleccionar ejercicio</option>
              {allExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.nombre} ({ex.grupoMuscular})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-brand-mutedText text-[10px]">Series</label>
                <input
                  type="number"
                  value={newExerciseParams.series}
                  onChange={(e) =>
                    setNewExerciseParams((p) => ({ ...p, series: Number(e.target.value) }))
                  }
                  className="w-full bg-brand-card border border-brand-border rounded px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-brand-mutedText text-[10px]">Rep min</label>
                <input
                  type="number"
                  value={newExerciseParams.repsMin}
                  onChange={(e) =>
                    setNewExerciseParams((p) => ({ ...p, repsMin: Number(e.target.value) }))
                  }
                  className="w-full bg-brand-card border border-brand-border rounded px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-brand-mutedText text-[10px]">Rep max</label>
                <input
                  type="number"
                  value={newExerciseParams.repsMax}
                  onChange={(e) =>
                    setNewExerciseParams((p) => ({ ...p, repsMax: Number(e.target.value) }))
                  }
                  className="w-full bg-brand-card border border-brand-border rounded px-2 py-1 text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-brand-mutedText text-[10px]">RPE</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newExerciseParams.rpe}
                  onChange={(e) =>
                    setNewExerciseParams((p) => ({ ...p, rpe: Number(e.target.value) }))
                  }
                  className="w-full bg-brand-card border border-brand-border rounded px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-brand-mutedText text-[10px]">Descanso (s)</label>
                <input
                  type="number"
                  value={newExerciseParams.descanso}
                  onChange={(e) =>
                    setNewExerciseParams((p) => ({ ...p, descanso: Number(e.target.value) }))
                  }
                  className="w-full bg-brand-card border border-brand-border rounded px-2 py-1 text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddExercise}
                disabled={!selectedExerciseId}
                className="flex-1 bg-brand-accent text-white rounded px-3 py-2 text-sm font-medium active:bg-brand-lightAccent transition-colors disabled:opacity-50"
              >
                Agregar
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-brand-card text-white border border-brand-border rounded px-3 py-2 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
