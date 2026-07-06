export type WeightRecommendationDirection = 'subir' | 'bajar' | 'mantener'

export interface PreviousSetData {
  peso: number | null
  reps_reales: number | null
}

export interface WeightRecommendation {
  direction: WeightRecommendationDirection
  pesoAnterior: number
  pesoSugerido: number
  repsPromedio: number
  mensaje: string
}

function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment
}

function formatReps(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

/**
 * Compares the reps actually done in the last logged session against the
 * routine's target rep range for that exercise, and suggests whether to
 * adjust the working weight for the next session.
 */
export function getWeightRecommendation(
  previousSets: PreviousSetData[],
  repsObjetivoMin: number | null,
  repsObjetivoMax: number | null
): WeightRecommendation | null {
  if (repsObjetivoMin == null) return null

  const validSets = previousSets.filter(
    (s): s is { peso: number; reps_reales: number } => s.peso != null && s.reps_reales != null
  )
  if (validSets.length === 0) return null

  // Assume the working weight is the one used on the last logged set; only
  // average reps performed at that same weight (ignores warm-up/drop sets).
  const pesoAnterior = validSets[validSets.length - 1].peso
  const setsAtPeso = validSets.filter((s) => s.peso === pesoAnterior)
  const repsPromedio =
    setsAtPeso.reduce((sum, s) => sum + s.reps_reales, 0) / setsAtPeso.length

  const repsMax = repsObjetivoMax ?? repsObjetivoMin
  const increment = pesoAnterior >= 20 ? 2.5 : 1
  const rangoTexto = `${repsObjetivoMin}-${repsMax}`

  let direction: WeightRecommendationDirection
  let pesoSugerido: number
  let mensaje: string

  if (repsPromedio > repsMax) {
    direction = 'subir'
    pesoSugerido = roundToIncrement(pesoAnterior + Math.max(increment, pesoAnterior * 0.05), increment)
    mensaje = `Hiciste ${formatReps(repsPromedio)} reps de media con ${pesoAnterior}kg (objetivo ${rangoTexto}). Prueba a subir a ${pesoSugerido}kg.`
  } else if (repsPromedio < repsObjetivoMin) {
    direction = 'bajar'
    pesoSugerido = roundToIncrement(Math.max(0, pesoAnterior - Math.max(increment, pesoAnterior * 0.075)), increment)
    mensaje = `Hiciste ${formatReps(repsPromedio)} reps de media con ${pesoAnterior}kg (objetivo ${rangoTexto}). Baja a ${pesoSugerido}kg para llegar al rango.`
  } else {
    direction = 'mantener'
    pesoSugerido = pesoAnterior
    mensaje = `Hiciste ${formatReps(repsPromedio)} reps de media con ${pesoAnterior}kg, dentro del objetivo (${rangoTexto}). Mantén el peso.`
  }

  return { direction, pesoAnterior, pesoSugerido, repsPromedio, mensaje }
}
