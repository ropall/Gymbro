import { useAppStore } from './stores/appStore'
import { Layout } from './components/Layout'
import { Inicio } from './pages/Inicio'
import { Rutinas } from './pages/Rutinas'
import { Historial } from './pages/Historial'
import { Nutricion } from './pages/Nutricion'
import { Perfil } from './pages/Perfil'

const pages = {
  inicio: Inicio,
  rutinas: Rutinas,
  historial: Historial,
  nutricion: Nutricion,
  perfil: Perfil,
}

export default function App() {
  const activeTab = useAppStore((state) => state.activeTab)
  const Page = pages[activeTab]

  return (
    <Layout>
      <Page />
    </Layout>
  )
}
