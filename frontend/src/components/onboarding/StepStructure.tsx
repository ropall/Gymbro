import { useOnboardingStore } from '../../stores/onboardingStore'
import { Dumbbell, Moon } from 'lucide-react'

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function StepStructure() {
  const days = useOnboardingStore((s) => s.days)
  const toggleDayRest = useOnboardingStore((s) => s.toggleDayRest)

  const trainingCount = days.filter((d) => !d.isRest).length
  const restCount = 7 - trainingCount

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-brand-primaryText mb-2 font-heading tracking-tight">
          ¿Qué días entrenas?
        </h3>
        <p className="text-brand-mutedText text-sm mb-4 leading-relaxed">
          Toca los días que vas a entrenar. Los que dejes sin marcar serán descanso.
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const isTraining = !day.isRest
          return (
            <button
              key={i}
              onClick={() => toggleDayRest(i)}
              className={`flex flex-col items-center justify-center rounded-[10px] p-2 border text-xs font-medium transition-all active:scale-95 ${
                isTraining
                  ? 'bg-brand-accent/20 border-brand-lightAccent/40 text-brand-lightAccent shadow-sm'
                  : 'bg-brand-card border-brand-border text-brand-mutedText'
              }`}
              aria-pressed={isTraining}
              aria-label={`Día ${i + 1}: ${isTraining ? 'Entrenamiento' : 'Descanso'}`}
            >
              <span className="text-[10px] uppercase tracking-wider opacity-80 mb-0.5">
                {DAY_NAMES[i]}
              </span>
              <span className="text-lg font-black">{i + 1}</span>
              <span className="mt-1">
                {isTraining ? (
                  <Dumbbell className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
          <span className="text-xs text-brand-secondaryText">
            {trainingCount} entrenamiento{trainingCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-border border border-brand-borderStrong" />
          <span className="text-xs text-brand-secondaryText">
            {restCount} descanso{restCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
