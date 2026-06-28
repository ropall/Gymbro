import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useRoutineStore } from '../stores/routineStore'
import { useHistoryStore } from '../stores/historyStore'
import { useMetricsStore } from '../stores/metricsStore'
import { supabase } from '../lib/supabase'
import { Dumbbell, TrendingUp, Calendar, ChevronRight, Zap, Timer, Trophy } from 'lucide-react'

export function Inicio() {
  const user = useAuthStore((state) => state.user)
  const isNewUser = useAuthStore((state) => state.isNewUser)
  const navigate = useNavigate()
  const [hasBlocks, setHasBlocks] = useState<boolean | null>(null)

  const blocks = useRoutineStore((state) => state.blocks)
  const cycle = useRoutineStore((state) => state.cycle)
  const blockExercises = useRoutineStore((state) => state.blockExercises)
  const loadBlocksAndCycle = useRoutineStore((state) => state.loadBlocksAndCycle)

  const sessions = useHistoryStore((state) => state.sessions)
  const loadSessions = useHistoryStore((state) => state.loadSessions)

  const profile = useMetricsStore((state) => state.profile)
  const latestWeight = useMetricsStore((state) => state.getLatestWeight())
  const loadMetricsData = useMetricsStore((state) => state.loadData)

  useEffect(() => {
    if (isNewUser) {
      navigate('/bienvenida', { replace: true })
      return
    }
    if (!user) return

    const checkBlocks = async () => {
      try {
        const { data, error } = await supabase.from('blocks').select('id').limit(1)
        if (error) {
          setHasBlocks(false)
          return
        }
        setHasBlocks((data && data.length > 0) ?? false)
      } catch {
        setHasBlocks(false)
      }
    }
    checkBlocks()
    loadBlocksAndCycle()
    loadSessions()
    loadMetricsData()
  }, [user, isNewUser, navigate, loadBlocksAndCycle, loadSessions, loadMetricsData])

  const currentPos = cycle?.posicion_actual ?? 1
  const currentBlock = blocks.find((b) => b.posicion === currentPos)
  const currentBlockExercises = currentBlock
    ? blockExercises.filter((e) => e.block_id === currentBlock.id)
    : []

  const totalTraining = blocks.filter((b) => !b.es_descanso).length
  const completedCount = blocks.filter((b) => !b.es_descanso && b.posicion < currentPos).length
  const progressPct = totalTraining > 0 ? Math.round((completedCount / totalTraining) * 100) : 0

  const recentSessions = sessions.slice(0, 3)
  const thisWeekSessions = sessions.filter((s) => {
    const d = new Date(s.fecha_completado)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    return diff < 7 * 24 * 60 * 60 * 1000
  })

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const userName = profile?.fullName || user?.email?.split('@')[0] || 'Atleta'

  if (hasBlocks === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-brand-lightAccent text-lg font-bold animate-pulse">Cargando...</div>
      </div>
    )
  }

  if (!hasBlocks) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-black text-brand-primaryText font-heading tracking-tight">
          Gymbro
        </h1>
        <p className="text-brand-mutedText mt-2">Bienvenido a tu app de entrenamiento</p>

        <div className="card mt-6 text-center">
          <div className="w-12 h-12 rounded-[10px] bg-brand-accent/20 flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-6 h-6 text-brand-lightAccent" />
          </div>
          <h2 className="text-lg font-bold text-brand-lightAccent mb-3">¡Bienvenido! Comencemos</h2>
          <div className="text-brand-mutedText text-sm mb-5 space-y-2 text-left">
            <p>
              <strong className="text-brand-primaryText">Gymbro</strong> es tu compañero de entrenamiento diseñado para ayudarte a construir músculo, perder grasa o ganar fuerza de forma estructurada y sin complicaciones.
            </p>
            <p>
              La app te guía paso a paso: crea tu rutina semanal personalizada, elige ejercicios de nuestro catálogo, registra cada serie con peso y repeticiones, y haz seguimiento de tu progreso con medidas, peso y fotos.
            </p>
            <p>
              Todo en un solo lugar. Sin hojas de Excel, sin adivinar qué toca hoy.
            </p>
          </div>
          <button onClick={() => navigate('/onboarding')} className="btn-primary w-full">
            Crear mi primera rutina
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-3xl mx-auto space-y-6">
      {/* Header greeting */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-brand-primaryText font-heading tracking-tight">
          {greeting()}, {userName}
        </h1>
        <p className="text-brand-mutedText text-sm mt-1">
          {thisWeekSessions.length > 0
            ? `Has completado ${thisWeekSessions.length} entrenamiento${thisWeekSessions.length !== 1 ? 's' : ''} esta semana`
            : 'Listo para entrenar hoy'}
        </p>
      </div>

      {/* Today's workout card */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-brand-accent/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-lightAccent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-primaryText font-heading">Hoy toca</h2>
              <p className="text-brand-mutedText text-xs">
                {!cycle?.activo
                  ? 'No tienes un ciclo activo'
                  : currentBlock
                    ? currentBlock.es_descanso
                      ? 'Día de descanso activo'
                      : `${currentBlockExercises.length} ejercicios`
                    : 'Sin rutina configurada'}
              </p>
            </div>
          </div>
          {!cycle?.activo ? (
            <button
              onClick={() => navigate('/rutinas')}
              className="btn-primary h-9 px-4 text-[13px]"
            >
              Iniciar ciclo
            </button>
          ) : currentBlock && !currentBlock.es_descanso ? (
            <button
              onClick={() => navigate(`/workout/${currentBlock.id}`)}
              className="btn-primary h-9 px-4 text-[13px]"
            >
              Entrenar
            </button>
          ) : currentBlock && currentBlock.es_descanso ? (
            <span className="badge bg-brand-accent/20 text-brand-lightAccent border border-brand-accent/30">
              Descanso
            </span>
          ) : null}
        </div>

        {cycle?.activo && currentBlock && !currentBlock.es_descanso && currentBlockExercises.length > 0 && (
          <div className="space-y-2">
            {currentBlockExercises.slice(0, 4).map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-brand-dark/50"
              >
                <span className="text-sm text-brand-primaryText font-medium">
                  {ex.exercise?.nombre ?? 'Ejercicio'}
                </span>
                <span className="text-xs text-brand-mutedText">
                  {ex.series_objetivo} series · {ex.reps_objetivo_min}-{ex.reps_objetivo_max} reps
                </span>
              </div>
            ))}
            {currentBlockExercises.length > 4 && (
              <p className="text-xs text-brand-mutedText text-center pt-1">
                +{currentBlockExercises.length - 4} ejercicios más
              </p>
            )}
          </div>
        )}

        {cycle?.activo && currentBlock && currentBlock.es_descanso && (
          <div className="py-4 text-center">
            <p className="text-brand-secondaryText text-sm">
              Tu cuerpo se recupera. Camina, estira o hidrátate.
            </p>
          </div>
        )}
      </div>

      {/* Weekly progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-brand-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-brand-lightAccent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-primaryText font-heading">
                Progreso semanal
              </h2>
              <p className="text-brand-mutedText text-xs">{completedCount} de {totalTraining} entrenamientos</p>
            </div>
          </div>
          <span className="text-sm font-bold text-brand-lightAccent">{progressPct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Week mini calendar */}
        <div className="grid grid-cols-7 gap-2 mt-4">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => {
            const blockForDay = blocks.find((b) => b.posicion === i + 1)
            const isDone = blockForDay && blockForDay.posicion < currentPos && !blockForDay.es_descanso
            const isToday = blockForDay && blockForDay.posicion === currentPos
            const isRest = blockForDay && blockForDay.es_descanso
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-brand-mutedText font-medium">{day}</span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isDone
                      ? 'bg-brand-accent text-white'
                      : isToday
                        ? 'bg-brand-lightAccent text-brand-inverseText ring-2 ring-brand-lightAccent/30'
                        : isRest
                          ? 'bg-brand-dark text-brand-mutedText'
                          : 'bg-brand-control text-brand-mutedText'
                  }`}
                >
                  {isDone ? '✓' : i + 1}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <Trophy className="w-5 h-5 text-brand-lightAccent mx-auto mb-2" />
          <p className="text-2xl font-black text-brand-primaryText font-heading">{sessions.length}</p>
          <p className="text-xs text-brand-mutedText">Entrenamientos totales</p>
        </div>
        <div className="card text-center">
          <Timer className="w-5 h-5 text-brand-lightAccent mx-auto mb-2" />
          <p className="text-2xl font-black text-brand-primaryText font-heading">{thisWeekSessions.length}</p>
          <p className="text-xs text-brand-mutedText">Esta semana</p>
        </div>
        <div className="card text-center col-span-2 md:col-span-1">
          <TrendingUp className="w-5 h-5 text-brand-lightAccent mx-auto mb-2" />
          <p className="text-2xl font-black text-brand-primaryText font-heading">
            {latestWeight ? `${latestWeight.peso}kg` : '—'}
          </p>
          <p className="text-xs text-brand-mutedText">Peso actual</p>
        </div>
      </div>

      {/* Recent history */}
      {recentSessions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-brand-lightAccent" />
              </div>
              <h2 className="text-sm font-bold text-brand-primaryText font-heading">
                Entrenamientos recientes
              </h2>
            </div>
            <button
              onClick={() => navigate('/historial')}
              className="btn-ghost text-xs h-8 px-2"
            >
              Ver todo
            </button>
          </div>
          <div className="space-y-1">
            {recentSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => navigate(`/historial/${session.id}`)}
                className="list-item flex items-center justify-between w-full text-left rounded-lg hover:bg-brand-dark/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-brand-primaryText">
                    {session.block_name || 'Entrenamiento'}
                  </p>
                  <p className="text-xs text-brand-mutedText">
                    {new Date(session.fecha_completado).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                    {' · '}
                    {session.exercise_count} ejercicios
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-mutedText shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
