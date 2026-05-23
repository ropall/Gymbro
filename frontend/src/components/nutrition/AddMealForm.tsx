import { useState } from 'react'
import { DEFAULT_MEAL_NAMES } from '../../types'

interface AddMealFormProps {
  onAdd: (meal: { nombre_comida: string; descripcion: string }) => void
  usedMealNames: string[]
  onCancel: () => void
}

export function AddMealForm({ onAdd, usedMealNames, onCancel }: AddMealFormProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const availableDefaults = DEFAULT_MEAL_NAMES.filter((n) => !usedMealNames.includes(n))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = nombre.trim()
    if (!trimmed) return
    onAdd({ nombre_comida: trimmed, descripcion: descripcion.trim() })
    setNombre('')
    setDescripcion('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-brand-mutedText block mb-1">Nombre de la comida</label>
        <input
          type="text"
          className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
          placeholder="Ej: Pre-Gimnasio"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
        />
        {availableDefaults.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {availableDefaults.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setNombre(name)}
                className="text-[11px] px-2 py-1 rounded-full border border-brand-border text-brand-mutedText hover:border-brand-accent hover:text-white transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="text-xs text-brand-mutedText block mb-1">Descripción (ingredientes y cantidades)</label>
        <textarea
          className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-sm text-white outline-none resize-none focus:border-brand-accent"
          rows={3}
          placeholder="Ej: 1 Arepa de Promasa (100g cocida) + Café negro"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-brand-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-lightAccent transition-colors"
        >
          Agregar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-brand-mutedText hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
