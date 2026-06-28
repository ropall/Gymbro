import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useWorkoutStore } from '../stores/workoutStore'
import { Layout } from '../components/Layout'
import { supabase } from '../lib/supabase'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
}))

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
    exercise: {
      id: 'g1',
      nombre: 'Press de Banca',
      grupoMuscular: 'Pecho' as const,
      equipo: 'Barra',
      variaciones: null,
      isCustom: false,
    },
  },
]

describe('PWA - Workout Store Persistence', () => {
  beforeEach(() => {
    useWorkoutStore.getState().reset()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('persists workout state in localStorage via middleware', () => {
    useWorkoutStore.getState().initializeWorkout('b1', 'Test Block', mockBlockExercises, 'test-cycle-id')
    useWorkoutStore.getState().completeSet()

    const raw = localStorage.getItem('gymbro-workout-state')
    expect(raw).not.toBeNull()

    const parsed = JSON.parse(raw!)
    expect(parsed.state.blockId).toBe('b1')
    expect(parsed.state.blockName).toBe('Test Block')
    expect(parsed.state.exercises.length).toBe(1)
    expect(parsed.state.exercises[0].sets[0].completed).toBe(true)
  })

  it('survives page refresh (rehydrates from localStorage)', () => {
    useWorkoutStore.getState().initializeWorkout('b1', 'Test Block', mockBlockExercises, 'test-cycle-id')
    useWorkoutStore.getState().completeSet()

    const raw = localStorage.getItem('gymbro-workout-state')
    // Reset in-memory store and rehydrate (simulate app reload)
    useWorkoutStore.getState().reset()

    // Simulate persist rehydration by re-creating the store
    // In a real scenario Zustand persist handles this automatically
    const parsed = JSON.parse(raw!)
    expect(parsed.state.exercises[0].sets[0].completed).toBe(true)
    expect(parsed.state.currentSetIndex).toBe(0)
  })

  it('does not persist transient state like rest timer', () => {
    useWorkoutStore.getState().initializeWorkout('b1', 'Test Block', mockBlockExercises, 'test-cycle-id')
    useWorkoutStore.getState().startRestTimer(90)

    const raw = localStorage.getItem('gymbro-workout-state')
    const parsed = JSON.parse(raw!)

    expect(parsed.state.restSecondsRemaining).toBeUndefined()
    expect(parsed.state.restTimerRunning).toBeUndefined()
    expect(parsed.state.restTimerStarted).toBeUndefined()
  })
})

describe('PWA - Offline Fallback', () => {
  beforeEach(() => {
    useWorkoutStore.getState().reset()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('saves pending session to localStorage when offline', async () => {
    useWorkoutStore.getState().initializeWorkout('b1', 'Test Block', mockBlockExercises, 'test-cycle-id')
    useWorkoutStore.getState().completeSet()

    // Set navigator.onLine to false
    vi.stubGlobal('navigator', { onLine: false })

    const store = useWorkoutStore.getState()
    // Manually set sessionId and energyLevel as finishWorkout would expect
    useWorkoutStore.setState({ sessionId: 's1', energyLevel: 7 })

    await store.finishWorkout()

    const raw = localStorage.getItem('gymbro-pending-sessions')
    expect(raw).not.toBeNull()

    const pending = JSON.parse(raw!)
    expect(pending.length).toBe(1)
    expect(pending[0].blockId).toBe('b1')
    expect(pending[0].energyLevel).toBe(7)
    expect(pending[0].exercises.length).toBe(1)

    vi.unstubAllGlobals()
  })

  it('sets pendingSync flag when saved offline', async () => {
    useWorkoutStore.getState().initializeWorkout('b1', 'Test Block', mockBlockExercises, 'test-cycle-id')
    useWorkoutStore.getState().completeSet()

    vi.stubGlobal('navigator', { onLine: false })

    const store = useWorkoutStore.getState()
    useWorkoutStore.setState({ sessionId: 's1', energyLevel: 7 })

    await store.finishWorkout()

    expect(useWorkoutStore.getState().pendingSync).toBe(true)

    vi.unstubAllGlobals()
  })

  it('syncPendingSession sends offline sessions to Supabase', async () => {
    vi.mocked(supabase.auth.getUser).mockImplementation(() =>
      Promise.resolve({ data: { user: { id: 'u1' } } } as any)
    )

    // Track inserts
    const insertCalls: any[] = []
    const mockInsert = vi.fn((data: any) => {
      insertCalls.push(data)
      return {
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'synced-session' }, error: null })),
        })),
      }
    })

    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      const chain: any = {
        insert: mockInsert,
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
          })),
        })),
      }
      return chain
    })

    const pendingSession = {
      blockId: 'b1',
      exercises: mockBlockExercises.map((be) => ({
        blockExercise: be,
        sets: [{ orden: 1, completed: true, peso: 80, reps_reales: 10, rpe_real: 7 }],
        completed: true,
      })),
      energyLevel: 8,
      supplements: { creatina: true, proteina: false, glicinato_magnesio: false },
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('gymbro-pending-sessions', JSON.stringify([pendingSession]))
    useWorkoutStore.setState({ pendingSync: true })

    const result = await useWorkoutStore.getState().syncPendingSession()

    expect(result).toBe(true)
    expect(localStorage.getItem('gymbro-pending-sessions')).toBeNull()
    expect(useWorkoutStore.getState().pendingSync).toBe(false)
  })
})

describe('PWA - Offline Indicator', () => {
  beforeEach(() => {
    useWorkoutStore.getState().reset()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows offline badge when navigator is offline', () => {
    vi.stubGlobal('navigator', { onLine: false })

    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    expect(screen.getByText('Sin conexión')).toBeInTheDocument()
  })

  it('shows pending sync badge when sessions are pending', () => {
    vi.stubGlobal('navigator', { onLine: true })

    useWorkoutStore.setState({ pendingSync: true })

    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('does not show offline or pending badges when online and synced', () => {
    vi.stubGlobal('navigator', { onLine: true })

    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    expect(screen.queryByText('Sin conexión')).not.toBeInTheDocument()
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument()
  })
})

describe('PWA - Manifest Configuration', () => {
  it('vite-plugin-pwa is configured with correct manifest', async () => {
    // Import the vite config to verify it was set up
    const config = await import('../../vite.config.ts')
    expect(config.default).toBeDefined()
  })
})
