import { useState } from 'react'
import { useProgressStore } from '../../stores/progressStore'
import { useEffect } from 'react'

type ViewMode = 'peso' | 'volumen'

export function ExerciseProgress() {
  const exercises = useProgressStore((s) => s.exercises)
  const progress = useProgressStore((s) => s.progress)
  const isLoading = useProgressStore((s) => s.isLoading)
  const error = useProgressStore((s) => s.error)
  const loadExercises = useProgressStore((s) => s.loadExercises)
  const loadProgress = useProgressStore((s) => s.loadProgress)

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('peso')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadExercises()
  }, [loadExercises])

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId)
    loadProgress(exerciseId)
  }

  const filteredExercises = exercises.filter((e) =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId)

  return (
    <div className="space-y-6">
      {/* Exercise selector */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4">
        <label className="text-brand-mutedText text-xs font-bold uppercase tracking-wide block mb-2">
          Seleccionar ejercicio
        </label>
        <input
          type="text"
          placeholder="Buscar ejercicio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-3 text-white text-sm min-h-[48px] focus:border-brand-lightAccent focus:outline-none mb-3"
        />
        <div className="max-h-48 overflow-y-auto space-y-1">
          {filteredExercises.slice(0, 10).map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => handleExerciseSelect(exercise.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedExerciseId === exercise.id
                  ? 'bg-brand-lightAccent/20 text-brand-lightAccent'
                  : 'bg-brand-dark text-white hover:bg-brand-dark/80'
              }`}
            >
              {exercise.nombre}
            </button>
          ))}
        </div>
        {filteredExercises.length > 10 && (
          <p className="text-brand-mutedText text-xs mt-2 text-center">
            Mostrando 10 de {filteredExercises.length} ejercicios
          </p>
        )}
      </div>

      {/* View mode toggle */}
      {progress && (
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('peso')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
              viewMode === 'peso'
                ? 'bg-brand-accent text-white'
                : 'bg-brand-card text-brand-mutedText border border-brand-border'
            }`}
          >
            Peso Máximo
          </button>
          <button
            onClick={() => setViewMode('volumen')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
              viewMode === 'volumen'
                ? 'bg-brand-accent text-white'
                : 'bg-brand-card text-brand-mutedText border border-brand-border'
            }`}
          >
            Volumen Total
          </button>
        </div>
      )}

      {/* Progress display */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
            Cargando progreso...
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && progress && progress.sessions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-brand-mutedText text-sm">
            No hay registros de progreso para este ejercicio.
          </p>
        </div>
      )}

      {!isLoading && !error && progress && progress.sessions.length > 0 && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <h3 className="text-white font-bold text-lg mb-1">
            {progress.exercise_name}
          </h3>
          {progress.snapshot_grupo_muscular && (
            <p className="text-brand-mutedText text-xs mb-4">
              {progress.snapshot_grupo_muscular}
            </p>
          )}

          {/* Progress table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-brand-mutedText text-xs border-b border-brand-border">
                  <th className="text-left py-2 pr-4">Fecha</th>
                  <th className="text-right">
                    {viewMode === 'peso' ? 'Peso Máx (kg)' : 'Volumen (kg)'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {progress.sessions.map((session) => (
                  <tr
                    key={session.session_id}
                    className="border-b border-brand-border/50 last:border-0"
                  >
                    <td className="py-3 pr-4 text-white">
                      {new Date(session.fecha_completado).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 text-right text-brand-lightAccent font-bold">
                      {viewMode === 'peso'
                        ? (session.peso_max?.toFixed(1) ?? '—')
                        : (session.volumen_total?.toFixed(1) ?? '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple visual bar chart */}
          <div className="mt-4 space-y-2">
            {progress.sessions.slice(0, 10).map((session) => {
              const value =
                viewMode === 'peso' ? session.peso_max : session.volumen_total
              const maxValue = Math.max(
                ...(progress.sessions.map((s) =>
                  viewMode === 'peso' ? s.peso_max : s.volumen_total
                ) as number[])
              )
              const percentage = maxValue ? (value! / maxValue) * 100 : 0

              return (
                <div key={session.session_id} className="flex items-center gap-2">
                  <div className="w-20 text-brand-mutedText text-xs">
                    {new Date(session.fecha_completado).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <div className="flex-1 bg-brand-dark rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-brand-accent h-4 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-brand-lightAccent text-xs font-bold">
                    {value?.toFixed(0)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!selectedExercise && (
        <div className="text-center py-8">
          <p className="text-brand-mutedText text-sm">
            Selecciona un ejercicio para ver su progreso
          </p>
        </div>
      )}
    </div>
  )
}
