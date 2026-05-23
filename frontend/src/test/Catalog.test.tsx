import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Rutinas } from '../pages/Rutinas'
import { useExerciseStore } from '../stores/exerciseStore'
import { supabase } from '../lib/supabase'

const mockExercises = [
  { id: 'g1', nombre: 'Press de Banca Plano', grupo_muscular: 'Pecho (Pectorales)', equipo: 'Barra / Mancuernas', variaciones: 'Agarre cerrado, agarre ancho', parent_id: null },
  { id: 'g2', nombre: 'Sentadilla Libre / Back Squat', grupo_muscular: 'Piernas (Cuádriceps)', equipo: 'Barra', variaciones: 'High bar, low bar', parent_id: null },
  { id: 'g3', nombre: 'Dominadas / Pull-ups', grupo_muscular: 'Espalda (Dorsales, Romboides, Trapecios)', equipo: 'Peso corporal', variaciones: null, parent_id: null },
]

function mockSupabaseCatalog() {
  vi.spyOn(supabase.auth, 'getUser').mockImplementation(() =>
    Promise.resolve({ data: { user: { id: 'test-user', email: 'test@example.com' } } } as any)
  )
  vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
    const chain: any = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() => Promise.resolve({
        data: table === 'global_exercises' ? mockExercises : [],
        error: null,
      })),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      insert: vi.fn((data: any) => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 'u1', ...data },
            error: null,
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    }
    return chain
  })
}

describe('Rutinas - Exercise Catalog', () => {
  beforeEach(() => {
    useExerciseStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('renders the exercise catalog with search and filter tabs', async () => {
    mockSupabaseCatalog()
    render(<Rutinas />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando catálogo...')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Rutinas')).toBeInTheDocument()
    expect(screen.getByText('Catálogo de ejercicios')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar ejercicio...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pecho' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Espalda' })).toBeInTheDocument()
  })

  it('shows global exercises from seed data', async () => {
    mockSupabaseCatalog()
    render(<Rutinas />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando catálogo...')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument()
    expect(screen.getByText('Sentadilla Libre / Back Squat')).toBeInTheDocument()
  })

  it('filters exercises by muscle group', async () => {
    const user = userEvent.setup()
    mockSupabaseCatalog()
    render(<Rutinas />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando catálogo...')).not.toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Pecho' }))
    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument()
    expect(screen.queryByText('Sentadilla Libre / Back Squat')).not.toBeInTheDocument()
  })

  it('searches exercises by name', async () => {
    const user = userEvent.setup()
    mockSupabaseCatalog()
    render(<Rutinas />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando catálogo...')).not.toBeInTheDocument()
    })
    const searchInput = screen.getByPlaceholderText('Buscar ejercicio...')
    await user.type(searchInput, 'Press de Banca')
    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument()
    expect(screen.queryByText('Sentadilla Libre / Back Squat')).not.toBeInTheDocument()
  })

  it('shows exercise detail with variations', async () => {
    const user = userEvent.setup()
    mockSupabaseCatalog()
    render(<Rutinas />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando catálogo...')).not.toBeInTheDocument()
    })
    await user.click(screen.getByText('Press de Banca Plano'))
    expect(screen.getByRole('heading', { name: 'Press de Banca Plano', level: 3 })).toBeInTheDocument()
    expect(screen.getAllByText('Pecho').length).toBeGreaterThan(0)
    expect(screen.getByText(/Agarre cerrado/)).toBeInTheDocument()
    expect(screen.getByText('Este ejercicio es de solo lectura del catálogo global.')).toBeInTheDocument()
  })

  it('creates a custom exercise and shows it in the catalog', async () => {
    const user = userEvent.setup()
    mockSupabaseCatalog()
    render(<Rutinas />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando catálogo...')).not.toBeInTheDocument()
    })
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
    useExerciseStore.setState({
      customExercises: [
        { id: 'u1', nombre: 'Mi Ejercicio', grupoMuscular: 'Pecho', equipo: 'Barra', variaciones: null, isCustom: true },
      ],
    })
    mockSupabaseCatalog()
    render(<Rutinas />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando catálogo...')).not.toBeInTheDocument()
    })
    await user.click(screen.getByText('Mi Ejercicio'))
    expect(screen.getByText('Ejercicio personalizado')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Eliminar ejercicio personalizado/i }))
    await waitFor(() => {
      expect(screen.queryByText('Mi Ejercicio')).not.toBeInTheDocument()
    })
  })

  it('does not allow deleting global exercises', async () => {
    const user = userEvent.setup()
    mockSupabaseCatalog()
    render(<Rutinas />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando catálogo...')).not.toBeInTheDocument()
    })
    await user.click(screen.getByText('Press de Banca Plano'))
    expect(screen.queryByRole('button', { name: /Eliminar ejercicio personalizado/i })).not.toBeInTheDocument()
    expect(screen.getByText('Este ejercicio es de solo lectura del catálogo global.')).toBeInTheDocument()
  })
})
