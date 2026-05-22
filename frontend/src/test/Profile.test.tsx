import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { Perfil } from '../pages/Perfil'
import { useMetricsStore } from '../stores/metricsStore'
import { calculateEdad } from '../utils/calculations'

describe('Perfil page', () => {
  beforeEach(() => {
    useMetricsStore.getState().reset()
  })

  it('renders profile page with metrics section', () => {
    render(<Perfil />)

    expect(screen.getByText('Perfil')).toBeInTheDocument()
    expect(screen.getByText('Tus métricas y progreso')).toBeInTheDocument()
    expect(screen.getByText('Métricas básicas')).toBeInTheDocument()
  })

  it('shows post-registration form when profile is empty', () => {
    render(<Perfil />)

    expect(screen.getByText('Completa tu perfil')).toBeInTheDocument()
  })

  it('allows saving profile with skipped fields and shows metrics', async () => {
    const user = userEvent.setup()
    render(<Perfil />)

    // Fill only sexo and altura, skip fechaNacimiento and peso
    await user.selectOptions(screen.getByLabelText('Sexo'), 'masculino')
    await user.type(screen.getByLabelText('Altura (cm)'), '180')

    await user.click(screen.getByRole('button', { name: /Guardar perfil/i }))

    await waitFor(() => {
      expect(screen.queryByText('Completa tu perfil')).not.toBeInTheDocument()
    })

    // Metrics should show sexo and altura, but edad and peso as "—"
    expect(screen.getByText('Masculino')).toBeInTheDocument()
    expect(screen.getByText('180 cm')).toBeInTheDocument()
  })

  it('calculates IMC and TMB correctly after adding weight and profile', async () => {
    const user = userEvent.setup()
    render(<Perfil />)

    // Complete profile
    await user.selectOptions(screen.getByLabelText('Sexo'), 'masculino')
    await user.type(screen.getByLabelText('Altura (cm)'), '180')
    await user.type(screen.getByLabelText('Fecha de nacimiento'), '1990-01-01')
    await user.type(screen.getByLabelText('Peso actual (kg)'), '80')

    await user.click(screen.getByRole('button', { name: /Guardar perfil/i }))

    await waitFor(() => {
      expect(screen.queryByText('Completa tu perfil')).not.toBeInTheDocument()
    })

    // IMC = 80 / (1.8^2) = 24.69
    expect(screen.getByText('24.69')).toBeInTheDocument()

    // TMB = 10*80 + 6.25*180 - 5*edad + 5 (edad depends on current year)
    const currentYear = new Date().getFullYear()
    const edad = currentYear - 1990
    const tmbExpected = Math.round(10 * 80 + 6.25 * 180 - 5 * edad + 5)
    expect(screen.getByText(`${tmbExpected} kcal/día`)).toBeInTheDocument()
  })

  it('calculates TMB for female correctly', async () => {
    const user = userEvent.setup()
    render(<Perfil />)

    await user.selectOptions(screen.getByLabelText('Sexo'), 'femenino')
    await user.type(screen.getByLabelText('Altura (cm)'), '165')
    await user.type(screen.getByLabelText('Fecha de nacimiento'), '1995-06-15')
    await user.type(screen.getByLabelText('Peso actual (kg)'), '65')

    await user.click(screen.getByRole('button', { name: /Guardar perfil/i }))

    await waitFor(() => {
      expect(screen.queryByText('Completa tu perfil')).not.toBeInTheDocument()
    })

    const edad = calculateEdad('1995-06-15')
    const tmbExpected = Math.round(10 * 65 + 6.25 * 165 - 5 * edad - 161)
    expect(screen.getByText(`${tmbExpected} kcal/día`)).toBeInTheDocument()
  })
})

describe('Weight history', () => {
  beforeEach(() => {
    useMetricsStore.getState().reset()
    // Pre-fill profile to avoid the post-registration form
    useMetricsStore.getState().setProfile({
      sexo: 'masculino',
      altura: 175,
      fechaNacimiento: '1992-03-10',
    })
  })

  it('adds a weight entry and shows it in the list', async () => {
    const user = userEvent.setup()
    render(<Perfil />)

    const weightSection = screen.getByText('Historial de peso').closest('div')!

    const pesoInput = screen.getByPlaceholderText('Peso (kg)')
    await user.type(pesoInput, '78.5')

    await user.click(screen.getByRole('button', { name: /Registrar peso/i }))

    expect(within(weightSection).getByText('78.5 kg')).toBeInTheDocument()
  })

  it('rejects duplicate weight entries in the same week', async () => {
    const user = userEvent.setup()
    render(<Perfil />)

    const pesoInput = screen.getByPlaceholderText('Peso (kg)')
    await user.type(pesoInput, '78')
    await user.click(screen.getByRole('button', { name: /Registrar peso/i }))

    await user.clear(pesoInput)
    await user.type(pesoInput, '79')
    await user.click(screen.getByRole('button', { name: /Registrar peso/i }))

    expect(screen.getByText('Ya existe un registro de peso para esta semana')).toBeInTheDocument()
  })

  it('removes a weight entry', async () => {
    const user = userEvent.setup()
    useMetricsStore.getState().addWeight(80, '2024-01-15')

    render(<Perfil />)

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
    useMetricsStore.getState().setProfile({
      sexo: 'masculino',
      altura: 175,
      fechaNacimiento: '1992-03-10',
    })
  })

  it('adds a measurement and filters by type', async () => {
    const user = userEvent.setup()
    render(<Perfil />)

    const measurementsSection = screen.getByText('Medidas corporales').closest('div')!

    const valorInput = screen.getByPlaceholderText('Valor (cm)')
    await user.type(valorInput, '42')

    await user.click(screen.getByRole('button', { name: /Registrar medida/i }))

    expect(within(measurementsSection).getByText('42 cm')).toBeInTheDocument()
    expect(within(measurementsSection).getByText('Pecho', { selector: 'span' })).toBeInTheDocument()

    // Filter to Bíceps
    await user.click(screen.getByRole('button', { name: 'Bíceps' }))

    expect(within(measurementsSection).queryByText('42 cm')).not.toBeInTheDocument()
    expect(screen.getByText('Aún no hay registros de Bíceps.')).toBeInTheDocument()
  })

  it('removes a measurement entry', async () => {
    const user = userEvent.setup()
    useMetricsStore.getState().addMeasurement('cintura', 82, '2024-01-10')

    render(<Perfil />)

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
    useMetricsStore.getState().setProfile({
      sexo: 'masculino',
      altura: 175,
      fechaNacimiento: '1992-03-10',
    })
  })

  it('adds a photo and displays it in the gallery', async () => {
    const user = userEvent.setup()
    render(<Perfil />)

    const file = new File(['fake-image'], 'progress.jpg', { type: 'image/jpeg' })

    // Mock FileReader
    const originalFileReader = globalThis.FileReader
    // @ts-expect-error — mocking FileReader
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

    // Restore FileReader
    globalThis.FileReader = originalFileReader
  })

  it('removes a photo from the gallery', async () => {
    const user = userEvent.setup()
    useMetricsStore.getState().addPhoto('data:image/jpeg;base64,test', '2024-01-15')

    render(<Perfil />)

    expect(screen.getByAltText(/Foto del/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Eliminar foto' }))

    await waitFor(() => {
      expect(screen.queryByAltText(/Foto del/)).not.toBeInTheDocument()
    })
  })
})
