import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { useOnlineStatus } from '../utils/useOnlineStatus'
import { useWorkoutStore } from '../stores/workoutStore'
import { Home, Dumbbell, ChartNoAxesColumn, Apple, User, LogOut, Sun, Moon } from 'lucide-react'

const tabs: { path: string; label: string; Icon: React.ElementType }[] = [
  { path: '/', label: 'Inicio', Icon: Home },
  { path: '/rutinas', label: 'Rutinas', Icon: Dumbbell },
  { path: '/historial', label: 'Historial', Icon: ChartNoAxesColumn },
  { path: '/nutricion', label: 'Nutrición', Icon: Apple },
  { path: '/perfil', label: 'Perfil', Icon: User },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuthStore()
  const { mode, toggle } = useThemeStore()
  const isOnline = useOnlineStatus()
  const pendingSync = useWorkoutStore((s) => s.pendingSync)

  const isActive = (path: string) => location.pathname === path

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-brand-accent to-brand-lightAccent flex items-center justify-center shrink-0">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-brand-primaryText font-heading tracking-tight">Gymbro</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-2" aria-label="Navegación principal">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-medium transition-colors ${
              isActive(tab.path)
                ? 'bg-brand-lightAccent text-brand-inverseText'
                : 'text-brand-mutedText hover:text-brand-primaryText hover:bg-brand-card'
            }`}
            aria-label={tab.label}
            aria-current={isActive(tab.path) ? 'page' : undefined}
          >
            <tab.Icon className="w-5 h-5 shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-brand-border space-y-1">
        <button
          onClick={() => toggle()}
          className="flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-medium text-brand-mutedText hover:text-brand-primaryText hover:bg-brand-card transition-colors w-full"
          aria-label={mode === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {mode === 'dark' ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
          <span>{mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-medium text-brand-mutedText hover:text-brand-danger hover:bg-brand-card transition-colors w-full"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Salir</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-brand-sidebar border-r border-brand-border sidebar-shadow z-40">
        {sidebarContent}
      </aside>

      {/* Main area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-brand-dark/90 backdrop-blur-md border-b border-brand-border md:border-b-0 md:pt-4 md:px-6">
          <div className="flex items-center justify-between md:justify-end px-4 py-3 md:px-0 gap-2">
            <span className="md:hidden text-sm font-bold text-brand-primaryText font-heading">Gymbro</span>
            <div className="flex items-center gap-2">
              {pendingSync && (
                <span className="badge bg-brand-warningBg text-brand-warning border border-brand-warningBorder">
                  Pendiente
                </span>
              )}
              {!isOnline && (
                <span className="badge bg-brand-dangerBg text-brand-danger border border-brand-dangerBorder">
                  Sin conexión
                </span>
              )}
              {/* Mobile theme toggle */}
              <button
                onClick={() => toggle()}
                className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-brand-mutedText hover:text-brand-primaryText hover:bg-brand-card transition-colors"
                aria-label={mode === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden sticky bottom-0 bg-brand-sidebar/95 backdrop-blur-md border-t border-brand-border z-40 safe-area-pb">
          <div className="flex justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center py-2 px-3 text-[11px] font-medium transition-colors min-w-[64px] ${
                  isActive(tab.path)
                    ? 'text-brand-lightAccent'
                    : 'text-brand-mutedText hover:text-brand-primaryText'
                }`}
                aria-label={tab.label}
                aria-current={isActive(tab.path) ? 'page' : undefined}
              >
                <tab.Icon className="w-5 h-5 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            ))}
            <button
              onClick={() => signOut()}
              className="flex flex-col items-center py-2 px-3 text-[11px] font-medium transition-colors text-brand-mutedText hover:text-brand-danger min-w-[64px]"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 mb-0.5" />
              <span>Salir</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}
