import { create } from 'zustand'

const STORAGE_KEY = 'gymbro-theme'

type Theme = 'light' | 'dark'

interface ThemeState {
  mode: Theme
  setMode: (mode: Theme) => void
  toggle: () => void
  init: () => void
}

function applyTheme(mode: Theme) {
  document.documentElement.classList.toggle('light-mode', mode === 'light')
}

function resolveSystemPreference(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',

  setMode: (mode) => {
    set({ mode })
    applyTheme(mode)
    try { localStorage.setItem(STORAGE_KEY, mode) } catch { /* noop */ }
  },

  toggle: () => {
    const next = get().mode === 'dark' ? 'light' : 'dark'
    get().setMode(next)
  },

  init: () => {
    let stored: Theme | null = null
    try { stored = localStorage.getItem(STORAGE_KEY) as Theme | null } catch { /* noop */ }

    const mode = stored === 'light' || stored === 'dark' ? stored : resolveSystemPreference()
    set({ mode })
    applyTheme(mode)
  },
}))
