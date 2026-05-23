import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Historial } from '../pages/Historial'
import { useHistoryStore } from '../stores/historyStore'
import { useProgressStore } from '../stores/progressStore'

describe('Historial Page', () => {
  beforeEach(() => {
    useHistoryStore.getState().reset()
    useProgressStore.getState().reset()
  })

  it('shows tabs for Sesiones and Progreso', () => {
    render(
      <MemoryRouter>
        <Historial />
      </MemoryRouter>
    )

    expect(screen.getByText('Sesiones')).toBeInTheDocument()
    expect(screen.getByText('Progreso')).toBeInTheDocument()
  })

  it('switches between tabs', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Historial />
      </MemoryRouter>
    )

    await user.click(screen.getByText('Progreso'))
    expect(screen.getByText('Seleccionar ejercicio')).toBeInTheDocument()

    await user.click(screen.getByText('Sesiones'))
    expect(screen.getByText(/Cargando historial/i)).toBeInTheDocument()
  })
})

describe('HistoryStore', () => {
  beforeEach(() => {
    useHistoryStore.getState().reset()
  })

  it('initializes with empty sessions', () => {
    const state = useHistoryStore.getState()
    expect(state.sessions).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe(null)
  })

  it('setSessions updates state', () => {
    const mockSessions = [
      {
        id: 's1',
        cycle_id: 'c1',
        block_id: 'b1',
        block_name: 'Día 1 - Pecho',
        fecha_completado: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T10:00:00Z',
        exercise_count: 3,
      },
    ]

    useHistoryStore.setState({ sessions: mockSessions as any })
    const state = useHistoryStore.getState()
    expect(state.sessions.length).toBe(1)
    expect(state.sessions[0].block_name).toBe('Día 1 - Pecho')
  })

  it('reset clears state', () => {
    useHistoryStore.setState({ sessions: [{ id: 's1' } as any], error: 'test error' })
    useHistoryStore.getState().reset()

    const state = useHistoryStore.getState()
    expect(state.sessions).toEqual([])
    expect(state.error).toBe(null)
  })
})

describe('ProgressStore', () => {
  beforeEach(() => {
    useProgressStore.getState().reset()
  })

  it('initializes with empty exercises', () => {
    const state = useProgressStore.getState()
    expect(state.exercises).toEqual([])
    expect(state.progress).toBe(null)
  })

  it('setExercises updates state', () => {
    const mockExercises = [
      { id: 'e1', nombre: 'Press de Banca', grupoMuscular: 'Pecho', equipo: 'Barra', variaciones: null, isCustom: false },
    ]

    useProgressStore.setState({ exercises: mockExercises as any })
    const state = useProgressStore.getState()
    expect(state.exercises.length).toBe(1)
    expect(state.exercises[0].nombre).toBe('Press de Banca')
  })

  it('reset clears state', () => {
    useProgressStore.setState({ exercises: [{ id: 'e1' } as any], progress: { exercise_id: 'e1', exercise_name: 'Test', snapshot_grupo_muscular: null, sessions: [] } })
    useProgressStore.getState().reset()

    const state = useProgressStore.getState()
    expect(state.exercises).toEqual([])
    expect(state.progress).toBe(null)
  })
})
