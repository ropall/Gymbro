import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Perfil } from '../pages/Perfil'
import { useMetricsStore } from '../stores/metricsStore'
import { useAuthStore } from '../stores/authStore'
import { calculateEdad } from '../utils/calculations'
import { supabase } from '../lib/supabase'

function mockSupabaseEmpty() {
  vi.spyOn(supabase.auth, 'getUser').mockImplementation(() =>
    Promise.resolve({ data: { user: { id: 'test-user', email: 'test@example.com' } } } as any)
  )
  vi.spyOn(supabase, 'from').mockImplementation(() => ({
    select: vi.fn(() => ({} as any)),
    eq: vi.fn(() => ({} as any)),
    order: vi.fn(() => Promise.resolve({ data: [], error: null })),
    single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
    insert: vi.fn((data: any) => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: { id: 'new-id', ...data }, error: null })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  } as any))
}

const defaultProfile = {
  sexo: 'masculino' as const,
  altura: 175,
  fechaNacimiento: '1992-03-10',
  fullName: 'Test User',
  fotoPerfil: null,
  pesoObjetivo: null,
  nivelActividad: 'moderado' as const,
  objetivoPrincipal: 'hipertrofia' as const,
  nivelExperiencia: null as any,
  cronotipo: 'alondra' as const,
  splitPreferido: 'PPL' as const,
  diasDisponibles: null,
  nivelEnergia: null,
  somatotipo: null,
  horarioSueno: null,
  onboardingCompletado: true,
}

function setAuthUser() {
  useAuthStore.setState({
    user: { id: 'test-user', email: 'test@example.com' } as any,
    session: { access_token: 'token' } as any,
    isLoading: false,
    isNewUser: false,
  })
}

describe('Perfil page', () => {
  beforeEach(() => {
    useMetricsStore.getState().reset()
    useAuthStore.setState({ user: null, session: null, isLoading: false, isNewUser: false })
    vi.restoreAllMocks()
  })

  it('renders profile page with onboarding CTA when not completed', async () => {
    mockSupabaseEmpty()
    setAuthUser()
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Aún no has completado tu perfil.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Completar perfil ahora/ })).toBeInTheDocument()
  })

  it('shows profile header with name when completed', async () => {
    setAuthUser()
    useMetricsStore.setState({
      profile: { ...defaultProfile },
      weightEntries: [],
      measurementEntries: [],
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('Perfil de entrenamiento')).toBeInTheDocument()
  })

  it('shows inline editable metrics', async () => {
    setAuthUser()
    useMetricsStore.setState({
      profile: { ...defaultProfile },
      weightEntries: [],
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    const masculinoElements = screen.getAllByText('Masculino')
    expect(masculinoElements.length).toBeGreaterThanOrEqual(1)
    const alturaElements = screen.getAllByText('175 cm')
    expect(alturaElements.length).toBeGreaterThanOrEqual(1)
    const edad = calculateEdad('1992-03-10')
    const edadElements = screen.getAllByText(`${edad} años`)
    expect(edadElements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows training profile section', async () => {
    setAuthUser()
    useMetricsStore.setState({
      profile: { ...defaultProfile },
      weightEntries: [],
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Hipertrofia')).toBeInTheDocument()
    expect(screen.getByText('Moderado (3-5 días/semana)')).toBeInTheDocument()
    expect(screen.getByText('PPL (Push/Pull/Legs)')).toBeInTheDocument()
    expect(screen.getByText('Alondra (más activo por la mañana)')).toBeInTheDocument()
  })

  it('shows TMB in metrics card when weight exists', async () => {
    setAuthUser()
    useMetricsStore.setState({
      profile: { ...defaultProfile, altura: 180 },
      weightEntries: [{ id: 'w1', peso: 80, fecha: '2024-01-15' }],
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    const currentYear = new Date().getFullYear()
    const edad = currentYear - 1992
    const tmbExpected = Math.round(10 * 80 + 6.25 * 180 - 5 * edad + 5)
    expect(screen.getByText(String(tmbExpected))).toBeInTheDocument()
  })
})

describe('Weight history', () => {
  beforeEach(() => {
    useMetricsStore.getState().reset()
    vi.restoreAllMocks()
    mockSupabaseEmpty()
    setAuthUser()
  })

  it('shows weight entries in the list', async () => {
    useMetricsStore.setState({
      profile: { ...defaultProfile },
      weightEntries: [{ id: 'w1', peso: 78.5, fecha: '2024-01-15' }],
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    const weightSection = screen.getByText('Historial de peso').closest('div')!
    expect(within(weightSection).getByText('78.5 kg')).toBeInTheDocument()
  })

  it('rejects duplicate weight entries in the same week', async () => {
    const user = userEvent.setup()
    useMetricsStore.setState({
      profile: { ...defaultProfile },
      weightEntries: [{ id: 'w-existing', peso: 78, fecha: new Date().toISOString().split('T')[0] }],
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    const pesoInput = screen.getByPlaceholderText('Peso (kg)')
    await user.type(pesoInput, '79')
    await user.click(screen.getByRole('button', { name: /Registrar peso/i }))
    expect(screen.getByText('Ya existe un registro de peso para esta semana')).toBeInTheDocument()
  })

  it('removes a weight entry', async () => {
    const user = userEvent.setup()
    useMetricsStore.setState({
      profile: { ...defaultProfile },
      weightEntries: [{ id: 'w1', peso: 80, fecha: '2024-01-15' }],
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    const weightSection = screen.getByText('Historial de peso').closest('div')!
    expect(within(weightSection).getByText('80 kg')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Eliminar peso 80 kg/i }))
    await waitFor(() => {
      expect(within(weightSection).queryByText('80 kg')).not.toBeInTheDocument()
    })
  })
})

describe('Measurements history', () => {
  beforeEach(() => {
    useMetricsStore.getState().reset()
    vi.restoreAllMocks()
    mockSupabaseEmpty()
    setAuthUser()
  })

  it('shows measurements in the list and filters by type', async () => {
    const user = userEvent.setup()
    useMetricsStore.setState({
      profile: { ...defaultProfile },
      measurementEntries: [{ id: 'm1', tipo: 'pecho', valor: 42, fecha: '2024-01-15' }],
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    const measurementsSection = screen.getByText('Medidas corporales').closest('div')!
    expect(within(measurementsSection).getByText('42 cm')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Bíceps' }))
    expect(within(measurementsSection).queryByText('42 cm')).not.toBeInTheDocument()
    expect(screen.getByText('Aún no hay registros de Bíceps.')).toBeInTheDocument()
  })

  it('removes a measurement entry', async () => {
    const user = userEvent.setup()
    useMetricsStore.setState({
      profile: { ...defaultProfile },
      measurementEntries: [{ id: 'm1', tipo: 'cintura', valor: 82, fecha: '2024-01-10' }],
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    const measurementsSection = screen.getByText('Medidas corporales').closest('div')!
    expect(within(measurementsSection).getByText('82 cm')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Eliminar medida Cintura/i }))
    await waitFor(() => {
      expect(within(measurementsSection).queryByText('82 cm')).not.toBeInTheDocument()
    })
  })
})

describe('Progress photos', () => {
  beforeEach(() => {
    useMetricsStore.getState().reset()
    vi.restoreAllMocks()
    setAuthUser()
  })

  it('adds a photo and displays it in the gallery', async () => {
    const user = userEvent.setup()
    useMetricsStore.setState({
      profile: { ...defaultProfile },
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    const file = new File(['fake-image'], 'progress.jpg', { type: 'image/jpeg' })
    const originalFileReader = globalThis.FileReader
    // @ts-expect-error
    globalThis.FileReader = class MockFileReader {
      result: string | ArrayBuffer | null = null
      onloadend: (() => void) | null = null
      readAsDataURL() {
        this.result = 'data:image/jpeg;base64,fake'
        setTimeout(() => this.onloadend?.(), 0)
      }
    }
    const input = screen.getByLabelText('Subir foto')
    await user.upload(input, file)
    await waitFor(() => {
      expect(screen.getByAltText(/Foto del/)).toBeInTheDocument()
    })
    globalThis.FileReader = originalFileReader
  })

  it('removes a photo from the gallery', async () => {
    const user = userEvent.setup()
    useMetricsStore.setState({
      profile: { ...defaultProfile },
      photoEntries: [{ id: 'p1', url: 'data:image/jpeg;base64,test', fecha: '2024-01-15' }],
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    expect(screen.getByAltText(/Foto del/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Eliminar foto' }))
    await waitFor(() => {
      expect(screen.queryByAltText(/Foto del/)).not.toBeInTheDocument()
    })
  })
})
