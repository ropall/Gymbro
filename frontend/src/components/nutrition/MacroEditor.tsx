import { useState } from 'react'

interface MacroEditorProps {
  calorias: number | null
  proteinas: number | null
  carbohidratos: number | null
  grasas: number | null
  onSave: (updates: { calorias: number | null; proteinas: number | null; carbohidratos: number | null; grasas: number | null }) => void
}

const macroConfig = [
  { key: 'calorias' as const, label: 'Calorías Totales', suffix: 'kcal' },
  { key: 'proteinas' as const, label: 'Proteínas', suffix: 'g' },
  { key: 'carbohidratos' as const, label: 'Carbohidratos', suffix: 'g' },
  { key: 'grasas' as const, label: 'Grasas', suffix: 'g' },
]

export function MacroEditor({ calorias, proteinas, carbohidratos, grasas, onSave }: MacroEditorProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [values, setValues] = useState({ calorias, proteinas, carbohidratos, grasas })

  const currentValues = editing ? values : { calorias, proteinas, carbohidratos, grasas }

  function startEdit(key: string) {
    setValues({ calorias, proteinas, carbohidratos, grasas })
    setEditing(key)
  }

  function handleChange(key: string, raw: string) {
    setValues((prev) => ({ ...prev, [key]: raw === '' ? null : Number(raw) }))
  }

  function handleBlur() {
    setEditing(null)
    if (
      values.calorias !== calorias ||
      values.proteinas !== proteinas ||
      values.carbohidratos !== carbohidratos ||
      values.grasas !== grasas
    ) {
      onSave(values)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      ;(e.target as HTMLInputElement).blur()
    }
    if (e.key === 'Escape') {
      setEditing(null)
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {macroConfig.map(({ key, label, suffix }) => (
        <div
          key={key}
          className="bg-brand-card border border-brand-border rounded-xl p-4 text-center cursor-pointer hover:border-brand-accent/40 transition-colors"
          onClick={() => startEdit(key)}
        >
          <span className="block text-xs text-brand-mutedText uppercase font-bold">{label}</span>
          {editing === key ? (
            <div className="flex items-center justify-center gap-1 mt-1">
              <input
                type="number"
                className="w-20 text-center bg-brand-dark border border-brand-accent rounded px-2 py-1 text-xl font-extrabold text-white outline-none"
                value={currentValues[key] ?? ''}
                onChange={(e) => handleChange(key, e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <span className="text-sm text-brand-mutedText">{suffix}</span>
            </div>
          ) : (
            <span className="text-xl font-extrabold text-white mt-1 block">
              {currentValues[key] ?? '—'} <span className="text-sm font-normal text-brand-mutedText">{suffix}</span>
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
