import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { useAuthStore } from '../stores/authStore'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}))

describe('Layout', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'test-user', email: 'test@example.com' } as any,
      session: { access_token: 'token' } as any,
      isLoading: false,
      isNewUser: false,
    })
  })

  it('renders all five navigation tabs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByLabelText('Inicio')).toBeInTheDocument()
    expect(screen.getByLabelText('Rutinas')).toBeInTheDocument()
    expect(screen.getByLabelText('Historial')).toBeInTheDocument()
    expect(screen.getByLabelText('Nutrición')).toBeInTheDocument()
    expect(screen.getByLabelText('Perfil')).toBeInTheDocument()
    expect(screen.getByLabelText('Cerrar sesión')).toBeInTheDocument()
  })

  it('highlights the active tab', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    const inicioTab = screen.getByLabelText('Inicio')
    const rutinasTab = screen.getByLabelText('Rutinas')

    expect(inicioTab).toHaveAttribute('aria-current', 'page')
    expect(rutinasTab).not.toHaveAttribute('aria-current')
  })

  it('switches content when clicking a different tab', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Bienvenido a tu app de entrenamiento')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Rutinas'))

    expect(screen.getByText('Catálogo de ejercicios')).toBeInTheDocument()
  })
})
