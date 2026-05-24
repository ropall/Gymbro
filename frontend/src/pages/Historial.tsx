import { useState } from 'react'
import { SessionList } from '../components/history/SessionList'
import { ExerciseProgress } from '../components/history/ExerciseProgress'

export function Historial() {
  const [activeTab, setActiveTab] = useState<'sesiones' | 'progreso'>('sesiones')

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-brand-primaryText font-heading">Historial</h2>
        <p className="text-brand-mutedText text-sm">Revisa tus sesiones y progreso</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('sesiones')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
            activeTab === 'sesiones'
              ? 'bg-brand-accent text-white'
              : 'bg-brand-card text-brand-mutedText border border-brand-border'
          }`}
        >
          Sesiones
        </button>
        <button
          onClick={() => setActiveTab('progreso')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
            activeTab === 'progreso'
              ? 'bg-brand-accent text-white'
              : 'bg-brand-card text-brand-mutedText border border-brand-border'
          }`}
        >
          Progreso
        </button>
      </div>

      {/* Content */}
      {activeTab === 'sesiones' && <SessionList />}
      {activeTab === 'progreso' && <ExerciseProgress />}
    </div>
  )
}
