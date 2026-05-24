import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function SignUp() {
  const navigate = useNavigate()
  const { signUpWithEmail, user } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)

  if (user) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsSubmitting(true)

    try {
      await signUpWithEmail(email, password)
      setRegistered(true)
    } catch (err: any) {
      const msg = err?.message || 'Ocurrió un error inesperado'
      if (msg.includes('already registered')) {
        setError('Ya existe una cuenta con este correo')
      } else if (msg.includes('rate limit')) {
        setError('Demasiados intentos. Espera un momento e inténtalo de nuevo')
      } else {
        setError(msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-brand-dark">
      <div className="flex flex-col items-center max-w-sm w-full">
        <h1 className="text-4xl font-black text-brand-lightAccent tracking-tight">
          Gymbro
        </h1>
        <p className="text-brand-mutedText mt-3 text-center text-sm">
          Tu compañero de entrenamiento y recuperación
        </p>

        <div className="mt-10 w-full">
          {registered ? (
            <div className="space-y-4 text-center">
              <p className="text-green-400 text-sm">
                Cuenta Registrada. Revisa tu correo electrónico para confirmar tu cuenta
              </p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full bg-brand-lightAccent text-brand-inverseText px-6 py-3.5 rounded-xl font-bold transition-transform active:scale-95 hover:opacity-90"
              >
                Ok
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  autoComplete="email"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-brand-lightText placeholder:text-brand-mutedText focus:outline-none focus:border-brand-lightAccent transition-colors"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  autoComplete="new-password"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-brand-lightText placeholder:text-brand-mutedText focus:outline-none focus:border-brand-lightAccent transition-colors"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar contraseña"
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
                {isSubmitting ? 'Cargando...' : 'Crear cuenta'}
              </button>
            </form>
          )}

          {!registered && (
            <div className="mt-2 text-center">
              <Link
                to="/login"
                className="text-sm text-brand-mutedText hover:text-brand-lightAccent transition-colors"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-brand-mutedText">
            Al continuar, aceptas nuestros términos de uso y política de privacidad.
          </p>
        </div>
      </div>
    </div>
  )
}
