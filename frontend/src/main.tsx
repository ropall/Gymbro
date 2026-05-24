import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const init = useThemeStore((state) => state.init)

  useEffect(() => {
    init()
  }, [init])

  return <>{children}</>
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeInitializer>
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </ThemeInitializer>
    </BrowserRouter>
  </StrictMode>,
)
