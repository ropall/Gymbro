interface CardProps {
  dayNumber: number
  muscleGroups?: string[]
  exerciseCount?: number
  onAction: () => void
}

export function Card({ dayNumber, muscleGroups, exerciseCount, onAction }: CardProps) {
  const hasContent = (muscleGroups && muscleGroups.length > 0) || (exerciseCount && exerciseCount > 0)
  const dayLabel = String(dayNumber).padStart(2, '0')

  return (
    <div
      className="relative flex flex-col items-center justify-between rounded-3xl bg-white p-6 transition-all"
      style={{
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        minHeight: '260px',
      }}
    >
      {/* Sección Superior — Número del día */}
      <div className="flex flex-1 items-center justify-center w-full">
        <span
          className="font-heading font-black select-none"
          style={{
            fontSize: 'clamp(4rem, 12vw, 7rem)',
            lineHeight: 1,
            color: 'rgba(0, 0, 0, 0.06)',
            fontFamily: "'Montserrat', 'Nunito', 'Quicksand', sans-serif",
          }}
        >
          {dayLabel}
        </span>
      </div>

      {/* Sección Media — Información */}
      <div className="w-full text-left space-y-1 mb-4">
        <p className="text-sm font-medium text-gray-500 tracking-wide">
          Grupo muscular:{muscleGroups && muscleGroups.length > 0
            ? ` ${muscleGroups.join(', ')}`
            : ''}
        </p>

        {exerciseCount && exerciseCount > 0 ? (
          <p className="text-xs text-gray-400">
            {exerciseCount} ejercicio{exerciseCount !== 1 ? 's' : ''}
          </p>
        ) : (
          <p className="text-xs text-gray-400">Sin ejercicios asignados</p>
        )}
      </div>

      {/* Sección Inferior — Botón */}
      <button
        onClick={onAction}
        className="w-full rounded-2xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 active:scale-[0.98]"
      >
        {hasContent ? 'Editar' : 'Crear'}
      </button>
    </div>
  )
}
