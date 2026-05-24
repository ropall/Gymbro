import { useNavigate } from 'react-router-dom'
import { useOnboardingProfileStore } from '../stores/onboardingProfileStore'
import { useMetricsStore } from '../stores/metricsStore'
import { StepIdentity } from '../components/onboarding/StepIdentity'
import { StepBiology } from '../components/onboarding/StepBiology'
import { StepLifestyle } from '../components/onboarding/StepLifestyle'

const STEPS = [
  { number: 1, title: 'Identidad' },
  { number: 2, title: 'Biología' },
  { number: 3, title: 'Estilo de vida' },
]

export function OnboardingProfile() {
  const navigate = useNavigate()
  const { step, data, isSubmitting, error, setStep, setIsSubmitting, setError, reset } =
    useOnboardingProfileStore()
  const { completeOnboarding } = useMetricsStore()

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleFinish = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await completeOnboarding(
        {
          fullName: data.fullName,
          fechaNacimiento: data.fechaNacimiento,
          fotoPerfil: data.fotoPerfil,
          sexo: data.sexo,
          altura: data.altura,
          pesoObjetivo: data.pesoObjetivo,
          nivelActividad: data.nivelActividad,
          objetivoPrincipal: data.objetivoPrincipal,
          cronotipo: data.cronotipo,
          splitPreferido: data.splitPreferido,
        },
        data.pesoInicial
      )

      reset()
      navigate('/perfil', { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark">
      {/* Header with progress */}
      <div className="px-6 pt-6 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-brand-lightText">
            Paso {step} de {STEPS.length}
          </h1>
          {step > 1 && (
            <button
              onClick={handlePrev}
              className="text-sm text-brand-mutedText hover:text-brand-lightAccent transition-colors"
            >
              Atrás
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((s) => (
            <div key={s.number} className="flex-1 flex items-center gap-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  s.number <= step
                    ? 'bg-brand-lightAccent flex-1'
                    : 'bg-brand-border flex-1'
                }`}
              />
            </div>
          ))}
        </div>
        <p className="text-sm text-brand-lightAccent font-medium">
          {STEPS[step - 1].title}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {step === 1 && <StepIdentity />}
        {step === 2 && <StepBiology />}
        {step === 3 && <StepLifestyle />}

        {error && (
          <p className="text-brand-danger text-sm text-center mt-4">{error}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4">
        <button
          onClick={step < 3 ? handleNext : handleFinish}
          disabled={isSubmitting}
          className="w-full bg-brand-lightAccent text-brand-inverseText px-6 py-3.5 rounded-xl font-bold transition-transform active:scale-95 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Guardando...'
            : step < 3
              ? 'Continuar'
              : '¡Empezar a entrenar!'}
        </button>
      </div>
    </div>
  )
}
