import { describe, it, expect } from 'vitest'

describe('jsdom check', () => {
  it('has document', () => {
    expect(typeof document).toBe('object')
  })
})
