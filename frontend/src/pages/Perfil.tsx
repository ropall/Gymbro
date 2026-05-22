import { useState } from 'react'
import { useMetricsStore } from '../stores/metricsStore'
import { MetricsCard } from '../components/profile/MetricsCard'
import { WeightSection } from '../components/profile/WeightSection'
import { MeasurementsSection } from '../components/profile/MeasurementsSection'
import { PhotosSection } from '../components/profile/PhotosSection'
import { PostRegistrationForm } from '../components/profile/PostRegistrationForm'

export function Perfil() {
  const profile = useMetricsStore((state) => state.profile)
  const [showForm, setShowForm] = useState(profile === null)

  const hasProfile = profile !== null

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-white mb-1 font-[Montserrat]">Perfil</h2>
      <p className="text-brand-mutedText mb-4">Tus métricas y progreso</p>

      <MetricsCard />

      <WeightSection />

      <MeasurementsSection />

      <PhotosSection />

      {!hasProfile && showForm && (
        <PostRegistrationForm onComplete={() => setShowForm(false)} />
      )}

      {!hasProfile && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 w-full bg-brand-accent text-white rounded px-4 py-3 font-medium min-h-[48px] active:bg-brand-lightAccent transition-colors"
        >
          Completar perfil
        </button>
      )}
    </div>
  )
}
