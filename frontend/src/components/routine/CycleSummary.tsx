import { useRoutineStore } from '../../stores/routineStore'

interface CycleSummaryProps {
  onStartNewCycle: () => void
  onEditBlocks: () => void
}

export function CycleSummary({ onStartNewCycle, onEditBlocks }: CycleSummaryProps) {
  const blocks = useRoutineStore((s) => s.blocks)
  const blockExercises = useRoutineStore((s) => s.blockExercises)

  const trainingBlocks = blocks.filter((b) => !b.es_descanso)
  const totalExercises = blockExercises.length
  const avgSeries =
    totalExercises > 0
      ? Math.round(
          blockExercises.reduce((sum, e) => sum + e.series_objetivo, 0) / totalExercises
        )
      : 0

  return (
    <div className="space-y-6">
      <div className="bg-brand-card border border-brand-lightAccent/30 rounded-xl p-6 text-center">
        <h2 className="text-2xl font-bold text-brand-lightAccent mb-2 font-heading">
          ¡Ciclo Completado!
        </h2>
        <p className="text-brand-mutedText text-sm mb-4">
          Has finalizado tus 7 días de entrenamiento.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-brand-dark border border-brand-border rounded-lg p-3">
            <p className="text-2xl font-black text-brand-lightAccent">{trainingBlocks.length}</p>
            <p className="text-brand-mutedText text-xs">Entrenamientos</p>
          </div>
          <div className="bg-brand-dark border border-brand-border rounded-lg p-3">
            <p className="text-2xl font-black text-brand-lightAccent">{totalExercises}</p>
            <p className="text-brand-mutedText text-xs">Ejercicios</p>
          </div>
          <div className="bg-brand-dark border border-brand-border rounded-lg p-3">
            <p className="text-2xl font-black text-brand-lightAccent">{avgSeries}</p>
            <p className="text-brand-mutedText text-xs">Series promedio</p>
          </div>
        </div>

        {/* Blocks summary */}
        <div className="text-left space-y-2 mb-6">
          {trainingBlocks.map((block) => {
            const exercises = blockExercises.filter((e) => e.block_id === block.id)
            return (
              <div
                key={block.id}
                className="bg-brand-dark border border-brand-border rounded-lg p-3"
              >
                <p className="text-brand-primaryText font-medium text-sm">{block.nombre}</p>
                <p className="text-brand-mutedText text-xs">
                  {exercises.length} ejercicios ·{' '}
                  {exercises.reduce((s, e) => s + e.series_objetivo, 0)} series totales
                </p>
              </div>
            )
          })}
        </div>

        <div className="space-y-2">
          <button
            onClick={onEditBlocks}
            className="w-full bg-brand-card border border-brand-border text-brand-primaryText px-4 py-3 rounded-xl font-bold active:bg-brand-dark transition-colors"
          >
            Editar bloques antes de reiniciar
          </button>
          <button
            onClick={onStartNewCycle}
            className="w-full bg-brand-accent text-white px-4 py-3 rounded-xl font-bold active:bg-brand-lightAccent transition-colors"
          >
            Iniciar nuevo ciclo
          </button>
        </div>
      </div>
    </div>
  )
}
