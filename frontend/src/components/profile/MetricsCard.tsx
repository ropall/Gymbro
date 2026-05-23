import { useMetricsStore } from '../../stores/metricsStore'
import { calculateIMC, calculateTMB, calculateEdad } from '../../utils/calculations'

export function MetricsCard() {
  const profile = useMetricsStore((state) => state.profile)
  const latestWeight = useMetricsStore((state) => state.getLatestWeight())

  const hasProfile = profile !== null
  const hasWeight = latestWeight !== undefined

  const imc =
    hasProfile && hasWeight
      ? calculateIMC(latestWeight.peso, profile.altura)
      : null

  const edad = hasProfile ? calculateEdad(profile.fechaNacimiento) : null

  const tmb =
    hasProfile && hasWeight && edad !== null
      ? calculateTMB(latestWeight.peso, profile.altura, edad, profile.sexo)
      : null

  return (
    <div className="bg-brand-card rounded-lg p-4 border border-brand-border">
      <h3 className="text-brand-lightAccent font-semibold mb-3 font-[Montserrat]">
        Métricas básicas
      </h3>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-brand-mutedText">Sexo</span>
          <p className="text-white font-medium">
            {hasProfile ? (profile.sexo === 'masculino' ? 'Masculino' : 'Femenino') : '—'}
          </p>
        </div>
        <div>
          <span className="text-brand-mutedText">Edad</span>
          <p className="text-white font-medium">{edad !== null ? `${edad} años` : '—'}</p>
        </div>
        <div>
          <span className="text-brand-mutedText">Altura</span>
          <p className="text-white font-medium">
            {hasProfile ? `${profile.altura} cm` : '—'}
          </p>
        </div>
        <div>
          <span className="text-brand-mutedText">Peso actual</span>
          <p className="text-white font-medium">
            {hasWeight ? `${latestWeight.peso} kg` : '—'}
          </p>
        </div>
        <div>
          <span className="text-brand-mutedText">IMC</span>
          <p className="text-white font-medium">{imc !== null ? imc : '—'}</p>
        </div>
        <div>
          <span className="text-brand-mutedText">TMB (Mifflin-St Jeor)</span>
          <p className="text-white font-medium">{tmb !== null ? `${tmb} kcal/día` : '—'}</p>
        </div>
      </div>
    </div>
  )
}
