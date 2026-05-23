import { useEffect } from 'react'
import { CatalogBrowser } from '../components/exercise/CatalogBrowser'
import { useExerciseStore } from '../stores/exerciseStore'

export function Rutinas() {
  const loadData = useExerciseStore((state) => state.loadData)
  const isLoading = useExerciseStore((state) => state.isLoading)
  const error = useExerciseStore((state) => state.error)
  const globalExercises = useExerciseStore((state) => state.globalExercises)
  const customExercises = useExerciseStore((state) => state.customExercises)

  useEffect(() => {
    const hasData = globalExercises.length > 0 || customExercises.length > 0
    if (!hasData) {
      loadData()
    }
  }, [loadData, globalExercises.length, customExercises.length])

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-white mb-1 font-[Montserrat]">Rutinas</h2>
      <p className="text-brand-mutedText mb-4">Catálogo de ejercicios</p>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
            Cargando catálogo...
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isLoading && <CatalogBrowser />}
    </div>
  )
}
