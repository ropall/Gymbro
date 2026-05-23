import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const tabs: { path: string; label: string; icon: string }[] = [
  { path: '/', label: 'Inicio', icon: '🏠' },
  { path: '/rutinas', label: 'Rutinas', icon: '📋' },
  { path: '/historial', label: 'Historial', icon: '📊' },
  { path: '/nutricion', label: 'Nutrición', icon: '🍎' },
  { path: '/perfil', label: 'Perfil', icon: '👤' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuthStore()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <nav className="sticky bottom-0 bg-brand-dark border-t border-brand-border">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center py-2 px-4 text-xs transition-colors ${
                isActive(tab.path)
                  ? 'text-brand-lightAccent'
                  : 'text-brand-mutedText hover:text-white'
              }`}
              aria-label={tab.label}
              aria-current={isActive(tab.path) ? 'page' : undefined}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center py-2 px-4 text-xs transition-colors text-brand-mutedText hover:text-red-400"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <span className="text-lg">🚪</span>
            <span>Salir</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
