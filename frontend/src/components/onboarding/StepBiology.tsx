import { useState, useEffect, useCallback } from 'react'
import { useOnboardingProfileStore } from '../../stores/onboardingProfileStore'
import type { Sexo, NivelActividad } from '../../types'
import { NIVEL_ACTIVIDAD_LABELS } from '../../types'

function useNumericInput(
  storeValue: number,
  onChange: (val: number) => void
) {
  const [raw, setRaw] = useState(() => String(storeValue))

  useEffect(() => {
    if (String(storeValue) !== raw && document.activeElement?.tagName !== 'INPUT') {
      setRaw(String(storeValue))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeValue])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      // Allow only digits and optionally one decimal point
      if (val === '' || /^\d*\.?\d*$/.test(val)) {
        setRaw(val)
        const parsed = parseFloat(val)
        if (!isNaN(parsed)) {
          onChange(parsed)
        }
      }
    },
    [onChange]
  )

  const handleBlur = useCallback(() => {
    const parsed = parseFloat(raw)
    if (raw === '' || isNaN(parsed)) {
      setRaw(String(storeValue))
    } else {
      setRaw(String(parsed))
    }
  }, [raw, storeValue])

  return { raw, handleChange, handleBlur }
}

export function StepBiology() {
  const { data, updateData, setStep } = useOnboardingProfileStore()

  const altura = useNumericInput(data.altura, (v) => updateData({ altura: v }))
  const pesoInicial = useNumericInput(data.pesoInicial, (v) => updateData({ pesoInicial: v }))
  const pesoObjetivo = useNumericInput(data.pesoObjetivo, (v) => updateData({ pesoObjetivo: v }))

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-brand-mutedText text-sm">
          ¿Cuáles son tus datos actuales?
        </p>
        <p className="text-brand-mutedText text-xs mt-1">
          Estos datos nos ayudan a calcular tus necesidades calóricas exactas
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-brand-mutedText mb-1">
            Altura (cm)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={altura.raw}
            onChange={altura.handleChange}
            onBlur={altura.handleBlur}
            className="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-brand-lightText placeholder:text-brand-mutedText focus:outline-none focus:border-brand-lightAccent transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-brand-mutedText mb-1">
            Peso actual (kg)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={pesoInicial.raw}
            onChange={pesoInicial.handleChange}
            onBlur={pesoInicial.handleBlur}
            className="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-brand-lightText placeholder:text-brand-mutedText focus:outline-none focus:border-brand-lightAccent transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-brand-mutedText mb-1">
          Peso objetivo (kg)
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={pesoObjetivo.raw}
          onChange={pesoObjetivo.handleChange}
          onBlur={pesoObjetivo.handleBlur}
          className="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-brand-lightText placeholder:text-brand-mutedText focus:outline-none focus:border-brand-lightAccent transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-brand-mutedText mb-2">Sexo biológico</label>
        <div className="flex gap-3">
          {(['masculino', 'femenino'] as Sexo[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => updateData({ sexo: s })}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
                data.sexo === s
                  ? 'bg-brand-lightAccent text-brand-inverseText'
                  : 'bg-brand-card border border-brand-border text-brand-mutedText hover:border-brand-lightAccent'
              }`}
            >
              {s === 'masculino' ? 'Masculino' : 'Femenino'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-brand-mutedText mb-2">
          Nivel de actividad diaria
        </label>
        <div className="space-y-2">
          {(Object.entries(NIVEL_ACTIVIDAD_LABELS) as [NivelActividad, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => updateData({ nivelActividad: key })}
              className={`w-full text-left py-3 px-4 rounded-xl font-medium text-sm transition-colors ${
                data.nivelActividad === key
                  ? 'bg-brand-lightAccent text-brand-inverseText'
                  : 'bg-brand-card border border-brand-border text-brand-mutedText hover:border-brand-lightAccent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStep(1)}
        className="w-full py-3 text-sm text-brand-mutedText hover:text-brand-lightAccent transition-colors border border-brand-border rounded-xl"
      >
        Regresar
      </button>
    </div>
  )
}
