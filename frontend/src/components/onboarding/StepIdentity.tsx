import { useOnboardingProfileStore } from '../../stores/onboardingProfileStore'
import { todayISO } from '../../utils/calculations'

export function StepIdentity() {
  const { data, updateData } = useOnboardingProfileStore()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateData({ fotoPerfil: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-brand-mutedText text-sm">
          ¡Bienvenido, Gymbro! Vamos a configurar tu perfil.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {data.fotoPerfil ? (
            <img
              src={data.fotoPerfil}
              alt="Foto de perfil"
              className="w-24 h-24 rounded-full object-cover border-2 border-brand-lightAccent"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-brand-card border-2 border-brand-border flex items-center justify-center text-3xl text-brand-mutedText">
              {data.fullName?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-lightAccent rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90">
            <svg className="w-4 h-4 text-brand-inverseText" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-xs text-brand-mutedText">Foto de perfil (opcional)</p>
      </div>

      <div>
        <label className="block text-xs text-brand-mutedText mb-1">Nombre o Alias</label>
        <input
          type="text"
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          placeholder="¿Cómo te llamamos?"
          className="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-brand-lightText placeholder:text-brand-mutedText focus:outline-none focus:border-brand-lightAccent transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-brand-mutedText mb-1">Fecha de nacimiento</label>
        <input
          type="date"
          value={data.fechaNacimiento}
          max={todayISO()}
          onChange={(e) => updateData({ fechaNacimiento: e.target.value })}
          className="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-brand-lightText focus:outline-none focus:border-brand-lightAccent transition-colors"
        />
      </div>
    </div>
  )
}
