import { describe, it, expect } from 'vitest'
import { getWeightRecommendation } from '../utils/weightRecommendation'

describe('getWeightRecommendation', () => {
  it('returns null when there is no previous data', () => {
    expect(getWeightRecommendation([], 8, 12)).toBeNull()
  })

  it('returns null when the exercise has no target rep range', () => {
    const sets = [{ peso: 40, reps_reales: 12 }]
    expect(getWeightRecommendation(sets, null, null)).toBeNull()
  })

  it('ignores sets without weight or reps logged', () => {
    const sets = [{ peso: null, reps_reales: 10 }, { peso: 40, reps_reales: null }]
    expect(getWeightRecommendation(sets, 8, 12)).toBeNull()
  })

  it('suggests increasing weight when reps exceed the target max', () => {
    const sets = [
      { peso: 40, reps_reales: 14 },
      { peso: 40, reps_reales: 13 },
      { peso: 40, reps_reales: 14 },
    ]
    const result = getWeightRecommendation(sets, 8, 12)

    expect(result?.direction).toBe('subir')
    expect(result?.pesoAnterior).toBe(40)
    expect(result?.pesoSugerido).toBeGreaterThan(40)
    expect(result?.mensaje).toContain('subir')
  })

  it('suggests decreasing weight when reps fall short of the target min', () => {
    const sets = [
      { peso: 60, reps_reales: 5 },
      { peso: 60, reps_reales: 6 },
    ]
    const result = getWeightRecommendation(sets, 8, 12)

    expect(result?.direction).toBe('bajar')
    expect(result?.pesoAnterior).toBe(60)
    expect(result?.pesoSugerido).toBeLessThan(60)
    expect(result?.mensaje).toContain('Baja')
  })

  it('suggests maintaining weight when reps land within the target range', () => {
    const sets = [
      { peso: 50, reps_reales: 10 },
      { peso: 50, reps_reales: 9 },
    ]
    const result = getWeightRecommendation(sets, 8, 12)

    expect(result?.direction).toBe('mantener')
    expect(result?.pesoSugerido).toBe(50)
  })

  it('falls back to the min as the max when no max is defined', () => {
    const sets = [{ peso: 30, reps_reales: 20 }]
    const result = getWeightRecommendation(sets, 15, null)

    expect(result?.direction).toBe('subir')
  })

  it('only averages reps from sets logged at the most recent weight', () => {
    // Warm-up set at 20kg (irrelevant), then working sets at 40kg averaging within range
    const sets = [
      { peso: 20, reps_reales: 20 },
      { peso: 40, reps_reales: 10 },
      { peso: 40, reps_reales: 11 },
    ]
    const result = getWeightRecommendation(sets, 8, 12)

    expect(result?.direction).toBe('mantener')
    expect(result?.pesoAnterior).toBe(40)
  })

  it('uses a smaller rounding increment for light weights', () => {
    const sets = [{ peso: 8, reps_reales: 15 }]
    const result = getWeightRecommendation(sets, 8, 12)

    expect(result?.direction).toBe('subir')
    expect(result?.pesoSugerido).toBe(9)
  })
})
