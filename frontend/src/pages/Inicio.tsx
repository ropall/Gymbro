import { useAuthStore } from '../stores/authStore'

export function Inicio() {
  const isNewUser = useAuthStore((state) => state.isNewUser)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-white font-[Montserrat]">Gymbro</h1>
      <p className="text-brand-mutedText mt-2">
        Bienvenido a tu app de entrenamiento
      </p>

      {isNewUser ? (
        <div className="mt-6 p-4 bg-brand-card border border-brand-border rounded-xl">
          <h2 className="text-lg font-bold text-brand-lightAccent mb-2">
            ¡Bienvenido! Comencemos
          </h2>
          <p className="text-brand-mutedText text-sm mb-4">
            Para empezar, crea tu primera rutina de entrenamiento semanal.
          </p>
          <button className="w-full bg-brand-accent text-white px-6 py-3 rounded-xl font-bold active:bg-brand-lightAccent transition-colors">
            Crear mi primera rutina
          </button>
        </div>
      ) : (
        <button className="mt-6 bg-brand-accent text-white px-6 py-3 rounded-xl font-bold active:bg-brand-lightAccent transition-colors">
          Crear mi primera rutina
        </button>
      )}
    </div>
  )
}
