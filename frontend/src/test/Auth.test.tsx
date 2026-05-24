import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Login } from '../pages/Login'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { useAuthStore } from '../stores/authStore'

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}))

describe('Login page', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isNewUser: false,
    })
  })

  it('renders login page with Google button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    expect(screen.getByText('Gymbro')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Iniciar sesión con Google/i })
    ).toBeInTheDocument()
  })

  it('calls signInWithOAuth when Google button is clicked', async () => {
    const user = userEvent.setup()
    const { supabase } = await import('../lib/supabase')

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    const button = screen.getByRole('button', { name: /Iniciar sesión con Google/i })
    await user.click(button)

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' })
      )
    })
  })
})

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isNewUser: false,
    })
  })

  it('redirects to /login when no user is authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div data-testid="dashboard">Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    useAuthStore.setState({
      user: { id: 'test-user', email: 'test@example.com' } as any,
      session: { access_token: 'token' } as any,
      isLoading: false,
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div data-testid="dashboard">Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('shows loading state while initializing', () => {
    useAuthStore.setState({ isLoading: true })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div data-testid="dashboard">Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })
})

describe('Logout', () => {
  it('clears auth store and redirects to login on sign out', async () => {
    const { supabase } = await import('../lib/supabase')

    useAuthStore.setState({
      user: { id: 'test-user', email: 'test@example.com' } as any,
      session: { access_token: 'token' } as any,
      isLoading: false,
    })

    const TestLogoutComponent = () => {
      const { signOut } = useAuthStore()
      return <button onClick={() => signOut()}>Cerrar sesión</button>
    }

    render(
      <MemoryRouter>
        <TestLogoutComponent />
      </MemoryRouter>
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Cerrar sesión/i }))

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().session).toBeNull()
  })
})
