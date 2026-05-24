import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword, session } = useAuthStore()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes('type=recovery') || !session) {
      navigate('/login', { replace: true })
      return
    }
    setChecking(false)
  }, [session, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Por favor ingresa una nueva contraseña')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsSubmitting(true)

    try {
      await updatePassword(password)
      setSuccess(true)
      setTimeout(() => navigate('/', { replace: true }), 2000)
    } catch (err: any) {
      const msg = err?.message || 'Ocurrió un error inesperado'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-dark">
        <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
          Verificando...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-brand-dark">
      <div className="flex flex-col items-center max-w-sm w-full">
        <h1 className="text-4xl font-black text-brand-lightAccent tracking-tight">
          Gymbro
        </h1>
        <p className="text-brand-mutedText mt-3 text-center text-sm">
          Restablece tu contraseña
        </p>

        <div className="mt-10 w-full">
          {success ? (
            <p className="text-green-400 text-sm text-center">
              Contraseña actualizada correctamente. Redirigiendo...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  autoComplete="new-password"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-brand-lightText placeholder:text-brand-mutedText focus:outline-none focus:border-brand-lightAccent transition-colors"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar nueva contraseña"
                  autoComplete="new-password"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-brand-lightText placeholder:text-brand-mutedText focus:outline-none focus:border-brand-lightAccent transition-colors"
                />
              </div>

              {error && (
                <p className="text-brand-danger text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-lightAccent text-brand-inverseText px-6 py-3.5 rounded-xl font-bold transition-transform active:scale-95 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login', { replace: true })}
                  className="text-sm text-brand-mutedText hover:text-brand-lightAccent transition-colors"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
