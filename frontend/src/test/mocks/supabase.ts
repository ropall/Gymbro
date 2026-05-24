import { vi } from 'vitest'

// Configurable mock for Supabase client
export const supabaseMock = {
  user: { id: 'test-user-id', email: 'test@example.com' } as any,
  session: { access_token: 'test-token' } as any,

  // Tables data overrides
  profilesData: null as any,
  weightHistoryData: [] as any[],
  measurementHistoryData: [] as any[],
  globalExercisesData: [] as any[],
  userExercisesData: [] as any[],

  reset() {
    this.user = { id: 'test-user-id', email: 'test@example.com' }
    this.session = { access_token: 'test-token' }
    this.profilesData = null
    this.weightHistoryData = []
    this.measurementHistoryData = []
    this.globalExercisesData = []
    this.userExercisesData = []
  },
}

// Build the mock client
export function createMockSupabase() {
  function mockQuery(table: string) {
    const tableData = () => {
      switch (table) {
        case 'profiles': return supabaseMock.profilesData
        case 'weight_history': return supabaseMock.weightHistoryData
        case 'measurement_history': return supabaseMock.measurementHistoryData
        case 'global_exercises': return supabaseMock.globalExercisesData
        case 'user_exercises': return supabaseMock.userExercisesData
        default: return []
      }
    }

    const result: any = {
      eq: () => result,
      order: () => result,
      single: () => Promise.resolve({ data: tableData(), error: null }),
      select: () => result,
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }

    // Override for select chains
    result.select = (..._cols: string[]) => {
      return result
    }

    result.order = () => result
    result.eq = () => result
    result.single = () => Promise.resolve({ data: tableData(), error: null })

    return result
  }

  return {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: supabaseMock.user } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: supabaseMock.session } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithOAuth: vi.fn(() => Promise.resolve({ error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn((table: string) => mockQuery(table)),
  }
}
