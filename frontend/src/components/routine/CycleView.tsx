import { useRoutineStore } from '../../stores/routineStore'
import type { Block, Cycle } from '../../types'

interface CycleViewProps {
  onEditBlock: (block: Block) => void
  onStartWorkout: (block: Block) => void
  onRestDay: () => void
}

function getBlockStatus(
  block: Block,
  cycle: Cycle | null
): 'completado' | 'actual' | 'pendiente' | 'descanso' {
  if (block.es_descanso) return 'descanso'
  if (!cycle || !cycle.activo) return 'pendiente'
  if (block.posicion < cycle.posicion_actual) return 'completado'
  if (block.posicion === cycle.posicion_actual) return 'actual'
  return 'pendiente'
}

function statusLabel(status: ReturnType<typeof getBlockStatus>) {
  switch (status) {
    case 'completado':
      return 'Completado'
    case 'actual':
      return 'Hoy'
    case 'pendiente':
      return 'Pendiente'
    case 'descanso':
      return 'Descanso'
  }
}

function statusClasses(status: ReturnType<typeof getBlockStatus>) {
  switch (status) {
    case 'completado':
      return 'bg-brand-accent/20 border-brand-accent text-brand-lightAccent'
    case 'actual':
      return 'bg-brand-lightAccent/20 border-brand-lightAccent text-brand-lightAccent'
    case 'pendiente':
      return 'bg-brand-card border-brand-border text-white'
    case 'descanso':
      return 'bg-brand-dark border-brand-border text-brand-mutedText opacity-70'
  }
}

export function CycleView({ onEditBlock, onStartWorkout, onRestDay }: CycleViewProps) {
  const blocks = useRoutineStore((s) => s.blocks)
  const cycle = useRoutineStore((s) => s.cycle)
  const isLoading = useRoutineStore((s) => s.isLoading)
  const blockExercises = useRoutineStore((s) => s.blockExercises)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
          Cargando rutina...
        </div>
      </div>
    )
  }

  if (blocks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-brand-mutedText">No tienes una rutina configurada.</p>
      </div>
    )
  }

  const currentPos = cycle?.posicion_actual ?? 1
  const completedCount = blocks.filter((b) => !b.es_descanso && b.posicion < currentPos).length
  const totalTraining = blocks.filter((b) => !b.es_descanso).length

  return (
    <div className="space-y-4">
      {/* Cycle header */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold font-[Montserrat]">Ciclo Actual</h3>
          <span className="text-brand-lightAccent text-sm font-medium">
            Posición actual: {currentPos}
          </span>
        </div>
        <div className="w-full bg-brand-dark rounded-full h-2 overflow-hidden">
          <div
            className="bg-brand-accent h-2 rounded-full transition-all"
            style={{ width: `${(currentPos / 7) * 100}%` }}
          />
        </div>
        <p className="text-brand-mutedText text-xs mt-2">
          {completedCount} de {totalTraining} entrenamientos completados
        </p>
      </div>

      {/* Days list */}
      <div className="space-y-2">
        {blocks.map((block) => {
          const status = getBlockStatus(block, cycle)
          const isEditable = cycle?.activo
            ? block.posicion > currentPos
            : true
          const isCurrent = block.posicion === currentPos
          const exercises = blockExercises.filter((e) => e.block_id === block.id)

          return (
            <div
              key={block.id}
              className={`rounded-xl border p-4 ${statusClasses(status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black">{block.posicion}</span>
                  <div>
                    <h4 className="font-bold">{block.nombre}</h4>
                    <span className="text-xs opacity-80">{statusLabel(status)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isCurrent && !block.es_descanso && (
                    <button
                      onClick={() => onStartWorkout(block)}
                      className="bg-brand-accent text-white px-3 py-1.5 rounded-lg text-sm font-bold active:bg-brand-lightAccent transition-colors"
                    >
                      Empezar Rutina
                    </button>
                  )}
                  {isCurrent && block.es_descanso && (
                    <button
                      onClick={onRestDay}
                      className="bg-brand-accent text-white px-3 py-1.5 rounded-lg text-sm font-bold active:bg-brand-lightAccent transition-colors"
                    >
                      Hoy descanso
                    </button>
                  )}
                  {isEditable && (
                    <button
                      onClick={() => onEditBlock(block)}
                      aria-label="Editar bloque"
                      className="bg-brand-dark border border-brand-border text-white px-3 py-1.5 rounded-lg text-sm active:bg-brand-card transition-colors"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>

              {/* Exercises preview */}
              {!block.es_descanso && exercises.length > 0 && (
                <div className="mt-2 space-y-1">
                  {exercises.map((ex) => (
                    <p key={ex.id} className="text-xs opacity-80">
                      {ex.exercise?.nombre ?? 'Ejercicio'} — {ex.series_objetivo} series ·{' '}
                      {ex.reps_objetivo_min}-{ex.reps_objetivo_max} reps
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
