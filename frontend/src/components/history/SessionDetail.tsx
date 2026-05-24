import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useHistoryStore, type SessionDetail } from '../../stores/historyStore'

export function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const loadSessionDetail = useHistoryStore((s) => s.loadSessionDetail)
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    setIsLoading(true)
    loadSessionDetail(sessionId).then((data) => {
      if (data) {
        setDetail(data)
      } else {
        setError('No se pudo cargar el detalle de la sesión')
      }
      setIsLoading(false)
    })
  }, [sessionId, loadSessionDetail])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
          Cargando sesión...
        </div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <Link
          to="/historial"
          className="text-brand-lightAccent text-sm font-medium hover:underline"
        >
          ← Volver al historial
        </Link>
        <div className="p-4 bg-brand-dangerBg border border-brand-dangerBorder rounded-lg text-brand-danger text-sm">
          {error ?? 'Sesión no encontrada'}
        </div>
      </div>
    )
  }

  const date = new Date(detail.session.fecha_completado)
  const formattedDate = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      <Link
        to="/historial"
        className="text-brand-lightAccent text-sm font-medium hover:underline"
      >
        ← Volver al historial
      </Link>

      {/* Session header */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4">
        <h2 className="text-brand-primaryText text-xl font-bold font-heading mb-1">
          {detail.session.block_name ?? 'Entrenamiento'}
        </h2>
        <p className="text-brand-mutedText text-sm capitalize">
          {formattedDate}
        </p>
        <p className="text-brand-lightAccent text-xs font-bold mt-2">
          {detail.exercises.length} ejercicios completados
        </p>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {detail.exercises.map((exercise, idx) => (
          <div
            key={idx}
            className="bg-brand-card border border-brand-border rounded-xl p-4"
          >
            <div className="mb-3">
              <h3 className="text-brand-primaryText font-bold text-lg">
                {exercise.exercise_name}
              </h3>
              {exercise.snapshot_grupo_muscular && (
                <p className="text-brand-mutedText text-xs">
                  {exercise.snapshot_grupo_muscular}
                </p>
              )}
            </div>

            {/* Sets table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-brand-mutedText text-xs border-b border-brand-border">
                    <th className="text-left py-2 pr-4">Serie</th>
                    <th className="text-right pr-4">Peso</th>
                    <th className="text-right pr-4">Reps</th>
                    <th className="text-right pr-4">RPE</th>
                    <th className="text-right">Objetivo</th>
                  </tr>
                </thead>
                <tbody>
                  {exercise.sets.map((set) => {
                    const repsOk =
                      !set.snapshot_reps_objetivo_max ||
                      (set.reps_reales ?? 0) >= set.snapshot_reps_objetivo_max
                    const rpeOk =
                      !set.snapshot_rpe_objetivo ||
                      (set.rpe_real ?? 0) >= set.snapshot_rpe_objetivo

                    return (
                      <tr
                        key={set.orden_serie}
                        className="border-b border-brand-border/50 last:border-0"
                      >
                        <td className="py-3 pr-4 text-brand-primaryText font-medium">
                          {set.orden_serie}
                        </td>
                        <td className="py-3 pr-4 text-right text-brand-lightAccent">
                          {set.peso ? `${set.peso} kg` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span
                            className={
                              repsOk ? 'text-green-400' : 'text-brand-mutedText'
                            }
                          >
                            {set.reps_reales ?? '—'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span
                            className={
                              rpeOk ? 'text-green-400' : 'text-brand-mutedText'
                            }
                          >
                            {set.rpe_real ?? '—'}
                          </span>
                        </td>
                        <td className="py-3 text-right text-brand-mutedText text-xs">
                          {set.snapshot_reps_objetivo_min &&
                          set.snapshot_reps_objetivo_max
                            ? `${set.snapshot_reps_objetivo_min}-${set.snapshot_reps_objetivo_max}`
                            : set.snapshot_reps_objetivo_min
                              ? `${set.snapshot_reps_objetivo_min}+`
                              : '—'}
                          {set.snapshot_rpe_objetivo &&
                            ` · RPE ${set.snapshot_rpe_objetivo}`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
