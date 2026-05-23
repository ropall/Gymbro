import { vi } from 'vitest'

export const mockSupabaseState: Record<string, any> = {
  profiles: { data: null, error: { code: 'PGRST116' } },
  weight_history: { data: [], error: null },
  measurement_history: { data: [], error: null },
  global_exercises: { data: [], error: null },
  user_exercises: { data: [], error: null },
}

export function resetMockSupabaseState() {
  mockSupabaseState.profiles = { data: null, error: { code: 'PGRST116' } }
  mockSupabaseState.weight_history = { data: [], error: null }
  mockSupabaseState.measurement_history = { data: [], error: null }
  mockSupabaseState.global_exercises = { data: [], error: null }
  mockSupabaseState.user_exercises = { data: [], error: null }
}

export function setMockSupabaseState(updates: Partial<typeof mockSupabaseState>) {
  Object.assign(mockSupabaseState, updates)
}

function createChain(table: string) {
  const response = mockSupabaseState[table] ?? { data: [], error: null }
  return {
    select() { return this },
    eq() { return this },
    order: () => Promise.resolve(response),
    single: () => Promise.resolve(response),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({
          data: { id: 'new-id', ...data },
          error: null,
        }),
      }),
    }),
    update: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
  }
}

export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user', email: 'test@example.com' } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithOAuth: vi.fn(() => Promise.resolve({ error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn((table: string) => createChain(table)),
  }
}
