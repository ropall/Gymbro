import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Login } from '../pages/Login'
import { SignUp } from '../pages/SignUp'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { useAuthStore } from '../stores/authStore'

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
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

  it('renders email and password inputs', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('calls signInWithPassword on form submit', async () => {
    const user = userEvent.setup()
    const { supabase } = await import('../lib/supabase')

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('shows error when fields are empty', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByText('Por favor completa todos los campos')).toBeInTheDocument()
  })

  it('has a link to sign up page', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    expect(screen.getByText('¿No tienes cuenta? Crea una')).toBeInTheDocument()
    expect(screen.getByText('¿No tienes cuenta? Crea una').closest('a')).toHaveAttribute('href', '/signup')
  })

  it('shows forgot password form when link is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.click(screen.getByText('¿Olvidaste tu contraseña?'))

    expect(screen.getByRole('button', { name: /Enviar enlace de restablecimiento/i })).toBeInTheDocument()
    expect(screen.getByText('Volver al inicio de sesión')).toBeInTheDocument()
  })

  it('calls resetPasswordForEmail on forgot password form submit', async () => {
    const user = userEvent.setup()
    const { supabase } = await import('../lib/supabase')

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await user.click(screen.getByText('¿Olvidaste tu contraseña?'))
    await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /Enviar enlace de restablecimiento/i }))

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({ redirectTo: expect.stringContaining('/reset-password') })
      )
    })
  })
})

describe('SignUp page', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isNewUser: false,
    })
  })

  it('renders sign up form', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirmar contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument()
  })

  it('calls signUp on form submit', async () => {
    const user = userEvent.setup()
    const { supabase } = await import('../lib/supabase')

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('Correo electrónico'), 'new@example.com')
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123')
    await user.type(screen.getByPlaceholderText('Confirmar contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      })
    })
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123')
    await user.type(screen.getByPlaceholderText('Confirmar contraseña'), 'different')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })

  it('shows success message and Ok button after successful signup', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText('Correo electrónico'), 'new@example.com')
    await user.type(screen.getByPlaceholderText('Contraseña'), 'password123')
    await user.type(screen.getByPlaceholderText('Confirmar contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await waitFor(() => {
      expect(screen.getByText(/Cuenta Registrada/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument()
  })

  it('has a link to login page', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    )

    expect(screen.getByText('¿Ya tienes cuenta? Inicia sesión')).toBeInTheDocument()
    expect(screen.getByText('¿Ya tienes cuenta? Inicia sesión').closest('a')).toHaveAttribute('href', '/login')
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
