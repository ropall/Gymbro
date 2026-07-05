import { render, screen, waitFor } from '@testing-library/react'
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
      update: vi.fn(() => chain),
      insert: vi.fn((data: any) => {
        if (table === 'routines') {
          return {
            select: vi.fn((_cols: string) => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: { id: `routine-${Math.random().toString(36).slice(2)}`, ...data },
                  error: null,
                })
              ),
            })),
          }
        }
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
      expect(screen.getByText(/Paso 1 de 4/)).toBeInTheDocument()
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

    // Step 2 — Cards view
    await waitFor(() => {
      expect(screen.getByText(/Construye tu rutina/i)).toBeInTheDocument()
    })

    // Open picker for the single training day
    await user.click(screen.getByRole('button', { name: /Crear/i }))

    // Modal opens with exercise list
    await waitFor(() => {
      expect(screen.getByText(/Día 1/i)).toBeInTheDocument()
    })

    // Select first exercise in the modal — auto-selects because only 1 equipment option
    const exerciseButtons = screen.getAllByRole('button', { name: /Press de Banca Plano/i })
    expect(exerciseButtons.length).toBeGreaterThan(0)
    await user.click(exerciseButtons[0])

    // Close modal
    await user.click(screen.getByRole('button', { name: /Listo/i }))

    // Back to step 2
    await waitFor(() => {
      expect(screen.getByText(/Construye tu rutina/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 3 — Review exercises
    await waitFor(() => {
      expect(screen.getByText(/Revisa tus ejercicios/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 4 — Summary
    await waitFor(() => {
      expect(screen.getByText(/Resumen de tu rutina/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Finalizar y crear rutina/i })).toBeInTheDocument()
  })

  it('auto-detects muscle groups from selected exercises', async () => {
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

    // Step 2 — Open picker for Day 1
    await waitFor(() => {
      expect(screen.getByText(/Construye tu rutina/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Crear/i }))

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText(/Día 1/i)).toBeInTheDocument()
    })

    // Search and select 'Press de Banca Plano'
    const searchInput = screen.getByPlaceholderText(/Buscar ejercicios/i)
    await user.type(searchInput, 'Press de Banca')

    await waitFor(() => {
      expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument()
    })

    const exerciseBtn = screen.getByRole('button', { name: /Press de Banca Plano/i })
    await user.click(exerciseBtn)

    await user.click(screen.getByRole('button', { name: /Listo/i }))

    // Back to step 2 — muscle group should be auto-detected
    await waitFor(() => {
      expect(screen.getByText(/Construye tu rutina/i)).toBeInTheDocument()
    })

    // The card should show the auto-detected muscle group
    await waitFor(() => {
      expect(screen.getByText(/Pecho/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 3 should show the selected exercise for review
    await waitFor(() => {
      expect(screen.getByText(/Revisa tus ejercicios/i)).toBeInTheDocument()
    })

    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument()
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
        update: vi.fn(() => chain),
        insert: vi.fn((data: any) => {
          if (table === 'routines') {
            return {
              select: vi.fn((_cols: string) => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: { id: `routine-${Math.random().toString(36).slice(2)}`, ...data },
                    error: null,
                  })
                ),
              })),
            }
          }
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

    // Step 2: open picker for each training day and select first exercise
    await waitFor(() => {
      expect(screen.getByText(/Construye tu rutina/i)).toBeInTheDocument()
    })

    const createButtons = screen.getAllByRole('button', { name: /Crear/i })
    expect(createButtons.length).toBeGreaterThan(0)

    for (const btn of createButtons) {
      await user.click(btn)

      await waitFor(() => {
        const exerciseBtns = screen.queryAllByRole('button', { name: /Press de Banca Plano/i })
        expect(exerciseBtns.length).toBeGreaterThan(0)
      })

      const exerciseBtns = screen.getAllByRole('button', { name: /Press de Banca Plano/i })
      if (exerciseBtns.length > 0) {
        await user.click(exerciseBtns[0])
      }

      await user.click(screen.getByRole('button', { name: /Listo/i }))

      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Listo/i })).not.toBeInTheDocument()
      })
    }

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 3: review (exercises already selected)
    await waitFor(() => {
      expect(screen.getByText(/Revisa tus ejercicios/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Siguiente/i }))

    // Step 4 — Summary
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
