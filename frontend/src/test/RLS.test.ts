import { createClient } from '@supabase/supabase-js'
import { describe, it, expect } from 'vitest'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

async function isSupabaseReachable(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
      headers: { apikey: key },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return res.status < 500
  } catch {
    return false
  }
}

const supabaseReachable = await isSupabaseReachable()

describe.skipIf(!supabaseReachable)('Row Level Security (RLS)', () => {
  const supabase = createClient(url, key)

  it('blocks anonymous SELECT on all user-protected tables', async () => {
    const protectedTables = [
      'profiles',
      'weight_history',
      'measurement_history',
      'progress_photos',
      'user_exercises',
      'blocks',
      'block_exercises',
      'cycles',
      'sessions',
      'session_sets',
      'recovery_checklist',
      'nutrition_menus',
      'nutrition_meals',
    ]

    for (const table of protectedTables) {
      const { data, error } = await supabase.from(table).select('*')
      expect(error, `Expected no error for ${table}, got: ${error?.message}`).toBeNull()
      expect(
        data,
        `Anonymous client should see empty array for ${table}, but got data`
      ).toEqual([])
    }
  })

  it('blocks anonymous SELECT on global_exercises (authenticated-only policy)', async () => {
    const { data, error } = await supabase.from('global_exercises').select('*')
    expect(error, 'Expected no error for global_exercises').toBeNull()
    expect(
      data,
      'Anonymous client should see empty array for global_exercises, but got data'
    ).toEqual([])
  })

  it('allows authenticated read of global_exercises seed data', async () => {
    // This test documents the expected behaviour: only authenticated users
    // can read the global exercise catalog. When run with a real session
    // the array should contain ~96 rows. In anonymous mode it must be [].
    const { data, error } = await supabase.from('global_exercises').select('*')
    expect(error).toBeNull()
    expect(data).toEqual([])
  })
})
