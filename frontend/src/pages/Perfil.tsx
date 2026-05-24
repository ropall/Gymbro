import { useEffect, useRef } from 'react'
import { useMetricsStore } from '../stores/metricsStore'
import { useAuthStore } from '../stores/authStore'
import { EditableField } from '../components/profile/EditableField'
import { MetricsCard } from '../components/profile/MetricsCard'
import { WeightSection } from '../components/profile/WeightSection'
import { MeasurementsSection } from '../components/profile/MeasurementsSection'
import { PhotosSection } from '../components/profile/PhotosSection'
import { todayISO, calculateEdad } from '../utils/calculations'
import type {
  Sexo,
  NivelActividad,
  ObjetivoPrincipal,
  Cronotipo,
  SplitPreferido,
} from '../types'
import {
  NIVEL_ACTIVIDAD_LABELS,
  OBJETIVO_LABELS,
  CRONOTIPO_LABELS,
  SPLIT_LABELS,
} from '../types'

function labelKey<K extends string>(
  labels: Record<K, string>,
  value: K | null | undefined
): string {
  if (!value) return '—'
  return labels[value] || value
}

export function Perfil() {
  const profile = useMetricsStore((state) => state.profile)
  const updateProfile = useMetricsStore((state) => state.updateProfile)
  const user = useAuthStore((state) => state.user)
  const isLoading = useMetricsStore((state) => state.isLoading)
  const error = useMetricsStore((state) => state.error)
  const loadData = useMetricsStore((state) => state.loadData)
  const completeOnboarding = useMetricsStore((state) => state.completeOnboarding)
  const weightEntries = useMetricsStore((state) => state.weightEntries)
  const measurementEntries = useMetricsStore((state) => state.measurementEntries)
  const latestWeight = useMetricsStore((state) => state.getLatestWeight())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const hasData = profile !== null || weightEntries.length > 0 || measurementEntries.length > 0
    if (!hasData) {
      loadData()
    }
  }, [loadData, profile, weightEntries.length, measurementEntries.length])

  const hasProfile = profile !== null
  const hasOnboarding = hasProfile && profile.onboardingCompletado
  const edad = hasProfile ? calculateEdad(profile.fechaNacimiento) : null

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateProfile({ fotoPerfil: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleBootstrap = async () => {
    if (!hasProfile && user) {
      await completeOnboarding({
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        fechaNacimiento: todayISO(),
        sexo: 'masculino',
        altura: 170,
        pesoObjetivo: null,
        nivelActividad: 'moderado',
        objetivoPrincipal: 'hipertrofia',
        nivelExperiencia: null,
        cronotipo: 'alondra',
        splitPreferido: 'PPL',
        diasDisponibles: null,
        nivelEnergia: null,
        somatotipo: null,
        horarioSueno: null,
        fotoPerfil: null,
      })
    }
  }

  if (isLoading && !hasProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
          Cargando perfil...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-3xl mx-auto space-y-5">
      {error && (
        <div className="card bg-brand-dangerBg border-brand-dangerBorder text-brand-danger text-sm">
          {error}
        </div>
      )}

      {/* Profile Header */}
      {!hasOnboarding ? (
        <div className="card text-center">
          <p className="text-brand-mutedText text-sm mb-4">
            Aún no has completado tu perfil.
          </p>
          <button onClick={handleBootstrap} className="btn-primary">
            Completar perfil ahora
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              {profile.fotoPerfil ? (
                <img
                  src={profile.fotoPerfil}
                  alt="Foto de perfil"
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-lightAccent"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-card border-2 border-brand-border flex items-center justify-center text-2xl text-brand-mutedText font-bold">
                  {(profile.fullName?.[0] || user?.email?.[0] || '?').toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-brand-lightAccent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                title="Cambiar foto"
              >
                <svg className="w-3.5 h-3.5 text-brand-inverseText" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 min-w-0">
              <EditableField
                label="Nombre"
                value={profile.fullName || user?.email?.split('@')[0] || ''}
                onSave={(v) => updateProfile({ fullName: v })}
              />
              {user?.email && (
                <p className="text-xs text-brand-mutedText mt-0.5 truncate">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Metrics Card with editable fields */}
          <div className="card">
            <h3 className="text-brand-lightAccent font-semibold mb-4 font-heading text-sm uppercase tracking-wide">
              Métricas básicas
            </h3>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
              <EditableField
                label="Sexo"
                value={profile.sexo === 'masculino' ? 'Masculino' : 'Femenino'}
                type="select"
                options={[
                  { value: 'masculino', label: 'Masculino' },
                  { value: 'femenino', label: 'Femenino' },
                ]}
                onSave={(v) => updateProfile({ sexo: v as Sexo })}
              />

              <div>
                <span className="text-brand-mutedText text-xs">Edad</span>
                <p className="text-brand-primaryText font-medium text-sm mt-0.5">
                  {edad !== null ? `${edad} años` : '—'}
                </p>
              </div>

              <EditableField
                label="Altura"
                value={profile.altura}
                type="number"
                suffix="cm"
                onSave={(v) => updateProfile({ altura: parseFloat(v) })}
              />

              <EditableField
                label="Fecha nacimiento"
                value={profile.fechaNacimiento}
                type="date"
                onSave={(v) => updateProfile({ fechaNacimiento: v })}
              />

              <div>
                <span className="text-brand-mutedText text-xs">Peso actual</span>
                <p className="text-brand-primaryText font-medium text-sm mt-0.5">
                  {latestWeight ? `${latestWeight.peso} kg` : '—'}
                </p>
              </div>

              <EditableField
                label="Peso objetivo"
                value={profile.pesoObjetivo}
                type="number"
                suffix="kg"
                onSave={(v) => updateProfile({ pesoObjetivo: parseFloat(v) || null })}
              />
            </div>
          </div>

          {/* Training Profile */}
          <div className="card">
            <h3 className="text-brand-lightAccent font-semibold mb-4 font-heading text-sm uppercase tracking-wide">
              Perfil de entrenamiento
            </h3>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
              <EditableField
                label="Objetivo"
                value={labelKey(OBJETIVO_LABELS, profile.objetivoPrincipal)}
                type="select"
                options={Object.entries(OBJETIVO_LABELS).map(([k, v]) => ({
                  value: k,
                  label: v,
                }))}
                onSave={(v) => updateProfile({ objetivoPrincipal: v as ObjetivoPrincipal })}
              />

              <EditableField
                label="Nivel de actividad"
                value={labelKey(NIVEL_ACTIVIDAD_LABELS, profile.nivelActividad)}
                type="select"
                options={Object.entries(NIVEL_ACTIVIDAD_LABELS).map(([k, v]) => ({
                  value: k,
                  label: v,
                }))}
                onSave={(v) => updateProfile({ nivelActividad: v as NivelActividad })}
              />

              <EditableField
                label="Split preferido"
                value={labelKey(SPLIT_LABELS, profile.splitPreferido)}
                type="select"
                options={Object.entries(SPLIT_LABELS).map(([k, v]) => ({
                  value: k,
                  label: v,
                }))}
                onSave={(v) => updateProfile({ splitPreferido: v as SplitPreferido })}
              />

              <EditableField
                label="Cronotipo"
                value={labelKey(CRONOTIPO_LABELS, profile.cronotipo)}
                type="select"
                options={Object.entries(CRONOTIPO_LABELS).map(([k, v]) => ({
                  value: k,
                  label: v,
                }))}
                onSave={(v) => updateProfile({ cronotipo: v as Cronotipo })}
              />
            </div>
          </div>
        </>
      )}

      <MetricsCard />

      <WeightSection />

      <MeasurementsSection />

      <PhotosSection />
    </div>
  )
}
