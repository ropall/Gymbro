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

  it('renders all five navigation tabs in sidebar and bottom nav', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    const labels = ['Inicio', 'Rutinas', 'Historial', 'Nutrición', 'Perfil', 'Cerrar sesión']
    for (const label of labels) {
      const elements = screen.getAllByLabelText(label)
      // At least one navigation element must exist (desktop sidebar + mobile bottom nav)
      expect(elements.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('highlights the active tab in both navs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    const inicioTabs = screen.getAllByLabelText('Inicio')
    const rutinasTabs = screen.getAllByLabelText('Rutinas')

    // All Inicio tabs should be marked as current page
    for (const tab of inicioTabs) {
      expect(tab).toHaveAttribute('aria-current', 'page')
    }
    // No Rutinas tab should be marked as current
    for (const tab of rutinasTabs) {
      expect(tab).not.toHaveAttribute('aria-current')
    }
  })

  it('switches content when clicking a tab', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Bienvenido a tu app de entrenamiento')).toBeInTheDocument()

    // Click the first Rutinas tab (desktop sidebar version)
    await user.click(screen.getAllByLabelText('Rutinas')[0])

    // Rutinas page now shows cycle view by default with tabs
    expect(screen.getByRole('button', { name: 'Mi Rutina' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Catálogo' })).toBeInTheDocument()
  })
})
