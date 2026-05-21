import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Layout from '../components/layout/Layout'

describe('Layout', () => {
  it('renderiza los cinco tabs de navegación', () => {
    render(<Layout />)

    expect(screen.getByLabelText('Inicio')).toBeInTheDocument()
    expect(screen.getByLabelText('Rutinas')).toBeInTheDocument()
    expect(screen.getByLabelText('Historial')).toBeInTheDocument()
    expect(screen.getByLabelText('Nutrición')).toBeInTheDocument()
    expect(screen.getByLabelText('Perfil')).toBeInTheDocument()
  })

  it('muestra la página de Inicio por defecto', () => {
    render(<Layout />)

    expect(screen.getByText('Dashboard principal')).toBeInTheDocument()
  })
})
