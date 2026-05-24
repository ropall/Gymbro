import { useEffect, useCallback } from 'react'
import { useWorkoutStore } from '../../stores/workoutStore'

interface RestTimerProps {
  onTimerComplete: () => void
}

export function RestTimer({ onTimerComplete }: RestTimerProps) {
  const restSecondsRemaining = useWorkoutStore((s) => s.restSecondsRemaining)
  const restTimerRunning = useWorkoutStore((s) => s.restTimerRunning)
  const restTimerStarted = useWorkoutStore((s) => s.restTimerStarted)
  const pauseRestTimer = useWorkoutStore((s) => s.pauseRestTimer)
  const resumeRestTimer = useWorkoutStore((s) => s.resumeRestTimer)
  const tickRestTimer = useWorkoutStore((s) => s.tickRestTimer)

  const tick = useCallback(() => {
    tickRestTimer()
  }, [tickRestTimer])

  useEffect(() => {
    if (!restTimerRunning) return
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [restTimerRunning, tick])

  useEffect(() => {
    if (restTimerStarted && restSecondsRemaining === 0 && !restTimerRunning) {
      onTimerComplete()
    }
  }, [restSecondsRemaining, restTimerRunning, restTimerStarted, onTimerComplete])

  if (!restTimerStarted) return null

  const minutes = Math.floor(restSecondsRemaining / 60)
  const seconds = restSecondsRemaining % 60
  const isComplete = restSecondsRemaining === 0

  return (
    <div className={`p-4 rounded-xl border ${isComplete ? 'bg-brand-accent/20 border-brand-accent' : 'bg-brand-card border-brand-border'}`}>
      <div className="text-center">
        <p className="text-brand-mutedText text-xs font-bold uppercase tracking-wide mb-2">
          Descanso
        </p>
        <div className={`text-4xl font-bold font-heading ${isComplete ? 'text-brand-lightAccent' : 'text-brand-primaryText'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        {!isComplete && (
          <button
            onClick={restTimerRunning ? pauseRestTimer : resumeRestTimer}
            className="mt-3 bg-brand-dark border border-brand-border text-brand-primaryText px-6 py-2 rounded-lg text-sm font-bold min-h-[48px] active:bg-brand-card transition-colors"
          >
            {restTimerRunning ? 'Pausar' : 'Reanudar'}
          </button>
        )}
        {isComplete && (
          <p className="text-brand-lightAccent text-sm font-medium mt-2">
            ¡Descanso completado!
          </p>
        )}
      </div>
    </div>
  )
}
