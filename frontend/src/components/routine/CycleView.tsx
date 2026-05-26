import { useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import { useRoutineStore } from '../../stores/routineStore'
import type { Block, Cycle } from '../../types'
import { Play, Pencil, Moon, CheckCircle2, Circle, Clock, Dumbbell, ArrowRight, GripVertical } from 'lucide-react'

interface CycleViewProps {
  onEditBlock: (block: Block) => void
  onStartWorkout: (block: Block) => void
  onRestDay: () => void
  onReorderBlocks?: (orderedIds: string[], draggedId: string) => void
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

export function CycleView({ onEditBlock, onStartWorkout, onRestDay, onReorderBlocks }: CycleViewProps) {
  const blocks = useRoutineStore((s) => s.blocks)
  const cycle = useRoutineStore((s) => s.cycle)
  const isLoading = useRoutineStore((s) => s.isLoading)
  const blockExercises = useRoutineStore((s) => s.blockExercises)

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | null>(null)

  // Touch drag support for mobile
  const [isTouchDragging, setIsTouchDragging] = useState(false)
  const touchDraggedBlockId = useRef<string | null>(null)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const ghostRef = useRef<HTMLDivElement | null>(null)
  const TOUCH_DRAG_THRESHOLD = 10

  const canReorder = !!onReorderBlocks

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    if (!canReorder) {
      e.preventDefault()
      return
    }
    setDraggedId(blockId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault()
    if (!canReorder || draggedId === blockId) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    const position: 'before' | 'after' = e.clientY < midpoint ? 'before' : 'after'

    setDragOverId(blockId)
    setDragOverPosition(position)
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeave = (_e: React.DragEvent, blockId: string) => {
    if (dragOverId === blockId) {
      setDragOverId(null)
      setDragOverPosition(null)
    }
  }

  const handleDrop = (e: React.DragEvent, _targetId: string) => {
    e.preventDefault()
    e.stopPropagation()

    // Use the last hovered block as target (more reliable than event target)
    const effectiveTargetId = dragOverId || _targetId

    if (!canReorder || !draggedId || draggedId === effectiveTargetId) {
      setDraggedId(null)
      setDragOverId(null)
      setDragOverPosition(null)
      return
    }

    const fromIndex = blocks.findIndex((b) => b.id === draggedId)
    if (fromIndex === -1) {
      setDraggedId(null)
      setDragOverId(null)
      setDragOverPosition(null)
      return
    }

    const movedBlock = blocks[fromIndex]
    const filtered = blocks.filter((b) => b.id !== draggedId)
    const dropIndex = filtered.findIndex((b) => b.id === effectiveTargetId)

    let result: Block[]
    if (dropIndex === -1) {
      // Fallback: append at end if target not found
      result = [...filtered, movedBlock]
    } else {
      const insertIndex = dragOverPosition === 'after' ? dropIndex + 1 : dropIndex
      result = [...filtered]
      result.splice(insertIndex, 0, movedBlock)
    }

    onReorderBlocks!(result.map((b) => b.id), draggedId)
    setDraggedId(null)
    setDragOverId(null)
    setDragOverPosition(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
    setDragOverPosition(null)
  }

  // ---- Touch event handlers (mobile drag & drop) ----

  const executeReorder = (draggedBlockId: string, targetBlockId: string, position: 'before' | 'after' | null) => {
    if (!canReorder || draggedBlockId === targetBlockId) return

    const fromIndex = blocks.findIndex((b) => b.id === draggedBlockId)
    if (fromIndex === -1) return

    const movedBlock = blocks[fromIndex]
    const filtered = blocks.filter((b) => b.id !== draggedBlockId)
    const dropIndex = filtered.findIndex((b) => b.id === targetBlockId)

    let result: Block[]
    if (dropIndex === -1) {
      result = [...filtered, movedBlock]
    } else {
      const insertIndex = position === 'after' ? dropIndex + 1 : dropIndex
      result = [...filtered]
      result.splice(insertIndex, 0, movedBlock)
    }

    onReorderBlocks!(result.map((b) => b.id), draggedBlockId)
  }

  const createGhost = (blockId: string) => {
    const original = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement | null
    if (!original) return null

    const rect = original.getBoundingClientRect()
    const ghost = original.cloneNode(true) as HTMLDivElement

    ghost.style.position = 'fixed'
    ghost.style.left = `${rect.left}px`
    ghost.style.top = `${rect.top}px`
    ghost.style.width = `${rect.width}px`
    ghost.style.height = `${rect.height}px`
    ghost.style.zIndex = '9999'
    ghost.style.pointerEvents = 'none'
    ghost.style.opacity = '0.9'
    ghost.style.transform = 'scale(1.02)'
    ghost.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)'
    ghost.style.transition = 'none'
    ghost.removeAttribute('data-testid')

    document.body.appendChild(ghost)
    return ghost
  }

  const updateGhostPosition = (ghost: HTMLDivElement, x: number, y: number) => {
    const rect = ghost.getBoundingClientRect()
    ghost.style.left = `${x - rect.width / 2}px`
    ghost.style.top = `${y - rect.height / 2}px`
  }

  const removeGhost = () => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current)
      ghostRef.current = null
    }
  }

  const handleTouchStart = (e: React.TouchEvent, blockId: string) => {
    if (!canReorder) return
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    touchDraggedBlockId.current = blockId
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDraggedBlockId.current) return

    const touch = e.touches[0]

    // Detect drag vs. scroll
    if (!isTouchDragging && touchStartPos.current) {
      const dx = touch.clientX - touchStartPos.current.x
      const dy = touch.clientY - touchStartPos.current.y
      if (Math.sqrt(dx * dx + dy * dy) > TOUCH_DRAG_THRESHOLD) {
        setIsTouchDragging(true)
        setDraggedId(touchDraggedBlockId.current)
        ghostRef.current = createGhost(touchDraggedBlockId.current)

        // Hide original card
        const draggedCard = document.querySelector(`[data-block-id="${touchDraggedBlockId.current}"]`)
        if (draggedCard) (draggedCard as HTMLElement).style.visibility = 'hidden'
      } else {
        return // Still within tap threshold, allow scroll
      }
    }

    if (!isTouchDragging) return

    e.preventDefault() // Prevent scrolling while dragging

    // Move ghost under finger
    if (ghostRef.current) {
      updateGhostPosition(ghostRef.current, touch.clientX, touch.clientY)
    }

    // Find element under finger
    if (ghostRef.current) ghostRef.current.style.display = 'none'
    const target = document.elementFromPoint(touch.clientX, touch.clientY)
    if (ghostRef.current) ghostRef.current.style.display = ''

    let card = target?.closest('[data-block-id]') as HTMLElement | null

    // Fallback: find nearest card by Y position if elementFromPoint misses
    if (!card) {
      const allCards = document.querySelectorAll('[data-block-id]')
      let closestDist = Infinity
      allCards.forEach((el) => {
        const elId = el.getAttribute('data-block-id')
        if (elId === touchDraggedBlockId.current) return
        const rect = el.getBoundingClientRect()
        const centerY = rect.top + rect.height / 2
        const dist = Math.abs(touch.clientY - centerY)
        if (dist < closestDist) {
          closestDist = dist
          card = el as HTMLElement
        }
      })
    }

    if (card) {
      const blockId = card.getAttribute('data-block-id')
      if (blockId && blockId !== touchDraggedBlockId.current) {
        const rect = card.getBoundingClientRect()
        const midpoint = rect.top + rect.height / 2
        const position: 'before' | 'after' = touch.clientY < midpoint ? 'before' : 'after'
        setDragOverId(blockId)
        setDragOverPosition(position)
      }
    }
  }

  const cleanupTouchDrag = () => {
    removeGhost()
    if (touchDraggedBlockId.current) {
      const draggedCard = document.querySelector(`[data-block-id="${touchDraggedBlockId.current}"]`)
      if (draggedCard) (draggedCard as HTMLElement).style.visibility = ''
    }
    setIsTouchDragging(false)
    touchDraggedBlockId.current = null
    touchStartPos.current = null
    setDraggedId(null)
    setDragOverId(null)
    setDragOverPosition(null)
  }

  const handleTouchEnd = () => {
    if (isTouchDragging && touchDraggedBlockId.current && dragOverId) {
      executeReorder(touchDraggedBlockId.current, dragOverId, dragOverPosition)
    }
    cleanupTouchDrag()
  }

  const handleTouchCancel = () => {
    cleanupTouchDrag()
  }

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
      <div
        className="space-y-3"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {blocks.map((block) => {
          const status = getBlockStatus(block, cycle)
          const config = statusConfig(status)
          const isEditable = cycle?.activo ? block.posicion > currentPos : true
          const isCurrent = block.posicion === currentPos
          const exercises = blockExercises.filter((e) => e.block_id === block.id)
          const isDragging = draggedId === block.id
          const isDragOver = dragOverId === block.id

          const isDragOverBefore = isDragOver && dragOverPosition === 'before'
          const isDragOverAfter = isDragOver && dragOverPosition === 'after'

          return (
            <div
              key={block.id}
              data-testid="block-card"
              data-block-id={block.id}
              draggable={canReorder}
              onDragStart={(e) => handleDragStart(e, block.id)}
              onDragOver={(e) => handleDragOver(e, block.id)}
              onDragLeave={(e) => handleDragLeave(e, block.id)}
              onDrop={(e) => handleDrop(e, block.id)}
              onDragEnd={handleDragEnd}
              className={`
                card ${config.cardClass} ${isCurrent ? 'bg-brand-elevated' : ''}
                ${isDragging ? 'opacity-40 scale-[0.98] shadow-lg' : ''}
                ${isDragOver ? 'ring-2 ring-brand-lightAccent/40 border-brand-lightAccent/50' : ''}
                ${isDragOverBefore ? 'mt-8' : ''}
                ${isDragOverAfter ? 'mb-8' : ''}
                ${canReorder ? 'cursor-grab active:cursor-grabbing transition-all duration-200' : ''}
                ${isTouchDragging && isDragging ? 'pointer-events-none' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {canReorder && (
                    <div
                      className="text-brand-mutedText/50 select-none touch-none"
                      aria-label="Mover día"
                      onTouchStart={(e) => handleTouchStart(e, block.id)}
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                  )}
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
                      onPointerDown={(e) => e.stopPropagation()}
                      className="btn-primary h-9 px-3 text-[13px] gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Entrenar
                    </button>
                  )}
                  {isCurrent && block.es_descanso && (
                    <button
                      onClick={onRestDay}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="btn-primary h-9 px-3 text-[13px]"
                    >
                      Descansar
                    </button>
                  )}
                  {isEditable && (
                    <button
                      onClick={() => onEditBlock(block)}
                      onPointerDown={(e) => e.stopPropagation()}
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
                    <div key={ex.id} onPointerDown={(e) => e.stopPropagation()} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-brand-dark/40">
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
