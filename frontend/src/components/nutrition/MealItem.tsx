import { useState } from 'react'
import type { NutritionMeal } from '../../types'

interface MealItemProps {
  meal: NutritionMeal
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onUpdate: (updates: { nombre_comida?: string; descripcion?: string }) => void
  onDelete: () => void
}

export function MealItem({ meal, isFirst, isLast, onMoveUp, onMoveDown, onUpdate, onDelete }: MealItemProps) {
  const [editingDesc, setEditingDesc] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [descValue, setDescValue] = useState(meal.descripcion ?? '')
  const [nameValue, setNameValue] = useState(meal.nombre_comida)
  const [showConfirm, setShowConfirm] = useState(false)

  const [menuOpen, setMenuOpen] = useState(false)

  function handleSaveName() {
    setEditingName(false)
    const trimmed = nameValue.trim()
    if (trimmed && trimmed !== meal.nombre_comida) {
      onUpdate({ nombre_comida: trimmed })
    } else {
      setNameValue(meal.nombre_comida)
    }
  }

  function handleSaveDesc() {
    setEditingDesc(false)
    const trimmed = descValue.trim()
    if (trimmed !== (meal.descripcion ?? '')) {
      onUpdate({ descripcion: trimmed || undefined })
    }
  }

  return (
    <div className="border border-brand-border rounded-xl p-4 bg-black/20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              type="text"
              className="w-full bg-brand-dark border border-brand-accent rounded px-2 py-1 text-sm font-semibold text-white outline-none"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') {
                  setNameValue(meal.nombre_comida)
                  setEditingName(false)
                }
              }}
              autoFocus
            />
          ) : (
            <h5
              className="text-sm font-semibold text-white cursor-pointer hover:text-brand-lightAccent transition-colors"
              onClick={() => {
                setNameValue(meal.nombre_comida)
                setEditingName(true)
              }}
            >
              {meal.nombre_comida}
            </h5>
          )}

          {editingDesc ? (
            <textarea
              className="w-full mt-2 bg-brand-dark border border-brand-accent rounded px-2 py-1 text-xs text-brand-mutedText outline-none resize-none"
              rows={3}
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={handleSaveDesc}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setDescValue(meal.descripcion ?? '')
                  setEditingDesc(false)
                }
              }}
              autoFocus
            />
          ) : (
            <p
              className="text-xs text-brand-mutedText mt-1 cursor-pointer hover:text-white transition-colors"
              onClick={() => {
                setDescValue(meal.descripcion ?? '')
                setEditingDesc(true)
              }}
            >
              {meal.descripcion || 'Agregar descripción...'}
            </p>
          )}
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-brand-mutedText hover:text-white transition-colors"
            aria-label={`Opciones de ${meal.nombre_comida}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="4" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="16" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 bg-brand-card border border-brand-border rounded-xl p-1 shadow-xl min-w-[140px]">
                <button
                  onClick={() => { onMoveUp(); setMenuOpen(false) }}
                  disabled={isFirst}
                  className="w-full text-left px-3 py-2 text-xs text-white hover:bg-brand-accent/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Subir
                </button>
                <button
                  onClick={() => { onMoveDown(); setMenuOpen(false) }}
                  disabled={isLast}
                  className="w-full text-left px-3 py-2 text-xs text-white hover:bg-brand-accent/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Bajar
                </button>
                <hr className="border-brand-border my-1" />
                {showConfirm ? (
                  <div className="px-3 py-2 space-y-1">
                    <p className="text-xs text-red-400">¿Eliminar?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onDelete(); setMenuOpen(false); setShowConfirm(false) }}
                        className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="text-xs px-2 py-1 bg-brand-border text-brand-mutedText rounded"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
