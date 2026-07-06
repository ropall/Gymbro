import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { useRoutineStore } from '../../stores/routineStore'
import type { Routine } from '../../types'

interface RoutineSwitcherProps {
  onClose: () => void
}

export function RoutineSwitcher({ onClose }: RoutineSwitcherProps) {
  const navigate = useNavigate()
  const routines = useRoutineStore((s) => s.routines)
  const activateRoutine = useRoutineStore((s) => s.activateRoutine)
  const renameRoutine = useRoutineStore((s) => s.renameRoutine)
  const deleteRoutine = useRoutineStore((s) => s.deleteRoutine)

  const [busyId, setBusyId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleActivate(routine: Routine) {
    if (routine.activa || busyId) return
    setBusyId(routine.id)
    setError(null)
    try {
      await activateRoutine(routine.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error activando la rutina')
    } finally {
      setBusyId(null)
    }
  }

  function startRename(routine: Routine) {
    setError(null)
    setEditingId(routine.id)
    setEditingName(routine.nombre)
  }

  async function confirmRename() {
    if (!editingId || !editingName.trim()) return
    try {
      await renameRoutine(editingId, editingName.trim())
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error renombrando la rutina')
    }
  }

  async function handleDelete(routine: Routine) {
    setError(null)
    try {
      await deleteRoutine(routine.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando la rutina')
    }
  }

  function handleCreateNew() {
    onClose()
    navigate('/onboarding')
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-brand-primaryText font-heading">
            Mis rutinas
          </h3>
          <button
            onClick={onClose}
            className="text-brand-mutedText hover:text-brand-primaryText text-2xl px-2"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-brand-dangerBg border border-brand-dangerBorder rounded-lg text-brand-danger text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-5">
          {routines.length === 0 && (
            <p className="text-brand-mutedText text-sm">
              Todavía no tienes rutinas guardadas.
            </p>
          )}

          {routines.map((routine) => (
            <div
              key={routine.id}
              className={`rounded-lg border p-3 ${
                routine.activa
                  ? 'border-brand-lightAccent/40 bg-brand-lightAccent/10'
                  : 'border-brand-border bg-brand-dark'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                {editingId === routine.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmRename()
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="flex-1 bg-brand-card border border-brand-border rounded px-2 py-1 text-sm text-brand-primaryText focus:outline-none focus:border-brand-lightAccent"
                  />
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-brand-primaryText font-medium text-sm truncate">
                      {routine.nombre}
                    </span>
                    {routine.activa && (
                      <span className="badge bg-brand-accent/20 text-brand-lightAccent border border-brand-accent/30 shrink-0">
                        Activa
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  {editingId === routine.id ? (
                    <>
                      <button
                        onClick={confirmRename}
                        aria-label="Guardar nombre"
                        className="btn-compact w-8 h-8 p-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        aria-label="Cancelar"
                        className="btn-compact w-8 h-8 p-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      {!routine.activa && (
                        <button
                          onClick={() => handleActivate(routine)}
                          disabled={busyId === routine.id}
                          className="btn-primary h-8 px-3 text-xs disabled:opacity-50"
                        >
                          {busyId === routine.id ? 'Activando…' : 'Activar'}
                        </button>
                      )}
                      <button
                        onClick={() => startRename(routine)}
                        aria-label="Renombrar rutina"
                        className="btn-compact w-8 h-8 p-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {!routine.activa && (
                        <button
                          onClick={() => handleDelete(routine)}
                          aria-label="Eliminar rutina"
                          className="btn-compact w-8 h-8 p-0 text-brand-danger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCreateNew}
          className="w-full bg-brand-accent text-white rounded px-4 py-2 text-sm font-medium active:bg-brand-lightAccent transition-colors"
        >
          + Crear nueva rutina
        </button>
      </div>
    </div>
  )
}
