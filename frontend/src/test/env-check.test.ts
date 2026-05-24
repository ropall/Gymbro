import { describe, it, expect, vi } from 'vitest'

describe('env check', () => {
  it('has supabase url', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key')
    expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined()
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined()
  })
})
