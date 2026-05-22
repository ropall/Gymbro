import { CatalogBrowser } from '../components/exercise/CatalogBrowser'

export function Rutinas() {
  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-white mb-1 font-[Montserrat]">Rutinas</h2>
      <p className="text-brand-mutedText mb-4">Catálogo de ejercicios</p>

      <CatalogBrowser />
    </div>
  )
}
