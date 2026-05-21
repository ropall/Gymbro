import { useAppStore } from '../../stores/appStore'
import { TABS } from '../../stores/tabs'

export default function BottomNav() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-brand-card/95 border-t border-brand-border backdrop-blur-md safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                isActive
                  ? 'text-brand-lightAccent'
                  : 'text-brand-mutedText hover:text-white'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-medium leading-none">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
