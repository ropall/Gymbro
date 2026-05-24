import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export function AuthCallback() {
  const navigate = useNavigate()
  const { setUser, setSession, setIsNewUser } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        navigate('/login', { replace: true })
        return
      }

      setSession(session)
      setUser(session.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, onboarding_completado')
        .eq('id', session.user.id)
        .single()

      const isNew = !profileData || profileData.onboarding_completado !== true
      setIsNewUser(isNew)

      navigate(isNew ? '/' : '/', { replace: true })
    }

    handleCallback()
  }, [navigate, setSession, setUser, setIsNewUser])

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-dark">
      <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
        Iniciando sesión...
      </div>
    </div>
  )
}
