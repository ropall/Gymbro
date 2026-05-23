import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Rutinas } from '../pages/Rutinas'
import { useExerciseStore } from '../stores/exerciseStore'
import { supabase } from '../lib/supabase'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
}))

const mockExercises = [
  { id: 'g1', nombre: 'Press de Banca Plano', grupo_muscular: 'Pecho (Pectorales)', equipo: 'Barra / Mancuernas', variaciones: 'Agarre cerrado, agarre ancho', parent_id: null },
  { id: 'g2', nombre: 'Sentadilla Libre / Back Squat', grupo_muscular: 'Piernas (Cuádriceps)', equipo: 'Barra', variaciones: 'High bar, low bar', parent_id: null },
  { id: 'g3', nombre: 'Dominadas / Pull-ups', grupo_muscular: 'Espalda (Dorsales, Romboides, Trapecios)', equipo: 'Peso corporal', variaciones: null, parent_id: null },
]

function mockSupabaseCatalog() {
  vi.mocked(supabase.auth.getUser).mockImplementation(() =>
    Promise.resolve({ data: { user: { id: 'test-user', email: 'test@example.com' } } } as any)
  )

  vi.mocked(supabase.from).mockImplementation((table: string) => {
    const responses: Record<string, any> = {
      global_exercises: { data: mockExercises, error: null },
      user_exercises: { data: [], error: null },
      blocks: { data: [], error: null },
      cycles: { data: [], error: null },
      block_exercises: { data: [], error: null },
    }
    const response = responses[table] ?? { data: null, error: null }

    const chain = new Proxy({} as any, {
      get(_target, prop) {
        if (prop === 'then') {
          return (onFulfilled: any) => Promise.resolve(response).then(onFulfilled)
        }
        if (prop === 'catch') {
          return (onRejected: any) => Promise.resolve(response).catch(onRejected)
        }
        if (prop === 'insert') {
          return (data: any) => ({
            select: () => ({
              single: () => Promise.resolve({ data: { id: 'u1', ...data }, error: null }),
            }),
          })
        }
        return (..._args: any[]) => chain
      }
    })

    return chain
  })
}

function renderRutinas() {
  return render(
    <MemoryRouter>
      <Rutinas />
    </MemoryRouter>
  )
}

describe('Rutinas - Exercise Catalog', () => {
  beforeEach(() => {
    useExerciseStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('renders the exercise catalog with search and filter tabs', async () => {
    mockSupabaseCatalog()
    renderRutinas()
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })
    
    // Switch to Catalog tab
    await userEvent.click(screen.getByRole('button', { name: /Catálogo/i }))
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando catálogo...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByPlaceholderText('Buscar ejercicio...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pecho' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Espalda' })).toBeInTheDocument()
  })

  it('shows global exercises from seed data', async () => {
    mockSupabaseCatalog()
    renderRutinas()
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })
    
    await userEvent.click(screen.getByRole('button', { name: /Catálogo/i }))
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando catálogo...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument()
    expect(screen.getByText('Sentadilla Libre / Back Squat')).toBeInTheDocument()
  })

  it('filters exercises by muscle group', async () => {
    const user = userEvent.setup()
    mockSupabaseCatalog()
    renderRutinas()
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /Catálogo/i }))
    
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
    renderRutinas()
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /Catálogo/i }))
    
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
    renderRutinas()
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /Catálogo/i }))
    
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
    renderRutinas()
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /Catálogo/i }))
    
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
    renderRutinas()
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /Catálogo/i }))
    
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
    renderRutinas()
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /Catálogo/i }))
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando catálogo...')).not.toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Press de Banca Plano'))
    expect(screen.queryByRole('button', { name: /Eliminar ejercicio personalizado/i })).not.toBeInTheDocument()
    expect(screen.getByText('Este ejercicio es de solo lectura del catálogo global.')).toBeInTheDocument()
  })
})
