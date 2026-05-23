import { useState, useEffect } from 'react'
import { useMetricsStore } from '../stores/metricsStore'
import { useAuthStore } from '../stores/authStore'
import { MetricsCard } from '../components/profile/MetricsCard'
import { WeightSection } from '../components/profile/WeightSection'
import { MeasurementsSection } from '../components/profile/MeasurementsSection'
import { PhotosSection } from '../components/profile/PhotosSection'
import { PostRegistrationForm } from '../components/profile/PostRegistrationForm'

export function Perfil() {
  const profile = useMetricsStore((state) => state.profile)
  const user = useAuthStore((state) => state.user)
  const isLoading = useMetricsStore((state) => state.isLoading)
  const error = useMetricsStore((state) => state.error)
  const loadData = useMetricsStore((state) => state.loadData)
  const weightEntries = useMetricsStore((state) => state.weightEntries)
  const measurementEntries = useMetricsStore((state) => state.measurementEntries)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // Only load if store is empty to avoid overwriting test data
    const hasData = profile !== null || weightEntries.length > 0 || measurementEntries.length > 0
    if (!hasData) {
      loadData()
    }
  }, [loadData, profile, weightEntries.length, measurementEntries.length])

  useEffect(() => {
    setShowForm(profile === null)
  }, [profile])

  const hasProfile = profile !== null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
          Cargando perfil...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-[Montserrat]">Perfil</h2>
          <p className="text-brand-mutedText text-sm">Tus métricas y progreso</p>
        </div>
        {user?.email && (
          <div className="text-right">
            <p className="text-xs text-brand-mutedText">{user.email}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

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
