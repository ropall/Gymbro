import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Rutinas } from '../pages/Rutinas'
import { useRoutineStore } from '../stores/routineStore'
import { useExerciseStore } from '../stores/exerciseStore'
import { supabase } from '../lib/supabase'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
}))

const mockBlocks = [
  { id: 'b1', profile_id: 'u1', nombre: 'Día 1 - Pecho', posicion: 1, es_descanso: false, created_at: '2024-01-01' },
  { id: 'b2', profile_id: 'u1', nombre: 'Día 2 - Espalda', posicion: 2, es_descanso: false, created_at: '2024-01-01' },
  { id: 'b3', profile_id: 'u1', nombre: 'Descanso', posicion: 3, es_descanso: true, created_at: '2024-01-01' },
  { id: 'b4', profile_id: 'u1', nombre: 'Día 4 - Piernas', posicion: 4, es_descanso: false, created_at: '2024-01-01' },
  { id: 'b5', profile_id: 'u1', nombre: 'Día 5 - Hombros', posicion: 5, es_descanso: false, created_at: '2024-01-01' },
  { id: 'b6', profile_id: 'u1', nombre: 'Descanso', posicion: 6, es_descanso: true, created_at: '2024-01-01' },
  { id: 'b7', profile_id: 'u1', nombre: 'Día 7 - Full Body', posicion: 7, es_descanso: false, created_at: '2024-01-01' },
]

const mockCycle = {
  id: 'c1',
  profile_id: 'u1',
  fecha_inicio: '2024-01-01',
  posicion_actual: 1,
  activo: true,
  created_at: '2024-01-01',
}

const mockBlockExercises = [
  {
    id: 'be1',
    block_id: 'b1',
    global_exercise_id: 'g1',
    user_exercise_id: null,
    series_objetivo: 3,
    reps_objetivo_min: 8,
    reps_objetivo_max: 12,
    rpe_objetivo: 7,
    descanso_segundos: 90,
  },
]

const mockGlobalExercises = [
  { id: 'g1', nombre: 'Press de Banca', grupo_muscular: 'Pecho (Pectorales)', equipo: 'Barra', variaciones: null, parent_id: null },
]

// Captured insert calls for assertions
let capturedInserts: Record<string, any[]> = {}

function createMockChain(table: string, overrides: any = {}) {
  const responses: Record<string, any> = {
    blocks: { data: mockBlocks, error: null },
    cycles: { data: { ...mockCycle, ...overrides.cycle }, error: null },
    block_exercises: { data: mockBlockExercises, error: null },
    global_exercises: { data: mockGlobalExercises, error: null },
    user_exercises: { data: [], error: null },
    sessions: { data: { id: 's1' }, error: null },
    session_sets: { error: null },
  }

  const response = responses[table] ?? { data: null, error: null }

  let chain: any
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === 'then') {
        return (onFulfilled: any) => Promise.resolve(response).then(onFulfilled)
      }
      if (prop === 'catch') {
        return (onRejected: any) => Promise.resolve(response).catch(onRejected)
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

function mockSupabaseRoutine({ cycleOverrides = {} }: { cycleOverrides?: any } = {}) {
  vi.mocked(supabase.auth.getUser).mockImplementation(() =>
    Promise.resolve({ data: { user: { id: 'u1', email: 'test@example.com' } } } as any)
  )

  vi.mocked(supabase.from).mockImplementation((table: string) =>
    createMockChain(table, { cycle: cycleOverrides })
  )
}

describe('Routine/Block/Cycle Management', () => {
  beforeEach(() => {
    useRoutineStore.getState().reset()
    useExerciseStore.getState().reset()
    vi.restoreAllMocks()
    capturedInserts = {}
  })

  it('loads blocks and cycle on mount', async () => {
    mockSupabaseRoutine()
    render(
      <MemoryRouter>
        <Rutinas />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })

    expect(screen.getByText(/Día 1 - Pecho/i)).toBeInTheDocument()
    expect(screen.getByText(/Día 7 - Full Body/i)).toBeInTheDocument()
  })

  it('shows current cycle position indicator', async () => {
    mockSupabaseRoutine()
    render(
      <MemoryRouter>
        <Rutinas />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })

    // Position 1 should be marked as current
    expect(screen.getByText(/Posición 1/i)).toBeInTheDocument()
  })

  it('shows "Empezar Rutina" for current training day', async () => {
    mockSupabaseRoutine()
    render(
      <MemoryRouter>
        <Rutinas />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Entrenar/i })).toBeInTheDocument()
  })

  it('shows "Hoy descanso" for rest days', async () => {
    mockSupabaseRoutine({ cycleOverrides: { posicion_actual: 3 } })
    render(
      <MemoryRouter>
        <Rutinas />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Descansar/i })).toBeInTheDocument()
  })

  it('advances cycle on rest day confirmation', async () => {
    const user = userEvent.setup()
    mockSupabaseRoutine({ cycleOverrides: { posicion_actual: 3 } })
    render(
      <MemoryRouter>
        <Rutinas />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Descansar/i }))

    await waitFor(() => {
      expect(screen.getByText(/Posición 4/i)).toBeInTheDocument()
    })
  })

  it('does not allow editing completed or current blocks', async () => {
    mockSupabaseRoutine()
    render(
      <MemoryRouter>
        <Rutinas />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })

    console.log('CYCLE:', useRoutineStore.getState().cycle)

    // Position 1 (current) should not have edit button
    const day1Card = screen.getByText(/Día 1 - Pecho/i).closest('[data-testid="block-card"]')!
    expect(day1Card.querySelector('button[aria-label="Editar bloque"]')).not.toBeInTheDocument()

    // Position 2+ should have edit button
    const day2Card = screen.getByText(/Día 2 - Espalda/i).closest('[data-testid="block-card"]')!
    expect(day2Card.querySelector('button[aria-label="Editar bloque"]')).toBeInTheDocument()
  })

  it('allows editing future blocks', async () => {
    const user = userEvent.setup()
    mockSupabaseRoutine()
    render(
      <MemoryRouter>
        <Rutinas />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })

    const day2Card = screen.getByText(/Día 2 - Espalda/i).closest('[data-testid="block-card"]')!
    const editBtn = day2Card.querySelector('button[aria-label="Editar bloque"]')!
    await user.click(editBtn)

    expect(screen.getByText(/Editor de Bloque/i)).toBeInTheDocument()
  })

  it('pauses cycle at position 7 and shows summary', async () => {
    const user = userEvent.setup()
    mockSupabaseRoutine({ cycleOverrides: { posicion_actual: 7 } })
    render(
      <MemoryRouter>
        <Rutinas />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })

    // Complete the final block
    await user.click(screen.getByRole('button', { name: /Entrenar/i }))
    // Simulate completing workout (this would normally be done via Active Workout mode)
    // For this test, we directly call advancePosition
    useRoutineStore.getState().advancePosition()

    await waitFor(() => {
      expect(screen.getByText(/¡Ciclo Completado!/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Iniciar nuevo ciclo/i })).toBeInTheDocument()
  })

  it('can start new cycle from summary', async () => {
    const user = userEvent.setup()
    mockSupabaseRoutine({ cycleOverrides: { posicion_actual: 7, activo: false } })
    
    // Pre-set showCycleSummary to true
    useRoutineStore.setState({ showCycleSummary: true })
    
    render(
      <MemoryRouter>
        <Rutinas />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })

    console.log('SHOW SUMMARY:', useRoutineStore.getState().showCycleSummary)
    expect(screen.getByRole('button', { name: /Iniciar nuevo ciclo/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Iniciar nuevo ciclo/i }))

    await waitFor(() => {
      expect(screen.getByText(/Posición 1/i)).toBeInTheDocument()
    })
  })

  it('advances cycle automatically after completing a block', async () => {
    mockSupabaseRoutine()
    render(
      <MemoryRouter>
        <Rutinas />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando rutina/i)).not.toBeInTheDocument()
    })

    // Verify initial position
    expect(screen.getByText(/Posición 1/i)).toBeInTheDocument()

    // Complete the current block
    await useRoutineStore.getState().completeBlock({
      blockId: 'b1',
      sets: [
        {
          block_exercise_id: 'be1',
          peso: 80,
          reps_reales: 10,
          rpe_real: 8,
          orden_serie: 1,
        },
      ],
    })

    await waitFor(() => {
      expect(screen.getByText(/Posición 2/i)).toBeInTheDocument()
    })
  })

  it('stores immutable snapshot when completing a block', async () => {
    mockSupabaseRoutine()

    // Load data first so blockExercises are populated
    await useRoutineStore.getState().loadBlocksAndCycle()

    await useRoutineStore.getState().completeBlock({
      blockId: 'b1',
      sets: [
        {
          block_exercise_id: 'be1',
          peso: 80,
          reps_reales: 10,
          rpe_real: 8,
          orden_serie: 1,
        },
      ],
    })

    // Verify session_sets insert captured snapshot data
    const sessionSetsInserts = capturedInserts['session_sets'] ?? []
    expect(sessionSetsInserts.length).toBe(1)
    const setData = sessionSetsInserts[0][0]

    expect(setData.snapshot_nombre).toBe('Press de Banca')
    expect(setData.snapshot_series_objetivo).toBe(3)
    expect(setData.snapshot_reps_objetivo_min).toBe(8)
    expect(setData.snapshot_reps_objetivo_max).toBe(12)
    expect(setData.snapshot_rpe_objetivo).toBe(7)
    expect(setData.snapshot_descanso_segundos).toBe(90)
  })
})
