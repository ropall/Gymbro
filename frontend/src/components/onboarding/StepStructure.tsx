import { useOnboardingStore } from '../../stores/onboardingStore'

export function StepStructure() {
  const trainingDays = useOnboardingStore((s) => s.trainingDays)
  const days = useOnboardingStore((s) => s.days)
  const setTrainingDays = useOnboardingStore((s) => s.setTrainingDays)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-2 font-[Montserrat]">
          ¿Cuántos días entrenas a la semana?
        </h3>
        <p className="text-brand-mutedText text-sm mb-4">
          Elige cuántos días quieres entrenar. El resto serán días de descanso (total 7 días).
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center justify-between text-white font-medium">
          <span>Días de entrenamiento</span>
          <span className="text-brand-lightAccent text-xl font-black">{trainingDays}</span>
        </label>
        <input
          type="range"
          min={1}
          max={7}
          value={trainingDays}
          onChange={(e) => setTrainingDays(Number(e.target.value))}
          className="w-full accent-brand-accent h-2 bg-brand-border rounded-lg appearance-none cursor-pointer"
          aria-label="Días de entrenamiento"
        />
        <div className="flex justify-between text-xs text-brand-mutedText">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => (
          <div
            key={i}
            className={`flex flex-col items-center justify-center rounded-lg p-2 border text-xs font-medium transition-colors ${
              day.isRest
                ? 'bg-brand-card border-brand-border text-brand-mutedText'
                : 'bg-brand-accent/20 border-brand-lightAccent/30 text-brand-lightAccent'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider opacity-80">Día</span>
            <span className="text-lg font-black">{i + 1}</span>
            <span className="text-[10px]">{day.isRest ? 'Descanso' : 'Entreno'}</span>
          </div>
        ))}
      </div>

      <p className="text-brand-mutedText text-sm text-center">
        {trainingDays} entrenamiento{trainingDays !== 1 ? 's' : ''} ·{' '}
        {7 - trainingDays} descanso{7 - trainingDays !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
