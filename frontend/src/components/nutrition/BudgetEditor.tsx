import { useState } from 'react'

interface BudgetEditorProps {
  presupuesto: string | null
  onSave: (presupuesto: string | null) => void
}

export function BudgetEditor({ presupuesto, onSave }: BudgetEditorProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(presupuesto ?? '')

  function handleBlur() {
    setEditing(false)
    const trimmed = value.trim()
    if (trimmed !== (presupuesto ?? '')) {
      onSave(trimmed || null)
    }
  }

  if (editing) {
    return (
      <input
        type="text"
        className="w-full bg-brand-dark border border-brand-accent rounded px-3 py-2 text-sm text-white outline-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          if (e.key === 'Escape') setEditing(false)
        }}
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={() => {
        setValue(presupuesto ?? '')
        setEditing(true)
      }}
      className="text-sm text-brand-mutedText hover:text-white transition-colors text-left"
    >
      {presupuesto || 'Agregar presupuesto...'}
    </button>
  )
}
