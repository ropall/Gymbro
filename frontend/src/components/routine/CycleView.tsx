import { useNavigate } from 'react-router-dom'
import { useRoutineStore } from '../../stores/routineStore'
import type { Block, Cycle } from '../../types'
import { Play, Pencil, Moon, CheckCircle2, Circle, Clock, Dumbbell, ArrowRight } from 'lucide-react'

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

function statusConfig(status: ReturnType<typeof getBlockStatus>) {
  switch (status) {
    case 'completado':
      return {
        label: 'Completado',
        badgeClass: 'bg-brand-accent/20 text-brand-lightAccent border border-brand-accent/30',
        cardClass: 'border-brand-accent/30',
        icon: <CheckCircle2 className="w-4 h-4 text-brand-lightAccent" />,
      }
    case 'actual':
      return {
        label: 'Hoy',
        badgeClass: 'bg-brand-lightAccent/20 text-brand-lightAccent border border-brand-lightAccent/30',
        cardClass: 'border-brand-lightAccent/40 ring-1 ring-brand-lightAccent/20',
        icon: <Circle className="w-4 h-4 text-brand-lightAccent" />,
      }
    case 'pendiente':
      return {
        label: 'Pendiente',
        badgeClass: 'bg-brand-dark text-brand-mutedText border border-brand-border',
        cardClass: 'border-brand-border',
        icon: <Clock className="w-4 h-4 text-brand-mutedText" />,
      }
    case 'descanso':
      return {
        label: 'Descanso',
        badgeClass: 'bg-brand-dark text-brand-mutedText border border-brand-border',
        cardClass: 'border-brand-border opacity-70',
        icon: <Moon className="w-4 h-4 text-brand-mutedText" />,
      }
  }
}

export function CycleView({ onEditBlock, onStartWorkout, onRestDay }: CycleViewProps) {
  const blocks = useRoutineStore((s) => s.blocks)
  const cycle = useRoutineStore((s) => s.cycle)
  const isLoading = useRoutineStore((s) => s.isLoading)
  const blockExercises = useRoutineStore((s) => s.blockExercises)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
          Cargando rutina...
        </div>
      </div>
    )
  }

  if (blocks.length === 0) {
    return <EmptyRoutineState />
  }

  const currentPos = cycle?.posicion_actual ?? 1
  const completedCount = blocks.filter((b) => !b.es_descanso && b.posicion < currentPos).length
  const totalTraining = blocks.filter((b) => !b.es_descanso).length

  return (
    <div className="space-y-5">
      {/* Cycle progress card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-brand-primaryText font-bold font-heading text-base">Ciclo actual</h3>
          <span className="badge bg-brand-accent/20 text-brand-lightAccent border border-brand-accent/30">
            Posición {currentPos}
          </span>
        </div>
        <div className="progress-track mb-2">
          <div
            className="progress-fill"
            style={{ width: `${totalTraining > 0 ? (currentPos / 7) * 100 : 0}%` }}
          />
        </div>
        <p className="text-brand-mutedText text-xs">
          {completedCount} de {totalTraining} entrenamientos completados
        </p>
      </div>

      {/* Days list */}
      <div className="space-y-3">
        {blocks.map((block) => {
          const status = getBlockStatus(block, cycle)
          const config = statusConfig(status)
          const isEditable = cycle?.activo ? block.posicion > currentPos : true
          const isCurrent = block.posicion === currentPos
          const exercises = blockExercises.filter((e) => e.block_id === block.id)

          return (
            <div
              key={block.id}
              data-testid="block-card"
              className={`card ${config.cardClass} ${isCurrent ? 'bg-brand-elevated' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-dark flex items-center justify-center shrink-0">
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-brand-primaryText">{block.nombre}</h4>
                      <span className={`badge ${config.badgeClass}`}>{config.label}</span>
                    </div>
                    <p className="text-xs text-brand-mutedText mt-0.5">
                      Día {block.posicion}{block.es_descanso ? ' · Recuperación' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isCurrent && !block.es_descanso && (
                    <button
                      onClick={() => onStartWorkout(block)}
                      className="btn-primary h-9 px-3 text-[13px] gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Entrenar
                    </button>
                  )}
                  {isCurrent && block.es_descanso && (
                    <button
                      onClick={onRestDay}
                      className="btn-primary h-9 px-3 text-[13px]"
                    >
                      Descansar
                    </button>
                  )}
                  {isEditable && (
                    <button
                      onClick={() => onEditBlock(block)}
                      aria-label="Editar bloque"
                      className="btn-compact w-9 h-9 p-0"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Exercises preview */}
              {!block.es_descanso && exercises.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-brand-border">
                  {exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-brand-dark/40">
                      <span className="text-xs text-brand-primaryText font-medium">
                        {ex.exercise?.nombre ?? 'Ejercicio'}
                      </span>
                      <span className="text-[11px] text-brand-mutedText shrink-0">
                        {ex.series_objetivo} series · {ex.reps_objetivo_min}-{ex.reps_objetivo_max} reps
                      </span>
                    </div>
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

function EmptyRoutineState() {
  const navigate = useNavigate()

  return (
    <div className="card py-10 px-6 text-center">
      <div className="w-14 h-14 rounded-[14px] bg-brand-accent/15 flex items-center justify-center mx-auto mb-5">
        <Dumbbell className="w-7 h-7 text-brand-lightAccent" />
      </div>

      <h3 className="text-lg font-bold text-brand-primaryText font-heading tracking-tight mb-2">
        No tienes una rutina
      </h3>
      <p className="text-brand-mutedText text-sm max-w-[260px] mx-auto mb-6 leading-relaxed">
        Configura tu plan semanal para empezar a entrenar con consistencia y seguimiento.
      </p>

      <button
        onClick={() => navigate('/onboarding')}
        className="btn-primary gap-2 mx-auto"
      >
        Crear mi rutina
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-brand-mutedText text-xs mt-5">
        El onboarding te guiará paso a paso.
      </p>
    </div>
  )
}
