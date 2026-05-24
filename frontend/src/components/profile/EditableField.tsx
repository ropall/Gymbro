import { useState } from 'react'
import { Pencil } from 'lucide-react'

interface EditableFieldProps {
  label: string
  value: string | number | null
  type?: 'text' | 'number' | 'date' | 'select'
  options?: { value: string; label: string }[]
  inputMode?: 'text' | 'numeric' | 'decimal'
  placeholder?: string
  suffix?: string
  onSave: (value: string) => void
}

export function EditableField({
  label,
  value,
  type = 'text',
  options,
  inputMode,
  placeholder,
  suffix,
  onSave,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const displayValue = value !== null && value !== undefined && value !== ''
    ? String(value)
    : '—'

  const startEdit = () => {
    setDraft(value !== null && value !== undefined ? String(value) : '')
    setEditing(true)
  }

  const handleSave = () => {
    if (type === 'number') {
      const num = parseFloat(draft)
      if (!isNaN(num) && num > 0) {
        onSave(draft)
      }
    } else {
      onSave(draft)
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div>
      <span className="text-brand-mutedText text-xs">{label}</span>

      {editing ? (
        type === 'select' && options ? (
          <select
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              onSave(e.target.value)
              setEditing(false)
            }}
            onBlur={() => setEditing(false)}
            autoFocus
            className="w-full mt-0.5 bg-brand-dark border border-brand-lightAccent rounded-lg px-2 py-1.5 text-sm text-brand-primaryText focus:outline-none"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-1 mt-0.5">
            <input
              type={type === 'number' ? 'text' : type}
              inputMode={inputMode || (type === 'number' ? 'decimal' : undefined)}
              value={draft}
              onChange={(e) => {
                if (type === 'number') {
                  const val = e.target.value
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    setDraft(val)
                  }
                } else {
                  setDraft(e.target.value)
                }
              }}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder={placeholder}
              className="w-full bg-brand-dark border border-brand-lightAccent rounded-lg px-2 py-1.5 text-sm text-brand-primaryText focus:outline-none"
            />
            {suffix && <span className="text-brand-mutedText text-xs shrink-0">{suffix}</span>}
          </div>
        )
      ) : (
        <button
          onClick={startEdit}
          className="group flex items-center gap-1.5 mt-0.5 hover:bg-brand-card rounded-lg px-1.5 py-0.5 -ml-1.5 transition-colors cursor-pointer"
          title={`Editar ${label.toLowerCase()}`}
        >
          <p className="text-brand-primaryText font-medium text-sm">
            {displayValue}
            {suffix && !editing && ` ${suffix}`}
          </p>
          <Pencil className="w-3 h-3 text-brand-mutedText opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
      )}
    </div>
  )
}
