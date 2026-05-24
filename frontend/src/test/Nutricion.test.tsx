import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Nutricion } from '../pages/Nutricion'
import { useNutritionStore } from '../stores/nutritionStore'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
}))

const mockMenus = [
  {
    id: 'menu-1',
    profile_id: 'user-1',
    nombre: 'Menú 1: Fuerza',
    calorias: 2900,
    proteinas: 165,
    carbohidratos: 380,
    grasas: 80,
    presupuesto: '400,000 COP/mes',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'menu-2',
    profile_id: 'user-1',
    nombre: 'Menú 2: Recuperación',
    calorias: 2600,
    proteinas: 150,
    carbohidratos: 340,
    grasas: 70,
    presupuesto: null,
    created_at: '2024-01-02T00:00:00Z',
  },
]

const mockMeals = [
  { id: 'meal-1', menu_id: 'menu-1', nombre_comida: 'Pre-Gimnasio', descripcion: 'Arepa + Café', orden: 1 },
  { id: 'meal-2', menu_id: 'menu-1', nombre_comida: 'Post-Entreno', descripcion: '4 Huevos + Avena', orden: 2 },
  { id: 'meal-3', menu_id: 'menu-2', nombre_comida: 'Almuerzo', descripcion: 'Pollo + Arroz', orden: 1 },
]

// Captured insert calls
let capturedInserts: Record<string, any[]> = {}

function createMockChain(table: string) {
  const responses: Record<string, any> = {
    nutrition_menus: { data: mockMenus, error: null },
    nutrition_meals: { data: mockMeals, error: null },
  }

  const response = responses[table] ?? { data: [], error: null }

  let chain: any
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (onFulfilled: any) => Promise.resolve(response).then(onFulfilled)
      }
      if (prop === 'catch') {
        return (onRejected: any) => Promise.resolve(response).catch(onRejected)
      }
      if (prop === 'in') {
        return () => chain
      }
      if (prop === 'insert') {
        return (data: any) => {
          if (!capturedInserts[table]) capturedInserts[table] = []
          capturedInserts[table].push(data)
          return {
            select: () => ({
              single: () => Promise.resolve({ data: { id: 'new-id', ...data }, error: null }),
            }),
          }
        }
      }
      return (..._args: any[]) => chain
    },
  }

  chain = new Proxy(() => {}, handler)
  return chain
}

function mockSupabaseNutrition() {
  vi.mocked(supabase.auth.getUser).mockImplementation(() =>
    Promise.resolve({ data: { user: { id: 'user-1', email: 'test@example.com' } } } as any)
  )

  vi.mocked(supabase.from).mockImplementation((table: string) =>
    createMockChain(table)
  )
}

describe('Nutricion page', () => {
  beforeEach(() => {
    useNutritionStore.getState().reset()
    useAuthStore.setState({ user: { id: 'user-1' } as any, isNewUser: false })
    vi.restoreAllMocks()
    capturedInserts = {}
  })

  it('renders the nutrition page with title', async () => {
    mockSupabaseNutrition()
    render(<Nutricion />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando nutrición...')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Nutrición')).toBeInTheDocument()
    expect(screen.getByText('Referencias de menús y macros')).toBeInTheDocument()
  })

  it('loads and displays menus as cards', async () => {
    mockSupabaseNutrition()
    render(<Nutricion />)
    await waitFor(() => {
      expect(screen.getByText('Menú 1: Fuerza')).toBeInTheDocument()
    })
    expect(screen.getByText('Menú 2: Recuperación')).toBeInTheDocument()
  })

  it('displays macro values on menu cards', async () => {
    mockSupabaseNutrition()
    render(<Nutricion />)
    await waitFor(() => {
      expect(screen.getByText('2900')).toBeInTheDocument()
    })
    expect(screen.getByText('165')).toBeInTheDocument()
    expect(screen.getByText('380')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
  })

  it('shows budget field on menus with budget', async () => {
    mockSupabaseNutrition()
    render(<Nutricion />)
    await waitFor(() => {
      expect(screen.getByText('400,000 COP/mes')).toBeInTheDocument()
    })
  })

  it('allows creating a new menu', async () => {
    const user = userEvent.setup()
    mockSupabaseNutrition()
    render(<Nutricion />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando nutrición...')).not.toBeInTheDocument()
    })

    await user.click(screen.getByText('+ Nuevo menú'))
    const input = screen.getByPlaceholderText('Nombre del menú')
    await user.type(input, 'Menú 3: Volumen')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(capturedInserts.nutrition_menus).toBeDefined()
      expect(capturedInserts.nutrition_menus.length).toBe(1)
      expect(capturedInserts.nutrition_menus[0].nombre).toBe('Menú 3: Volumen')
    })
  })

  it('allows deleting a menu with confirmation', async () => {
    const user = userEvent.setup()
    mockSupabaseNutrition()
    render(<Nutricion />)
    await waitFor(() => {
      expect(screen.getByText('Menú 1: Fuerza')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByLabelText(/Eliminar/)
    await user.click(deleteButtons[0])

    expect(screen.getByText('¿Eliminar?')).toBeInTheDocument()
    await user.click(screen.getByText('Sí'))

    await waitFor(() => {
      const menus = useNutritionStore.getState().menus
      expect(menus.find((m) => m.id === 'menu-1')).toBeUndefined()
    })
  })

  it('displays meals within expanded menus', async () => {
    mockSupabaseNutrition()
    render(<Nutricion />)
    await waitFor(() => {
      expect(screen.getByText('Pre-Gimnasio')).toBeInTheDocument()
    })
    expect(screen.getByText('Post-Entreno')).toBeInTheDocument()
    expect(screen.getByText('Almuerzo')).toBeInTheDocument()
  })

  it('allows adding a meal to a menu', async () => {
    const user = userEvent.setup()
    mockSupabaseNutrition()
    render(<Nutricion />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando nutrición...')).not.toBeInTheDocument()
    })

    const addButtons = screen.getAllByText('+ Agregar comida')
    await user.click(addButtons[0])

    const nameInput = screen.getByPlaceholderText('Ej: Pre-Gimnasio')
    await user.type(nameInput, 'Merienda')

    const descInput = screen.getByPlaceholderText('Ej: 1 Arepa de Promasa (100g cocida) + Café negro')
    await user.type(descInput, 'Yogur + Frutos secos')

    await user.click(screen.getByText('Agregar'))

    await waitFor(() => {
      expect(capturedInserts.nutrition_meals).toBeDefined()
      expect(capturedInserts.nutrition_meals.length).toBe(1)
      expect(capturedInserts.nutrition_meals[0].nombre_comida).toBe('Merienda')
    })
  })

  it('allows deleting a meal with confirmation', async () => {
    const user = userEvent.setup()
    mockSupabaseNutrition()
    render(<Nutricion />)
    await waitFor(() => {
      expect(screen.getByText('Pre-Gimnasio')).toBeInTheDocument()
    })

    const optionButtons = screen.getAllByLabelText(/Opciones de/)
    await user.click(optionButtons[0])

    await user.click(screen.getByText('Eliminar'))
    expect(screen.getByText('¿Eliminar?')).toBeInTheDocument()
    await user.click(screen.getByText('Sí'))

    await waitFor(() => {
      const menus = useNutritionStore.getState().menus
      const menu1 = menus.find((m) => m.id === 'menu-1')
      expect(menu1?.meals.find((ml) => ml.id === 'meal-1')).toBeUndefined()
    })
  })

  it('preserves data isolation between users', async () => {
    useNutritionStore.setState({
      menus: [
        {
          id: 'isolated-menu',
          profile_id: 'user-2',
          nombre: 'Menú de otro usuario',
          calorias: null,
          proteinas: null,
          carbohidratos: null,
          grasas: null,
          presupuesto: null,
          meals: [],
        },
      ],
    })

    mockSupabaseNutrition()
    render(<Nutricion />)

    await waitFor(() => {
      const menus = useNutritionStore.getState().menus
      for (const menu of menus) {
        expect(menu.profile_id).toBe('user-1')
      }
    })
  })
})
