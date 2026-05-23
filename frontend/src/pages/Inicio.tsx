import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

export function Inicio() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [hasBlocks, setHasBlocks] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) return
    const checkBlocks = async () => {
      try {
        const { data, error } = await supabase
          .from('blocks')
          .select('id')
          .limit(1)

        if (error) {
          setHasBlocks(false)
          return
        }
        setHasBlocks((data && data.length > 0) ?? false)
      } catch {
        setHasBlocks(false)
      }
    }
    checkBlocks()
  }, [user])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-white font-[Montserrat]">Gymbro</h1>
      <p className="text-brand-mutedText mt-2">
        Bienvenido a tu app de entrenamiento
      </p>

      {hasBlocks === null ? (
        <div className="mt-6 flex items-center justify-center">
          <div className="text-brand-lightAccent text-sm font-bold animate-pulse">
            Cargando...
          </div>
        </div>
      ) : hasBlocks === false ? (
        <div className="mt-6 p-4 bg-brand-card border border-brand-border rounded-xl">
          <h2 className="text-lg font-bold text-brand-lightAccent mb-2">
            ¡Bienvenido! Comencemos
          </h2>
          <p className="text-brand-mutedText text-sm mb-4">
            Para empezar, crea tu primera rutina de entrenamiento semanal.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full bg-brand-accent text-white px-6 py-3 rounded-xl font-bold active:bg-brand-lightAccent transition-colors min-h-[48px]"
          >
            Crear mi primera rutina
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-brand-mutedText text-sm">
            Aquí podrás ver el resumen de tu rutina actual y tu progreso.
          </p>
        </div>
      )}
    </div>
  )
}
