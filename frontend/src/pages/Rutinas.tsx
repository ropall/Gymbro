import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { CycleView } from '../components/routine/CycleView'
import { BlockEditor } from '../components/routine/BlockEditor'
import { CycleSummary } from '../components/routine/CycleSummary'
import { CatalogBrowser } from '../components/exercise/CatalogBrowser'
import { useExerciseStore } from '../stores/exerciseStore'
import { useRoutineStore } from '../stores/routineStore'
import type { Block } from '../types'

export function Rutinas() {
  const navigate = useNavigate()
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const [showCatalog, setShowCatalog] = useState(false)

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

  function handleOpenCatalog() {
    const hasCatalogData = globalExercises.length > 0 || customExercises.length > 0
    if (!hasCatalogData) {
      loadData()
    }
    setShowCatalog(true)
  }

  return (
    <div className="pb-20">
      {/* Green header */}
      <div className="bg-brand-accent/85 backdrop-blur-sm px-4 py-6 md:py-10 mb-6 text-center w-full relative">
        <h1 className="text-white font-bold font-heading text-2xl md:text-4xl tracking-tight">
          Rutinas
        </h1>
        <button
          onClick={handleOpenCatalog}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
        >
          <BookOpen className="w-4 h-4" />
          Catálogo
        </button>
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

      {/* Catalog modal */}
      {showCatalog && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowCatalog(false)}
        >
          <div
            className="bg-brand-card w-full sm:max-w-lg sm:rounded-lg rounded-t-lg p-5 border border-brand-border max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-brand-primaryText font-heading">
                Catálogo de ejercicios
              </h3>
              <button
                onClick={() => setShowCatalog(false)}
                className="text-brand-mutedText hover:text-brand-primaryText text-2xl px-2"
              >
                ×
              </button>
            </div>
            <CatalogBrowser />
          </div>
        </div>
      )}
    </div>
  )
}
