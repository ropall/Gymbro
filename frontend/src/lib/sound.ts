let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioCtx
}

export function playBeep(frequency = 880, duration = 0.15, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Silenciosamente falla si el navegador no soporta Web Audio API
  }
}

export function playStartSound() {
  playBeep(660, 0.1, 'sine')
  setTimeout(() => playBeep(880, 0.2, 'sine'), 120)
}

export function playTimerDoneSound() {
  playBeep(880, 0.15, 'square')
  setTimeout(() => playBeep(880, 0.15, 'square'), 200)
  setTimeout(() => playBeep(1100, 0.3, 'square'), 400)
}
