import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { Rutinas } from '../pages/Rutinas'
import { useExerciseStore } from '../stores/exerciseStore'

describe('Rutinas - Exercise Catalog', () => {
  beforeEach(() => {
    useExerciseStore.getState().reset()
  })

  it('renders the exercise catalog with search and filter tabs', () => {
    render(<Rutinas />)

    expect(screen.getByText('Rutinas')).toBeInTheDocument()
    expect(screen.getByText('Catálogo de ejercicios')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar ejercicio...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pecho' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Espalda' })).toBeInTheDocument()
  })

  it('shows global exercises from seed data', () => {
    render(<Rutinas />)

    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument()
    expect(screen.getByText('Sentadilla Libre / Back Squat')).toBeInTheDocument()
  })

  it('filters exercises by muscle group', async () => {
    const user = userEvent.setup()
    render(<Rutinas />)

    await user.click(screen.getByRole('button', { name: 'Pecho' }))

    // Should show chest exercises
    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument()

    // Should not show leg exercises
    expect(screen.queryByText('Sentadilla Libre / Back Squat')).not.toBeInTheDocument()
  })

  it('searches exercises by name', async () => {
    const user = userEvent.setup()
    render(<Rutinas />)

    const searchInput = screen.getByPlaceholderText('Buscar ejercicio...')
    await user.type(searchInput, 'Press de Banca')

    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument()
    expect(screen.queryByText('Sentadilla Libre / Back Squat')).not.toBeInTheDocument()
  })

  it('shows exercise detail with variations', async () => {
    const user = userEvent.setup()
    render(<Rutinas />)

    await user.click(screen.getByText('Press de Banca Plano'))

    expect(screen.getByRole('heading', { name: 'Press de Banca Plano', level: 3 })).toBeInTheDocument()
    expect(screen.getAllByText('Pecho').length).toBeGreaterThan(0)
    expect(screen.getByText(/Agarre cerrado/)).toBeInTheDocument()
    expect(screen.getByText('Este ejercicio es de solo lectura del catálogo global.')).toBeInTheDocument()
  })

  it('creates a custom exercise and shows it in the catalog', async () => {
    const user = userEvent.setup()
    render(<Rutinas />)

    await user.click(screen.getByRole('button', { name: /Agregar ejercicio personalizado/i }))

    await user.type(screen.getByPlaceholderText('Ej. Curl de Bíceps Inclinado'), 'Curl Inclinado Custom')
    await user.type(screen.getByPlaceholderText('Ej. Mancuernas / Banco inclinado'), 'Mancuernas')

    await user.click(screen.getByRole('button', { name: /Guardar ejercicio/i }))

    await waitFor(() => {
      expect(screen.queryByText('Nuevo ejercicio personalizado')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Curl Inclinado Custom')).toBeInTheDocument()
    expect(screen.getByText('Personalizado')).toBeInTheDocument()
  })

  it('allows deleting a custom exercise', async () => {
    const user = userEvent.setup()
    useExerciseStore.getState().addCustomExercise({
      nombre: 'Mi Ejercicio',
      grupoMuscular: 'Pecho',
      equipo: 'Barra',
      variaciones: null,
    })

    render(<Rutinas />)

    await user.click(screen.getByText('Mi Ejercicio'))

    expect(screen.getByText('Ejercicio personalizado')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Eliminar ejercicio personalizado/i }))

    await waitFor(() => {
      expect(screen.queryByText('Mi Ejercicio')).not.toBeInTheDocument()
    })
  })

  it('does not allow deleting global exercises', async () => {
    const user = userEvent.setup()
    render(<Rutinas />)

    await user.click(screen.getByText('Press de Banca Plano'))

    expect(screen.queryByRole('button', { name: /Eliminar ejercicio personalizado/i })).not.toBeInTheDocument()
    expect(screen.getByText('Este ejercicio es de solo lectura del catálogo global.')).toBeInTheDocument()
  })
})
