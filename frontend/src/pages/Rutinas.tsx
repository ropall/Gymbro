import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CatalogBrowser } from '../components/exercise/CatalogBrowser'
import { CycleView } from '../components/routine/CycleView'
import { BlockEditor } from '../components/routine/BlockEditor'
import { CycleSummary } from '../components/routine/CycleSummary'
import { useExerciseStore } from '../stores/exerciseStore'
import { useRoutineStore } from '../stores/routineStore'
import type { Block } from '../types'

export function Rutinas() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'rutina' | 'catalogo'>('rutina')
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)

  const loadData = useExerciseStore((state) => state.loadData)
  const globalExercises = useExerciseStore((state) => state.globalExercises)
  const customExercises = useExerciseStore((state) => state.customExercises)
  const isLoadingCatalog = useExerciseStore((state) => state.isLoading)
  const catalogError = useExerciseStore((state) => state.error)

  const loadBlocksAndCycle = useRoutineStore((state) => state.loadBlocksAndCycle)
  const isLoadingRoutine = useRoutineStore((state) => state.isLoading)
  const routineError = useRoutineStore((state) => state.error)
  const showCycleSummary = useRoutineStore((state) => state.showCycleSummary)
  const advancePosition = useRoutineStore((state) => state.advancePosition)
  const startNewCycle = useRoutineStore((state) => state.startNewCycle)

  useEffect(() => {
    const hasCatalogData = globalExercises.length > 0 || customExercises.length > 0
    if (!hasCatalogData && activeTab === 'catalogo') {
      loadData()
    }
  }, [loadData, globalExercises.length, customExercises.length, activeTab])

  useEffect(() => {
    loadBlocksAndCycle()
  }, [loadBlocksAndCycle])

  function handleStartWorkout(block: Block) {
    // Navigate to active workout mode (issue 008)
    // For now, we advance the cycle as a placeholder
    // In the full implementation, this would navigate to /workout/:blockId
    navigate(`/workout/${block.id}`)
  }

  function handleRestDay() {
    advancePosition()
  }

  function handleEditBlock(block: Block) {
    // Load catalog if needed for the editor
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

  const isLoading = isLoadingCatalog || isLoadingRoutine
  const error = catalogError || routineError

  return (
    <div className="p-4 pb-20">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('rutina')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
            activeTab === 'rutina'
              ? 'bg-brand-accent text-white'
              : 'bg-brand-card text-brand-mutedText border border-brand-border'
          }`}
        >
          Mi Rutina
        </button>
        <button
          onClick={() => setActiveTab('catalogo')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
            activeTab === 'catalogo'
              ? 'bg-brand-accent text-white'
              : 'bg-brand-card text-brand-mutedText border border-brand-border'
          }`}
        >
          Catálogo
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {activeTab === 'rutina' && (
        <>
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
        </>
      )}

      {activeTab === 'catalogo' && (
        <>
          {isLoading && activeTab === 'catalogo' && (
            <div className="flex items-center justify-center py-8">
              <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
                Cargando catálogo...
              </div>
            </div>
          )}
          {!isLoading && <CatalogBrowser />}
        </>
      )}

      {editingBlock && (
        <BlockEditor
          block={editingBlock}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  )
}
