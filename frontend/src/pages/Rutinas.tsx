import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CycleView } from '../components/routine/CycleView'
import { BlockEditor } from '../components/routine/BlockEditor'
import { CycleSummary } from '../components/routine/CycleSummary'
import { useExerciseStore } from '../stores/exerciseStore'
import { useRoutineStore } from '../stores/routineStore'
import type { Block } from '../types'

export function Rutinas() {
  const navigate = useNavigate()
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)

  const loadData = useExerciseStore((state) => state.loadData)
  const globalExercises = useExerciseStore((state) => state.globalExercises)
  const customExercises = useExerciseStore((state) => state.customExercises)

  const loadBlocksAndCycle = useRoutineStore((state) => state.loadBlocksAndCycle)
  const routineError = useRoutineStore((state) => state.error)
  const showCycleSummary = useRoutineStore((state) => state.showCycleSummary)
  const advancePosition = useRoutineStore((state) => state.advancePosition)
  const startNewCycle = useRoutineStore((state) => state.startNewCycle)

  useEffect(() => {
    loadBlocksAndCycle()
  }, [loadBlocksAndCycle])

  function handleStartWorkout(block: Block) {
    navigate(`/workout/${block.id}`)
  }

  function handleRestDay() {
    advancePosition()
  }

  function handleEditBlock(block: Block) {
    const hasCatalogData = globalExercises.length > 0 || customExercises.length > 0
    if (!hasCatalogData) {
      loadData()
    }
    setEditingBlock(block)
  }

  function handleStartNewCycle() {
    startNewCycle()
  }

  function handleEditBlocks() {
    useRoutineStore.setState({ showCycleSummary: false })
  }

  return (
    <div className="pb-20">
      {/* Green header */}
      <div className="bg-brand-accent/85 backdrop-blur-sm px-4 py-6 md:py-10 mb-6 text-center w-full">
        <h1 className="text-white font-bold font-heading text-2xl md:text-4xl tracking-tight">
          Rutinas
        </h1>
      </div>

      <div className="px-4">
        {routineError && (
          <div className="mb-4 p-3 bg-brand-dangerBg border border-brand-dangerBorder rounded-lg text-brand-danger text-sm">
            {routineError}
          </div>
        )}

        {showCycleSummary ? (
          <CycleSummary
            onStartNewCycle={handleStartNewCycle}
            onEditBlocks={handleEditBlocks}
          />
        ) : (
          <CycleView
            onEditBlock={handleEditBlock}
            onStartWorkout={handleStartWorkout}
            onRestDay={handleRestDay}
          />
        )}

        {editingBlock && (
          <BlockEditor
            block={editingBlock}
            onClose={() => setEditingBlock(null)}
          />
        )}
      </div>
    </div>
  )
}
