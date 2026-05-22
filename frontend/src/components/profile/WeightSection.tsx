import { useState } from 'react'
import { useMetricsStore } from '../../stores/metricsStore'
import { formatDate } from '../../utils/calculations'

export function WeightSection() {
  const weightEntries = useMetricsStore((state) => state.weightEntries)
  const addWeight = useMetricsStore((state) => state.addWeight)
  const removeWeight = useMetricsStore((state) => state.removeWeight)

  const [peso, setPeso] = useState('')
  const [fecha, setFecha] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const pesoNum = parseFloat(peso)
    if (isNaN(pesoNum) || pesoNum <= 0) {
      setError('Ingresa un peso válido mayor a 0')
      return
    }

    // Validación semanal: no permitir más de un registro por semana
    const targetDate = fecha || new Date().toISOString().split('T')[0]
    const targetWeek = getWeekStart(targetDate)
    const existingWeek = weightEntries.find(
      (entry) => getWeekStart(entry.fecha) === targetWeek
    )
    if (existingWeek) {
      setError('Ya existe un registro de peso para esta semana')
      return
    }

    addWeight(pesoNum, targetDate)
    setPeso('')
    setFecha('')
  }

  return (
    <div className="bg-brand-card rounded-lg p-4 border border-brand-border mt-4">
      <h3 className="text-brand-lightAccent font-semibold mb-3 font-[Montserrat]">
        Historial de peso
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            placeholder="Peso (kg)"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
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
          Registrar peso
        </button>
      </form>

      {weightEntries.length === 0 ? (
        <p className="text-brand-mutedText text-sm">Aún no hay registros de peso.</p>
      ) : (
        <ul className="space-y-2">
          {weightEntries.map((entry) => (
            <li
              key={entry.id}
              className="flex justify-between items-center bg-brand-dark rounded px-3 py-2 border border-brand-border"
            >
              <div>
                <span className="text-white font-medium">{entry.peso} kg</span>
                <span className="text-brand-mutedText text-sm ml-2">
                  {formatDate(entry.fecha)}
                </span>
              </div>
              <button
                onClick={() => removeWeight(entry.id)}
                className="text-red-400 text-sm hover:text-red-300 px-2 py-1"
                aria-label={`Eliminar peso ${entry.peso} kg`}
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

function getWeekStart(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00')
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date.setDate(diff))
  return monday.toISOString().split('T')[0]
}
