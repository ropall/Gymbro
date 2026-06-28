import { useEffect, useCallback, useMemo, useState } from 'react'
import { useWorkoutStore } from '../../stores/workoutStore'
import { playStartSound, playTimerDoneSound } from '../../lib/sound'

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function interpolateTimerColor(ratio: number): string {
  const clamped = Math.max(0, Math.min(1, ratio))
  let r: number, g: number, b: number

  if (clamped > 0.5) {
    const t = (clamped - 0.5) / 0.5
    r = Math.round(251 + (74 - 251) * t)
    g = Math.round(146 + (222 - 146) * t)
    b = Math.round(60 + (128 - 60) * t)
  } else {
    const t = clamped / 0.5
    r = Math.round(239 + (251 - 239) * t)
    g = Math.round(68 + (146 - 68) * t)
    b = Math.round(68 + (60 - 68) * t)
  }

  return `rgb(${r}, ${g}, ${b})`
}

export function RestTimerModal() {
  const [saved, setSaved] = useState(false)

  const exercises = useWorkoutStore((s) => s.exercises)
  const currentExerciseIndex = useWorkoutStore((s) => s.currentExerciseIndex)
  const currentSetIndex = useWorkoutStore((s) => s.currentSetIndex)
  const restSecondsRemaining = useWorkoutStore((s) => s.restSecondsRemaining)
  const restTotalSeconds = useWorkoutStore((s) => s.restTotalSeconds)
  const restTimerRunning = useWorkoutStore((s) => s.restTimerRunning)
  const restTimerStarted = useWorkoutStore((s) => s.restTimerStarted)
  const tickRestTimer = useWorkoutStore((s) => s.tickRestTimer)
  const pauseRestTimer = useWorkoutStore((s) => s.pauseRestTimer)
  const resumeRestTimer = useWorkoutStore((s) => s.resumeRestTimer)
  const finishSetRest = useWorkoutStore((s) => s.finishSetRest)
  const skipRestTimer = useWorkoutStore((s) => s.skipRestTimer)
  const updateSetWeight = useWorkoutStore((s) => s.updateSetWeight)
  const updateSetReps = useWorkoutStore((s) => s.updateSetReps)
  const updateSetRpe = useWorkoutStore((s) => s.updateSetRpe)

  const currentExercise = exercises[currentExerciseIndex]
  const currentSet = currentExercise?.sets[currentSetIndex]

  const timerColor = useMemo(() => {
    const ratio = restTotalSeconds > 0 ? restSecondsRemaining / restTotalSeconds : 0
    return interpolateTimerColor(ratio)
  }, [restSecondsRemaining, restTotalSeconds])

  const isTimerDone = restSecondsRemaining === 0 && restTimerStarted

  // Reset saved state when a new rest timer starts
  useEffect(() => {
    if (restTimerStarted) {
      setSaved(false)
    }
  }, [restTimerStarted, currentSetIndex, currentExerciseIndex])

  // Tick effect
  const tick = useCallback(() => {
    tickRestTimer()
  }, [tickRestTimer])

  useEffect(() => {
    if (!restTimerRunning) return
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [restTimerRunning, tick])

  // Play start sound once when modal opens
  useEffect(() => {
    if (restTimerStarted) {
      playStartSound()
    }
  }, [restTimerStarted])

  // Play done sound when timer hits 0
  useEffect(() => {
    if (isTimerDone && restTimerStarted) {
      playTimerDoneSound()
    }
  }, [isTimerDone, restTimerStarted])

  // Sync timer from wall clock when app returns from background
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        tickRestTimer()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [tickRestTimer])

  if (!restTimerStarted || !currentSet || !currentSet.completed) return null

  const allSetsCompleted = currentExercise.sets.every((s) => s.completed)
  const nextButtonText = allSetsCompleted ? 'Siguiente ejercicio →' : 'Siguiente serie →'

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 max-w-sm w-full space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <p className="text-brand-mutedText text-xs font-bold uppercase tracking-wide mb-1">
            Descanso
          </p>
          <h2 className="text-brand-primaryText font-bold text-lg">
            Serie {currentSet.orden} completada
          </h2>
        </div>

        {/* Timer */}
        <div className="text-center">
          <div
            className="text-6xl font-bold font-heading tabular-nums tracking-tight transition-colors duration-1000"
            style={{ color: timerColor }}
          >
            {formatTime(restSecondsRemaining)}
          </div>
          {isTimerDone && (
            <p className="text-brand-lightAccent text-sm font-medium mt-2 animate-pulse">
              ¡Descanso completado!
            </p>
          )}
          {!isTimerDone && (
            <div className="mt-3 flex gap-2 justify-center">
              <button
                onClick={restTimerRunning ? pauseRestTimer : resumeRestTimer}
                className="bg-brand-dark border border-brand-border text-brand-primaryText px-6 py-2 rounded-lg text-sm font-bold min-h-[48px] active:bg-brand-card transition-colors"
              >
                {restTimerRunning ? 'Pausar' : 'Reanudar'}
              </button>
              {saved && (
                <button
                  onClick={skipRestTimer}
                  className="bg-brand-dark border border-brand-border text-brand-lightAccent px-6 py-2 rounded-lg text-sm font-bold min-h-[48px] active:bg-brand-card transition-colors"
                >
                  Saltar descanso
                </button>
              )}
            </div>
          )}
        </div>

        {/* Inputs section — hidden after saving */}
        {!saved && (
          <div className="space-y-4">
            {/* Weight */}
            <div>
              <label htmlFor="modal-weight" className="text-brand-mutedText text-xs font-bold uppercase tracking-wide block mb-2">
                Peso (kg)
              </label>
              <input
                id="modal-weight"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={currentSet.peso ?? ''}
                onChange={(e) => updateSetWeight(e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-3 text-brand-primaryText text-lg font-bold min-h-[48px] focus:border-brand-lightAccent focus:outline-none"
              />
            </div>

            {/* Reps */}
            <div>
              <label htmlFor="modal-reps" className="text-brand-mutedText text-xs font-bold uppercase tracking-wide block mb-2">
                Repeticiones
              </label>
              <input
                id="modal-reps"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={currentSet.reps_reales ?? ''}
                onChange={(e) => updateSetReps(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-3 text-brand-primaryText text-lg font-bold min-h-[48px] focus:border-brand-lightAccent focus:outline-none"
              />
            </div>

            {/* RPE */}
            <div>
              <label className="text-brand-mutedText text-xs font-bold uppercase tracking-wide block mb-2">
                RPE real
              </label>
              <div className="flex gap-2 flex-wrap justify-center">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((rpe) => (
                  <button
                    key={rpe}
                    onClick={() => updateSetRpe(rpe)}
                    className={`w-12 h-12 rounded-lg text-sm font-bold transition-colors min-w-[48px] ${
                      currentSet.rpe_real === rpe
                        ? 'bg-brand-lightAccent text-brand-inverseText'
                        : 'bg-brand-dark border border-brand-border text-brand-primaryText active:bg-brand-card'
                    }`}
                  >
                    {rpe}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action button */}
        {!saved ? (
          <button
            onClick={() => setSaved(true)}
            className="w-full bg-brand-accent text-white py-4 rounded-xl text-lg font-bold min-h-[48px] active:bg-brand-lightAccent transition-colors"
          >
            Aceptar
          </button>
        ) : isTimerDone ? (
          <button
            onClick={finishSetRest}
            className="w-full bg-brand-accent text-white py-4 rounded-xl text-lg font-bold min-h-[48px] active:bg-brand-lightAccent transition-colors"
          >
            {nextButtonText}
          </button>
        ) : null}
      </div>
    </div>
  )
}
