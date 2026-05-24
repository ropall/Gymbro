import { Link } from 'react-router-dom'
import { useHistoryStore } from '../../stores/historyStore'
import { useEffect } from 'react'

export function SessionList() {
  const sessions = useHistoryStore((s) => s.sessions)
  const isLoading = useHistoryStore((s) => s.isLoading)
  const error = useHistoryStore((s) => s.error)
  const loadSessions = useHistoryStore((s) => s.loadSessions)

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
          Cargando historial...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-brand-dangerBg border border-brand-dangerBorder rounded-lg text-brand-danger text-sm">
        {error}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-brand-mutedText text-sm">
          No hay sesiones completadas aún. ¡Empieza tu primer entrenamiento!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const date = new Date(session.fecha_completado)
        const formattedDate = date.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        return (
          <Link
            key={session.id}
            to={`/historial/${session.id}`}
            className="block bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-lightAccent transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-brand-primaryText font-bold">
                  {session.block_name ?? 'Entrenamiento'}
                </h3>
                <p className="text-brand-mutedText text-xs capitalize">
                  {formattedDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-brand-lightAccent text-sm font-bold">
                  {session.exercise_count} ejercicios
                </p>
                <p className="text-brand-mutedText text-xs">
                  {new Date(session.fecha_completado).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
