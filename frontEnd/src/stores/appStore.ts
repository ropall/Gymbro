import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tab } from './tabs'

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
    {
      name: 'gymbro-app-storage',
    }
  )
)
