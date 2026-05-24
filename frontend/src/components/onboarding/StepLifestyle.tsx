import { useOnboardingProfileStore } from '../../stores/onboardingProfileStore'
import type { ObjetivoPrincipal, Cronotipo, SplitPreferido } from '../../types'
import { OBJETIVO_LABELS, CRONOTIPO_LABELS, SPLIT_LABELS } from '../../types'

export function StepLifestyle() {
  const { data, updateData } = useOnboardingProfileStore()

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-brand-mutedText text-sm">
          Personalicemos tu experiencia
        </p>
      </div>

      <div>
        <label className="block text-xs text-brand-mutedText mb-2">
          Objetivo principal
        </label>
        <div className="space-y-2">
          {(Object.entries(OBJETIVO_LABELS) as [ObjetivoPrincipal, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => updateData({ objetivoPrincipal: key })}
              className={`w-full text-left py-3 px-4 rounded-xl font-medium text-sm transition-colors ${
                data.objetivoPrincipal === key
                  ? 'bg-brand-lightAccent text-brand-inverseText'
                  : 'bg-brand-card border border-brand-border text-brand-mutedText hover:border-brand-lightAccent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-brand-mutedText mb-2">
          ¿Eres más activo por la mañana o por la noche?
        </label>
        <div className="flex gap-3">
          {(Object.entries(CRONOTIPO_LABELS) as [Cronotipo, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => updateData({ cronotipo: key })}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
                data.cronotipo === key
                  ? 'bg-brand-lightAccent text-brand-inverseText'
                  : 'bg-brand-card border border-brand-border text-brand-mutedText hover:border-brand-lightAccent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-brand-mutedText mb-2">
          Split preferido
        </label>
        <div className="space-y-2">
          {(Object.entries(SPLIT_LABELS) as [SplitPreferido, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => updateData({ splitPreferido: key })}
              className={`w-full text-left py-3 px-4 rounded-xl font-medium text-sm transition-colors ${
                data.splitPreferido === key
                  ? 'bg-brand-lightAccent text-brand-inverseText'
                  : 'bg-brand-card border border-brand-border text-brand-mutedText hover:border-brand-lightAccent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
