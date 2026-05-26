import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '../stores/onboardingStore'
import { StepStructure } from '../components/onboarding/StepStructure'
import { StepMuscleGroups } from '../components/onboarding/StepMuscleGroups'
import { StepExercises } from '../components/onboarding/StepExercises'
import { StepSummary } from '../components/onboarding/StepSummary'

const STEPS = [
  { number: 1, title: 'Estructura' },
  { number: 2, title: 'Grupos' },
  { number: 3, title: 'Ejercicios' },
  { number: 4, title: 'Resumen' },
]

export function Onboarding() {
  const navigate = useNavigate()
  const step = useOnboardingStore((s) => s.step)
  const setStep = useOnboardingStore((s) => s.setStep)
  const days = useOnboardingStore((s) => s.days)
  const submitWizard = useOnboardingStore((s) => s.submitWizard)
  const isSubmitting = useOnboardingStore((s) => s.isSubmitting)
  const error = useOnboardingStore((s) => s.error)
  const reset = useOnboardingStore((s) => s.reset)

  const [submitError, setSubmitError] = useState<string | null>(null)

  function canProceed() {
    if (step === 1) return true
    if (step === 2) {
      const trainingDays = days.filter((d) => !d.isRest)
      return trainingDays.every((d) => d.exercises.length > 0)
    }
    if (step === 3) {
      const trainingDays = days.filter((d) => !d.isRest)
      return trainingDays.every((d) => d.exercises.length > 0)
    }
    return true
  }

  function handleNext() {
    setSubmitError(null)
    if (step < 4) {
      setStep(step + 1)
    }
  }

  function handlePrev() {
    setSubmitError(null)
    if (step > 1) {
      setStep(step - 1)
    } else {
      navigate('/')
    }
  }

  async function handleFinish() {
    setSubmitError(null)
    try {
      await submitWizard()
      reset()
      navigate('/')
    } catch (err: any) {
      setSubmitError(err.message ?? 'Error al guardar la rutina')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark">
      {/* Header */}
      <header className="sticky top-0 bg-brand-dark/95 backdrop-blur border-b border-brand-border z-10 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrev}
            className="text-brand-mutedText hover:text-brand-primaryText text-sm font-medium"
          >
            ← {step === 1 ? 'Volver' : 'Anterior'}
          </button>
          <span className="text-brand-mutedText text-xs">
            Paso {step} de {STEPS.length}
          </span>
        </div>

        <div className="flex gap-1">
          {STEPS.map((s) => (
            <div
              key={s.number}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s.number <= step ? 'bg-brand-accent' : 'bg-brand-border'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        {step === 1 && <StepStructure />}
        {step === 2 && <StepMuscleGroups />}
        {step === 3 && <StepExercises />}
        {step === 4 && <StepSummary />}

        {(error || submitError) && (
          <div className="mt-4 p-3 bg-brand-dangerBg border border-brand-dangerBorder rounded-lg text-brand-danger text-sm">
            {error || submitError}
          </div>
        )}
      </main>

      {/* Footer actions */}
      <footer className="sticky bottom-0 bg-brand-dark/95 backdrop-blur border-t border-brand-border px-4 py-3">
        {step < 4 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full bg-brand-accent text-white px-6 py-3 rounded-xl font-bold active:bg-brand-lightAccent transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={isSubmitting}
            className="w-full bg-brand-accent text-white px-6 py-3 rounded-xl font-bold active:bg-brand-lightAccent transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            {isSubmitting ? 'Guardando...' : 'Finalizar y crear rutina'}
          </button>
        )}
      </footer>
    </div>
  )
}
