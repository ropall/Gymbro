const CELEBRATION_MESSAGES = [
  '¡Increíble trabajo! Cada serie te acerca más a tu mejor versión. 💪',
  '¡Lo lograste! La disciplina es el puente entre metas y logros. 🔥',
  '¡Entrenamiento completado! Tu yo del futuro te lo agradecerá. 🎯',
  '¡Brutal! El dolor de hoy es la fuerza de mañana. 🏋️',
  '¡Eres una máquina! La constancia vence lo que la dicha no alcanza. ⚡',
  '¡Sesión terminada! No hay atajos, solo trabajo duro. 🚀',
  '¡Excelente! El único mal entrenamiento es el que no hiciste. 🌟',
  '¡Bien hecho! Cada gota de sudor cuenta. 💧',
]

interface CelebrationScreenProps {
  onContinue: () => void
}

export function CelebrationScreen({ onContinue }: CelebrationScreenProps) {
  const message = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]

  return (
    <div className="fixed inset-0 bg-brand-dark flex flex-col items-center justify-center p-6 z-40">
      <div className="text-center space-y-6">
        <div className="text-6xl animate-bounce">🎉</div>
        <h1 className="text-white text-3xl font-bold font-[Montserrat]">
          ¡Entrenamiento Completado!
        </h1>
        <p className="text-brand-lightAccent text-lg max-w-sm mx-auto">
          {message}
        </p>
        <button
          onClick={onContinue}
          className="bg-brand-accent text-white px-8 py-4 rounded-xl text-lg font-bold min-h-[48px] active:bg-brand-lightAccent transition-colors w-full max-w-sm"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
