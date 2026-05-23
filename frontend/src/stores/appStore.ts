import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Tab = 'inicio' | 'rutinas' | 'historial' | 'nutricion' | 'perfil'

interface AppState {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: 'inicio',
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    { name: 'gymbro-app-state' }
  )
)
