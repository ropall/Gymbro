import { useState } from 'react'
import { useMetricsStore } from '../../stores/metricsStore'
import { todayISO } from '../../utils/calculations'
import type { Sexo } from '../../types'

export function PostRegistrationForm({ onComplete }: { onComplete: () => void }) {
  const setProfile = useMetricsStore((state) => state.setProfile)
  const addWeight = useMetricsStore((state) => state.addWeight)

  const [sexo, setSexo] = useState<Sexo | ''>('')
  const [altura, setAltura] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [peso, setPeso] = useState('')

  const skipped = {
    sexo: sexo === '',
    altura: altura === '',
    fechaNacimiento: fechaNacimiento === '',
    peso: peso === '',
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const profileData = {
      sexo: skipped.sexo ? undefined : (sexo as Sexo),
      altura: skipped.altura ? undefined : parseInt(altura, 10),
      fechaNacimiento: skipped.fechaNacimiento ? undefined : fechaNacimiento,
    }

    // Only set profile if at least one field is filled
    if (profileData.sexo || profileData.altura || profileData.fechaNacimiento) {
      setProfile({
        sexo: profileData.sexo ?? 'masculino',
        altura: profileData.altura ?? 170,
        fechaNacimiento: profileData.fechaNacimiento ?? todayISO(),
      })
    }

    if (!skipped.peso) {
      addWeight(parseFloat(peso), todayISO())
    }

    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-brand-dark/95 z-40 flex items-center justify-center p-4">
      <div className="bg-brand-card rounded-lg p-6 w-full max-w-sm border border-brand-border">
        <h2 className="text-xl font-bold text-white mb-4 font-[Montserrat]">
          Completa tu perfil
        </h2>
        <p className="text-brand-mutedText text-sm mb-4">
          Puedes omitir cualquier dato y completarlo después.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="post-sexo" className="text-sm text-brand-mutedText">Sexo</label>
            <select
              id="post-sexo"
              value={sexo}
              onChange={(e) => setSexo(e.target.value as Sexo)}
              className="bg-brand-dark border border-brand-border rounded px-3 py-2 text-white min-h-[48px]"
            >
              <option value="">Omitir</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="post-altura" className="text-sm text-brand-mutedText">Altura (cm)</label>
            <input
              id="post-altura"
              type="number"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              placeholder="Omitir"
              className="bg-brand-dark border border-brand-border rounded px-3 py-2 text-white placeholder:text-brand-mutedText min-h-[48px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="post-fecha" className="text-sm text-brand-mutedText">Fecha de nacimiento</label>
            <input
              id="post-fecha"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="bg-brand-dark border border-brand-border rounded px-3 py-2 text-white min-h-[48px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="post-peso" className="text-sm text-brand-mutedText">Peso actual (kg)</label>
            <input
              id="post-peso"
              type="number"
              step="0.1"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="Omitir"
              className="bg-brand-dark border border-brand-border rounded px-3 py-2 text-white placeholder:text-brand-mutedText min-h-[48px]"
            />
          </div>

          <button
            type="submit"
            className="bg-brand-accent text-white rounded px-4 py-3 font-medium min-h-[48px] mt-2 active:bg-brand-lightAccent transition-colors"
          >
            Guardar perfil
          </button>
        </form>
      </div>
    </div>
  )
}
