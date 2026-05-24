import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function Login() {
  const navigate = useNavigate()
  const { signInWithGoogle, signInWithEmail, resetPasswordForEmail, user } = useAuthStore()
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  if (user) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsSubmitting(true)

    try {
      await signInWithEmail(email, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      const msg = err?.message || 'Ocurrió un error inesperado'
      if (msg.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos')
      } else {
        setError(msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword)
    setError('')
    setSuccessMessage('')
    setPassword('')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPasswordForEmail(email)
      setSuccessMessage('Revisa tu correo electrónico para restablecer tu contraseña')
    } catch (err: any) {
      const msg = err?.message || 'Ocurrió un error inesperado'
      if (msg.includes('rate limit')) {
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
        <h1 className="text-4xl font-black text-brand-lightAccent tracking-tight font-heading">
          Gymbro
        </h1>
        <p className="text-brand-mutedText mt-3 text-center text-sm">
          Tu compañero de entrenamiento y recuperación
        </p>

        <div className="mt-10 w-full">
          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-brand-mutedText text-center">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                autoComplete="email"
                className="input"
              />

              {error && (
                <p className="text-brand-danger text-sm text-center">{error}</p>
              )}

              {successMessage && (
                <p className="text-green-400 text-sm text-center">{successMessage}</p>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  className="btn-ghost text-sm h-9"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  autoComplete="email"
                  className="input"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  className="input"
                />

                {error && (
                  <p className="text-brand-danger text-sm text-center">{error}</p>
                )}

                {successMessage && (
                  <p className="text-green-400 text-sm text-center">{successMessage}</p>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? 'Cargando...' : 'Iniciar sesión'}
                </button>
              </form>

              <div className="mt-3 text-center">
                <button
                  onClick={toggleForgotPassword}
                  className="btn-ghost text-sm h-9"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="mt-1 text-center">
                <Link
                  to="/signup"
                  className="btn-ghost text-sm h-9 inline-flex"
                >
                  ¿No tienes cuenta? Crea una
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-brand-border" />
          <span className="text-xs text-brand-mutedText">o</span>
          <div className="flex-1 h-px bg-brand-border" />
        </div>

        <div className="mt-6 w-full">
          <button
            onClick={() => signInWithGoogle()}
            className="btn-secondary w-full gap-3"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Iniciar sesión con Google
          </button>
        </div>

        <p className="mt-6 text-xs text-brand-mutedText text-center">
          Al continuar, aceptas nuestros términos de uso y política de privacidad.
        </p>
      </div>
    </div>
  )
}
