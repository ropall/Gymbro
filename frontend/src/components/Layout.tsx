import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useOnlineStatus } from '../utils/useOnlineStatus'
import { useWorkoutStore } from '../stores/workoutStore'

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
  const isOnline = useOnlineStatus()
  const pendingSync = useWorkoutStore((s) => s.pendingSync)

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-brand-dark/90 backdrop-blur-md border-b border-brand-border">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-accent to-brand-lightAccent flex items-center justify-center font-bold text-black text-xs shadow-lg shadow-brand-accent/20">
              G
            </div>
            <span className="text-sm font-bold text-white font-[Montserrat]">Gymbro</span>
          </div>
          <div className="flex items-center gap-2">
            {pendingSync && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                Pendiente
              </span>
            )}
            {!isOnline && (
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                Sin conexión
              </span>
            )}
          </div>
        </div>
      </header>
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
