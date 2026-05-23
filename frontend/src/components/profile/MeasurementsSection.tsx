import { useState } from 'react'
import { useMetricsStore } from '../../stores/metricsStore'
import { MEASUREMENT_TYPES, MEASUREMENT_LABELS } from '../../types'
import { formatDate } from '../../utils/calculations'
import type { MeasurementType } from '../../types'

export function MeasurementsSection() {
  const measurementEntries = useMetricsStore((state) => state.measurementEntries)
  const addMeasurement = useMetricsStore((state) => state.addMeasurement)
  const removeMeasurement = useMetricsStore((state) => state.removeMeasurement)

  const [tipo, setTipo] = useState<MeasurementType>('pecho')
  const [valor, setValor] = useState('')
  const [fecha, setFecha] = useState('')
  const [filter, setFilter] = useState<MeasurementType | 'todos'>('todos')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const valorNum = parseFloat(valor)
    if (isNaN(valorNum) || valorNum <= 0) {
      setError('Ingresa un valor válido mayor a 0')
      return
    }

    await addMeasurement(tipo, valorNum, fecha || undefined)
    setValor('')
    setFecha('')
  }

  const filtered =
    filter === 'todos'
      ? measurementEntries
      : measurementEntries.filter((m) => m.tipo === filter)

  return (
    <div className="bg-brand-card rounded-lg p-4 border border-brand-border mt-4">
      <h3 className="text-brand-lightAccent font-semibold mb-3 font-[Montserrat]">
        Medidas corporales
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as MeasurementType)}
            className="bg-brand-dark border border-brand-border rounded px-3 py-2 text-white min-h-[48px]"
          >
            {MEASUREMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {MEASUREMENT_LABELS[t]}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.1"
            placeholder="Valor (cm)"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="flex-1 bg-brand-dark border border-brand-border rounded px-3 py-2 text-white placeholder:text-brand-mutedText min-h-[48px]"
            required
          />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-brand-dark border border-brand-border rounded px-3 py-2 text-white min-h-[48px]"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-brand-accent text-white rounded px-4 py-2 font-medium min-h-[48px] active:bg-brand-lightAccent transition-colors"
        >
          Registrar medida
        </button>
      </form>

      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setFilter('todos')}
          className={`text-xs px-3 py-1 rounded border ${
            filter === 'todos'
              ? 'bg-brand-accent text-white border-brand-accent'
              : 'bg-brand-dark text-brand-mutedText border-brand-border'
          }`}
        >
          Todos
        </button>
        {MEASUREMENT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-xs px-3 py-1 rounded border ${
              filter === t
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-brand-dark text-brand-mutedText border-brand-border'
            }`}
          >
            {MEASUREMENT_LABELS[t]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-brand-mutedText text-sm">
          {filter === 'todos'
            ? 'Aún no hay registros de medidas.'
            : `Aún no hay registros de ${MEASUREMENT_LABELS[filter]}.`}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((entry) => (
            <li
              key={entry.id}
              className="flex justify-between items-center bg-brand-dark rounded px-3 py-2 border border-brand-border"
            >
              <div>
                <span className="text-brand-lightAccent text-xs font-medium">
                  {MEASUREMENT_LABELS[entry.tipo]}
                </span>
                <span className="text-white font-medium ml-2">{entry.valor} cm</span>
                <span className="text-brand-mutedText text-sm ml-2">
                  {formatDate(entry.fecha)}
                </span>
              </div>
              <button
                onClick={() => removeMeasurement(entry.id)}
                className="text-red-400 text-sm hover:text-red-300 px-2 py-1"
                aria-label={`Eliminar medida ${MEASUREMENT_LABELS[entry.tipo]}`}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
