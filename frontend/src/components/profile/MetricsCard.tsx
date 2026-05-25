import { useMetricsStore } from '../../stores/metricsStore'
import { calculateIMC, calculateTMB, calculateTDEE, calculateEdad } from '../../utils/calculations'

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

  const tdee =
    tmb !== null && hasProfile
      ? calculateTDEE(tmb, profile.nivelActividad)
      : null

  return (
    <div className="card">
      <h3 className="text-brand-lightAccent font-semibold mb-4 font-heading text-sm uppercase tracking-wide">
        Resumen calculado
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="p-3 rounded-lg bg-brand-dark/40">
          <span className="text-brand-mutedText text-xs">IMC</span>
          <p className="text-brand-primaryText font-bold text-lg mt-1">
            {imc !== null ? imc : '—'}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-brand-dark/40">
          <span className="text-brand-mutedText text-xs">TMB</span>
          <p className="text-brand-primaryText font-bold text-lg mt-1">
            {tmb !== null ? `${tmb}` : '—'}
          </p>
          <p className="text-[10px] text-brand-mutedText">kcal/día</p>
        </div>
        <div className="p-3 rounded-lg bg-brand-dark/40">
          <span className="text-brand-mutedText text-xs">kcal/día</span>
          <p className="text-brand-primaryText font-bold text-lg mt-1">
            {tdee !== null ? `${tdee}` : '—'}
          </p>
          <p className="text-[10px] text-brand-mutedText">según actividad</p>
        </div>
        <div className="p-3 rounded-lg bg-brand-dark/40">
          <span className="text-brand-mutedText text-xs">Edad</span>
          <p className="text-brand-primaryText font-bold text-lg mt-1">
            {edad !== null ? `${edad}` : '—'}
          </p>
          <p className="text-[10px] text-brand-mutedText">años</p>
        </div>
      </div>
    </div>
  )
}
