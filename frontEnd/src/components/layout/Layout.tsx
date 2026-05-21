import { useAppStore } from '../../stores/appStore'
import BottomNav from './BottomNav'
import Inicio from '../../pages/Inicio'
import Rutinas from '../../pages/Rutinas'
import Historial from '../../pages/Historial'
import Nutricion from '../../pages/Nutricion'
import Perfil from '../../pages/Perfil'

const PAGES = {
  inicio: Inicio,
  rutinas: Rutinas,
  historial: Historial,
  nutricion: Nutricion,
  perfil: Perfil,
} as const

export default function Layout() {
  const activeTab = useAppStore((s) => s.activeTab)
  const ActivePage = PAGES[activeTab]

  return (
    <div className="min-h-screen bg-brand-dark text-white pb-16">
      <ActivePage />
      <BottomNav />
    </div>
  )
}
