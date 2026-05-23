import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import App from '../App'
import { useAppStore } from '../stores/appStore'

describe('Layout', () => {
  beforeEach(() => {
    useAppStore.setState({ activeTab: 'inicio' })
  })

  it('renders all five navigation tabs', () => {
    render(<App />)

    expect(screen.getByLabelText('Inicio')).toBeInTheDocument()
    expect(screen.getByLabelText('Rutinas')).toBeInTheDocument()
    expect(screen.getByLabelText('Historial')).toBeInTheDocument()
    expect(screen.getByLabelText('Nutrición')).toBeInTheDocument()
    expect(screen.getByLabelText('Perfil')).toBeInTheDocument()
  })

  it('highlights the active tab', () => {
    render(<App />)

    const inicioTab = screen.getByLabelText('Inicio')
    const rutinasTab = screen.getByLabelText('Rutinas')

    expect(inicioTab).toHaveAttribute('aria-current', 'page')
    expect(rutinasTab).not.toHaveAttribute('aria-current')
  })

  it('switches content when clicking a different tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText('Bienvenido a tu app de entrenamiento')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Rutinas'))

    expect(screen.getByText('Gestiona tus bloques de entrenamiento')).toBeInTheDocument()
  })
})
