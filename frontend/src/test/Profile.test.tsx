import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Perfil } from '../pages/Perfil'
import { useMetricsStore } from '../stores/metricsStore'
import { calculateEdad } from '../utils/calculations'
import { supabase } from '../lib/supabase'

function mockSupabaseEmpty() {
  vi.spyOn(supabase.auth, 'getUser').mockImplementation(() =>
    Promise.resolve({ data: { user: { id: 'test-user', email: 'test@example.com' } } } as any)
  )
  vi.spyOn(supabase, 'from').mockImplementation(() => ({
    select: vi.fn(function () { return this }),
    eq: vi.fn(function () { return this }),
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

describe('Perfil page', () => {
  beforeEach(() => {
    useMetricsStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('renders profile page with metrics section', async () => {
    mockSupabaseEmpty()
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Perfil')).toBeInTheDocument()
    expect(screen.getByText('Tus métricas y progreso')).toBeInTheDocument()
    expect(screen.getByText('Métricas básicas')).toBeInTheDocument()
  })

  it('shows post-registration form when profile is empty', async () => {
    mockSupabaseEmpty()
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.getByText('Completa tu perfil')).toBeInTheDocument()
    })
  })

  it('allows saving profile with skipped fields and shows metrics', async () => {
    const user = userEvent.setup()
    mockSupabaseEmpty()
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.getByText('Completa tu perfil')).toBeInTheDocument()
    })
    await user.selectOptions(screen.getByLabelText('Sexo'), 'masculino')
    await user.type(screen.getByLabelText('Altura (cm)'), '180')
    await user.click(screen.getByRole('button', { name: /Guardar perfil/i }))
    await waitFor(() => {
      expect(screen.queryByText('Completa tu perfil')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Masculino')).toBeInTheDocument()
    expect(screen.getByText('180 cm')).toBeInTheDocument()
  })

  it('calculates IMC and TMB correctly after adding weight and profile', async () => {
    const user = userEvent.setup()
    mockSupabaseEmpty()
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.getByText('Completa tu perfil')).toBeInTheDocument()
    })
    await user.selectOptions(screen.getByLabelText('Sexo'), 'masculino')
    await user.type(screen.getByLabelText('Altura (cm)'), '180')
    await user.type(screen.getByLabelText('Fecha de nacimiento'), '1990-01-01')
    await user.type(screen.getByLabelText('Peso actual (kg)'), '80')
    await user.click(screen.getByRole('button', { name: /Guardar perfil/i }))
    await waitFor(() => {
      expect(screen.queryByText('Completa tu perfil')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText('24.69')).toBeInTheDocument()
    })
    const currentYear = new Date().getFullYear()
    const edad = currentYear - 1990
    const tmbExpected = Math.round(10 * 80 + 6.25 * 180 - 5 * edad + 5)
    expect(screen.getByText(`${tmbExpected} kcal/día`)).toBeInTheDocument()
  })

  it('calculates TMB for female correctly', async () => {
    const user = userEvent.setup()
    mockSupabaseEmpty()
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.getByText('Completa tu perfil')).toBeInTheDocument()
    })
    await user.selectOptions(screen.getByLabelText('Sexo'), 'femenino')
    await user.type(screen.getByLabelText('Altura (cm)'), '165')
    await user.type(screen.getByLabelText('Fecha de nacimiento'), '1995-06-15')
    await user.type(screen.getByLabelText('Peso actual (kg)'), '65')
    await user.click(screen.getByRole('button', { name: /Guardar perfil/i }))
    await waitFor(() => {
      expect(screen.queryByText('Completa tu perfil')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      const edad = calculateEdad('1995-06-15')
      const tmbExpected = Math.round(10 * 65 + 6.25 * 165 - 5 * edad - 161)
      expect(screen.getByText(`${tmbExpected} kcal/día`)).toBeInTheDocument()
    })
  })
})

describe('Weight history', () => {
  beforeEach(() => {
    useMetricsStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('shows weight entries in the list', async () => {
    useMetricsStore.setState({
      profile: { sexo: 'masculino', altura: 175, fechaNacimiento: '1992-03-10' },
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
      profile: { sexo: 'masculino', altura: 175, fechaNacimiento: '1992-03-10' },
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
      profile: { sexo: 'masculino', altura: 175, fechaNacimiento: '1992-03-10' },
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
  })

  it('shows measurements in the list and filters by type', async () => {
    const user = userEvent.setup()
    useMetricsStore.setState({
      profile: { sexo: 'masculino', altura: 175, fechaNacimiento: '1992-03-10' },
      measurementEntries: [{ id: 'm1', tipo: 'pecho', valor: 42, fecha: '2024-01-15' }],
    })
    render(<Perfil />)
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument()
    })
    const measurementsSection = screen.getByText('Medidas corporales').closest('div')!
    expect(within(measurementsSection).getByText('42 cm')).toBeInTheDocument()
    expect(within(measurementsSection).getByText('Pecho', { selector: 'span' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Bíceps' }))
    expect(within(measurementsSection).queryByText('42 cm')).not.toBeInTheDocument()
    expect(screen.getByText('Aún no hay registros de Bíceps.')).toBeInTheDocument()
  })

  it('removes a measurement entry', async () => {
    const user = userEvent.setup()
    useMetricsStore.setState({
      profile: { sexo: 'masculino', altura: 175, fechaNacimiento: '1992-03-10' },
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
  })

  it('adds a photo and displays it in the gallery', async () => {
    const user = userEvent.setup()
    useMetricsStore.setState({
      profile: { sexo: 'masculino', altura: 175, fechaNacimiento: '1992-03-10' },
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
      profile: { sexo: 'masculino', altura: 175, fechaNacimiento: '1992-03-10' },
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
