import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isNewUser: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setIsLoading: (isLoading: boolean) => void
  setIsNewUser: (isNewUser: boolean) => void
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      isNewUser: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsNewUser: (isNewUser) => set({ isNewUser }),

      signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        set({ user: null, session: null, isNewUser: false })
      },

      initialize: async () => {
        set({ isLoading: true })

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()

          set({
            session,
            user: session.user,
            isNewUser: !existingProfile,
            isLoading: false,
          })
        } else {
          set({ session: null, user: null, isNewUser: false, isLoading: false })
        }

        supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            set({
              session,
              user: session.user,
              isLoading: false,
            })
          } else {
            set({ session: null, user: null, isLoading: false })
          }
        })
      },
    }),
    {
      name: 'gymbro-auth-state',
      partialize: (state) => ({
        isNewUser: state.isNewUser,
      }),
    }
  )
)
