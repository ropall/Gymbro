import { useState, useRef, useCallback } from 'react'
import { Pencil, Check, X } from 'lucide-react'

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
  const containerRef = useRef<HTMLDivElement>(null)

  const displayValue = value !== null && value !== undefined && value !== ''
    ? String(value)
    : '—'

  const startEdit = () => {
    setDraft(value !== null && value !== undefined ? String(value) : '')
    setEditing(true)
  }

  const handleSave = useCallback(() => {
    if (type === 'number' && draft !== '') {
      const num = parseFloat(draft)
      if (isNaN(num) || num <= 0) {
        setEditing(false)
        return
      }
    }
    onSave(draft)
    setEditing(false)
  }, [draft, onSave, type])

  const handleCancel = useCallback(() => {
    setEditing(false)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleContainerBlur = (e: React.FocusEvent) => {
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return
    }
    handleSave()
  }

  return (
    <div>
      <span className="text-brand-mutedText text-xs">{label}</span>

      {editing ? (
        <div
          ref={containerRef}
          onBlur={handleContainerBlur}
          className="mt-0.5"
        >
          {type === 'select' && options ? (
            <select
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              className="w-full bg-brand-dark border border-brand-lightAccent rounded-lg px-2 py-1.5 text-sm text-brand-primaryText focus:outline-none"
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1">
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
                onKeyDown={handleKeyDown}
                autoFocus
                placeholder={placeholder}
                className="w-full bg-brand-dark border border-brand-lightAccent rounded-lg px-2 py-1.5 text-sm text-brand-primaryText focus:outline-none"
              />
              {suffix && <span className="text-brand-mutedText text-xs shrink-0">{suffix}</span>}
            </div>
          )}

          <div className="flex items-center gap-2 mt-1.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSave}
              className="flex items-center gap-1 text-xs font-medium bg-brand-lightAccent text-brand-inverseText px-2.5 py-1 rounded-md hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Check className="w-3 h-3" />
              Guardar
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCancel}
              className="flex items-center gap-1 text-xs font-medium bg-brand-card text-brand-primaryText border border-brand-border px-2.5 py-1 rounded-md hover:bg-brand-dark transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startEdit}
          className="group flex items-center gap-1.5 mt-0.5 hover:bg-brand-card rounded-lg px-1.5 py-0.5 -ml-1.5 transition-colors cursor-pointer"
          title={`Editar ${label.toLowerCase()}`}
        >
          <p className="text-brand-primaryText font-medium text-sm">
            {displayValue}
            {suffix && ` ${suffix}`}
          </p>
          <Pencil className="w-3 h-3 text-brand-mutedText opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
      )}
    </div>
  )
}
