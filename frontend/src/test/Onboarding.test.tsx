import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Inicio } from '../pages/Inicio'
import { Onboarding } from '../pages/Onboarding'
import { useOnboardingStore } from '../stores/onboardingStore'
import { useExerciseStore } from '../stores/exerciseStore'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

const mockGlobalExercises = [
  { id: 'g1', nombre: 'Press de Banca Plano', grupo_muscular: 'Pecho (Pectorales)', equipo: 'Barra', variaciones: null, parent_id: null },
  { id: 'g2', nombre: 'Dominadas / Pull-ups', grupo_muscular: 'Espalda (Dorsales, Romboides, Trapecios)', equipo: 'Peso corporal', variaciones: null, parent_id: null },
  { id: 'g3', nombre: 'Sentadilla Libre', grupo_muscular: 'Piernas (Cuádriceps)', equipo: 'Barra', variaciones: null, parent_id: null },
]

function mockSupabaseForOnboarding({ hasBlocks = false }: { hasBlocks?: boolean } = {}) {
  vi.spyOn(supabase.auth, 'getUser').mockImplementation(() =>
    Promise.resolve({ data: { user: { id: 'test-user', email: 'test@example.com' } } } as any)
  )

  vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
    const chain: any = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() => chain),
      limit: vi.fn(() =>
        Promise.resolve({
          data: table === 'blocks' ? (hasBlocks ? [{ id: 'b1' }] : []) : [],
          error: null,
        })
      ),
      single: vi.fn(() =>
        Promise.resolve({
          data: table === 'blocks' ? (hasBlocks ? { id: 'b1' } : null) : null,
          error: null,
        })
      ),
      insert: vi.fn((data: any) => {
        if (table === 'blocks') {
          return {
            select: vi.fn((_cols: string) => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: { id: `block-${Math.random().toString(36).slice(2)}`, ...data },
                  error: null,
                })
              ),
            })),
          }
        }
        if (table === 'user_exercises') {
          return {
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: { id: 'custom-1', ...data },
                  error: null,
                })
              ),
            })),
          }
        }
        if (table === 'block_exercises' || table === 'cycles') {
          return Promise.resolve({ error: null }) as any
        }
        return chain
      }),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    }

    // order() should return a promise for global_exercises and user_exercises queries
    chain.order = vi.fn(() =>
      Promise.resolve({
        data: table === 'global_exercises' ? mockGlobalExercises : [],
        error: null,
      })
    )

    return chain
  })
}

describe('Onboarding Wizard', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset()
    useExerciseStore.getState().reset()
    useAuthStore.setState({ user: { id: 'test-user' } as any, session: null, isLoading: false, isNewUser: false })
    vi.restoreAllMocks()
  })

  it('renders dashboard CTA when user has no blocks', async () => {
    mockSupabaseForOnboarding({ hasBlocks: false })
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Crear mi primera rutina/i })).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Crear mi primera rutina/i }))

    await waitFor(() => {
      expect(screen.getByText(/Paso 1 de 5/)).toBeInTheDocument()
    })
  })

  it('does not render CTA when user has blocks', async () => {
    mockSupabaseForOnboarding({ hasBlocks: true })
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Inicio />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /Crear mi primera rutina/i })).not.toBeInTheDocument()
    expect(screen.getByText(/Hoy toca/i)).toBeInTheDocument()
  })

  it('navigates through wizard steps and preserves data', async () => {
    const user = userEvent.setup()
    mockSupabaseForOnboarding()
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </MemoryRouter>
    )

    // Step 1: leave only 1 training day (Day 1), set Day 2 and Day 3 to rest
    expect(screen.getByText(/Paso 1 de 5/)).toBeInTheDocument()
    const day2Button = screen.getByLabelText(/Día 2: Entrenamiento/i)
    const day3Button = screen.getByLabelText(/Día 3: Entrenamiento/i)
    await user.click(day2Button)
    await user.click(day3Button)
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 2
    await waitFor(() => {
      expect(screen.getByText(/Grupos musculares por día/i)).toBeInTheDocument()
    })

    // Select muscle group for the single training day
    const dayCard = screen.getByText('Día 1').closest('div')!
    await user.click(dayCard.querySelector('button')!)

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 3
    await waitFor(() => {
      expect(screen.getByText(/Selecciona ejercicios/i)).toBeInTheDocument()
    })

    // Check first suggested exercise
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
    await user.click(checkboxes[0])

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 4
    await waitFor(() => {
      expect(screen.getByText(/Parámetros de entrenamiento/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 5
    await waitFor(() => {
      expect(screen.getByText(/Resumen de tu rutina/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Finalizar y crear rutina/i })).toBeInTheDocument()
  })

  it('filters exercise suggestions by muscle group', async () => {
    const user = userEvent.setup()
    mockSupabaseForOnboarding()
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </MemoryRouter>
    )

    // Step 1: leave only 1 training day (Day 1), set Day 2 and Day 3 to rest
    const day2Btn = screen.getByLabelText(/Día 2: Entrenamiento/i)
    const day3Btn = screen.getByLabelText(/Día 3: Entrenamiento/i)
    await user.click(day2Btn)
    await user.click(day3Btn)
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 2 - Select 'Pecho' for Day 1
    await waitFor(() => {
      expect(screen.getByText(/Grupos musculares por día/i)).toBeInTheDocument()
    })

    const day1Card = screen.getByText('Día 1').closest('div')!
    const pechoButton = day1Card.querySelector('button')!
    await user.click(pechoButton)

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 3
    await waitFor(() => {
      expect(screen.getByText(/Selecciona ejercicios/i)).toBeInTheDocument()
    })

    // The global exercise 'Press de Banca Plano' is mapped to MuscleGroup 'Pecho'
    // So it should appear as a suggestion for Day 1
    await waitFor(() => {
      expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument()
    })
  })

  it('creates blocks and cycle on finish', async () => {
    const user = userEvent.setup()
    mockSupabaseForOnboarding()

    const insertSpy = vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      const chain: any = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        order: vi.fn(() => chain),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        insert: vi.fn((data: any) => {
          if (table === 'blocks') {
            return {
              select: vi.fn((_cols: string) => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { id: `block-${table}-${Math.random().toString(36).slice(2)}`, ...data },
                    error: null,
                  })
                ),
              })),
            }
          }
          if (table === 'user_exercises') {
            return {
              select: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { id: 'custom-1', ...data },
                    error: null,
                  })
                ),
              })),
            }
          }
          if (table === 'block_exercises' || table === 'cycles') {
            return Promise.resolve({ error: null }) as any
          }
          return chain
        }),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }
      chain.order = vi.fn(() =>
        Promise.resolve({
          data: table === 'global_exercises' ? mockGlobalExercises : [],
          error: null,
        })
      )
      return chain
    })

    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </MemoryRouter>
    )

    // Step 1: keep default 3 training days
    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 2: select muscle groups for all 3 days
    await waitFor(() => {
      expect(screen.getByText(/Grupos musculares por día/i)).toBeInTheDocument()
    })

    const dayCards = screen.getAllByText(/Día \d/)
    for (const dayCard of dayCards) {
      const card = dayCard.closest('div')!
      const btn = card.querySelector('button')!
      await user.click(btn)
    }

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 3: check first suggested exercise for each day
    await waitFor(() => {
      expect(screen.getByText(/Selecciona ejercicios/i)).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    for (const cb of checkboxes) {
      await user.click(cb)
    }

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 4
    await waitFor(() => {
      expect(screen.getByText(/Parámetros de entrenamiento/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 5
    await waitFor(() => {
      expect(screen.getByText(/Resumen de tu rutina/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Finalizar y crear rutina/i }))

    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    })

    // Verify insert calls
    const calls = insertSpy.mock.calls
    const blockInserts = calls.filter(([t]) => t === 'blocks')
    const cycleInserts = calls.filter(([t]) => t === 'cycles')

    expect(blockInserts.length).toBe(7)
    expect(cycleInserts.length).toBe(1)
  })
})
