import { useAppStore } from '../stores/appStore'
import type { Tab } from '../stores/appStore'

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'inicio', label: 'Inicio', icon: '🏠' },
  { key: 'rutinas', label: 'Rutinas', icon: '📋' },
  { key: 'historial', label: 'Historial', icon: '📊' },
  { key: 'nutricion', label: 'Nutrición', icon: '🍎' },
  { key: 'perfil', label: 'Perfil', icon: '👤' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <nav className="sticky bottom-0 bg-brand-dark border-t border-brand-border">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center py-2 px-4 text-xs transition-colors ${
                activeTab === tab.key
                  ? 'text-brand-lightAccent'
                  : 'text-brand-mutedText hover:text-white'
              }`}
              aria-label={tab.label}
              aria-current={activeTab === tab.key ? 'page' : undefined}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
