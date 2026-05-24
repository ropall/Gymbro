import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Profile, WeightEntry, MeasurementEntry, ProgressPhoto, Sexo } from '../types'

interface MetricsState {
  profile: Profile | null
  weightEntries: WeightEntry[]
  measurementEntries: MeasurementEntry[]
  photoEntries: ProgressPhoto[]
  isLoading: boolean
  error: string | null

  // Actions
  loadData: () => Promise<void>
  setProfile: (profile: Profile) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  completeOnboarding: (profile: Partial<Profile>, pesoInicial?: number) => Promise<void>
  addWeight: (peso: number, fecha?: string) => Promise<void>
  removeWeight: (id: string) => Promise<void>
  addMeasurement: (tipo: MeasurementEntry['tipo'], valor: number, fecha?: string) => Promise<void>
  removeMeasurement: (id: string) => Promise<void>
  addPhoto: (url: string, fecha?: string) => Promise<void>
  removePhoto: (id: string) => Promise<void>
  getLatestWeight: () => WeightEntry | undefined
  getMeasurementsByType: (tipo: MeasurementEntry['tipo']) => MeasurementEntry[]
  reset: () => void
}

function mapProfileFromDB(row: any): Profile {
  return {
    fullName: row.full_name ?? null,
    sexo: row.sexo as Sexo,
    altura: row.altura,
    fechaNacimiento: row.fecha_nacimiento,
    pesoObjetivo: row.peso_objetivo ?? null,
    nivelActividad: row.nivel_actividad ?? null,
    objetivoPrincipal: row.objetivo_principal ?? null,
    nivelExperiencia: row.nivel_experiencia ?? null,
    cronotipo: row.cronotipo ?? null,
    splitPreferido: row.split_preferido ?? null,
    diasDisponibles: row.dias_disponibles ?? null,
    nivelEnergia: row.nivel_energia ?? null,
    somatotipo: row.somatotipo ?? null,
    horarioSueno: row.horario_sueno ?? null,
    fotoPerfil: row.foto_perfil ?? null,
    onboardingCompletado: row.onboarding_completado ?? false,
  }
}

function mapProfileToDB(profile: Partial<Profile>): any {
  const db: any = {}
  if (profile.fullName !== undefined) db.full_name = profile.fullName
  if (profile.sexo !== undefined) db.sexo = profile.sexo
  if (profile.altura !== undefined) db.altura = profile.altura
  if (profile.fechaNacimiento !== undefined) db.fecha_nacimiento = profile.fechaNacimiento
  if (profile.pesoObjetivo !== undefined) db.peso_objetivo = profile.pesoObjetivo
  if (profile.nivelActividad !== undefined) db.nivel_actividad = profile.nivelActividad
  if (profile.objetivoPrincipal !== undefined) db.objetivo_principal = profile.objetivoPrincipal
  if (profile.nivelExperiencia !== undefined) db.nivel_experiencia = profile.nivelExperiencia
  if (profile.cronotipo !== undefined) db.cronotipo = profile.cronotipo
  if (profile.splitPreferido !== undefined) db.split_preferido = profile.splitPreferido
  if (profile.diasDisponibles !== undefined) db.dias_disponibles = profile.diasDisponibles
  if (profile.nivelEnergia !== undefined) db.nivel_energia = profile.nivelEnergia
  if (profile.somatotipo !== undefined) db.somatotipo = profile.somatotipo
  if (profile.horarioSueno !== undefined) db.horario_sueno = profile.horarioSueno
  if (profile.fotoPerfil !== undefined) db.foto_perfil = profile.fotoPerfil
  if (profile.onboardingCompletado !== undefined) db.onboarding_completado = profile.onboardingCompletado
  return db
}

const initialState = {
  profile: null,
  weightEntries: [],
  measurementEntries: [],
  photoEntries: [],
  isLoading: false,
  error: null,
}

function mapWeightFromDB(row: any): WeightEntry {
  return {
    id: row.id,
    peso: parseFloat(row.peso),
    fecha: row.fecha,
  }
}

function mapMeasurementFromDB(row: any): MeasurementEntry {
  return {
    id: row.id,
    tipo: row.tipo,
    valor: parseFloat(row.valor),
    fecha: row.fecha,
  }
}

export const useMetricsStore = create<MetricsState>()((set, get) => ({
  ...initialState,

  loadData: async () => {
    set({ isLoading: true, error: null })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) {
        set({ isLoading: false })
        return
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      const profile = profileData
        ? mapProfileFromDB(profileData)
        : null

      // Load weight history
      const { data: weightData, error: weightError } = await supabase
        .from('weight_history')
        .select('id, peso, fecha')
        .eq('profile_id', userId)
        .order('fecha', { ascending: true })

      if (weightError) throw weightError

      // Load measurement history
      const { data: measurementData, error: measurementError } = await supabase
        .from('measurement_history')
        .select('id, tipo, valor, fecha')
        .eq('profile_id', userId)
        .order('fecha', { ascending: true })

      if (measurementError) throw measurementError

      // Load photos (from localStorage fallback for now)
      const savedPhotos = localStorage.getItem('gymbro-photos')
      const photoEntries = savedPhotos ? JSON.parse(savedPhotos) : []

      set({
        profile,
        weightEntries: weightData?.map(mapWeightFromDB) ?? [],
        measurementEntries: measurementData?.map(mapMeasurementFromDB) ?? [],
        photoEntries,
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.message ?? 'Error cargando datos', isLoading: false })
    }
  },

  setProfile: async (profile) => {
    set({ isLoading: true, error: null })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay usuario autenticado')

      const { error } = await supabase
        .from('profiles')
        .update(mapProfileToDB(profile))
        .eq('id', userId)

      if (error) throw error

      set({ profile, isLoading: false })
    } catch (err: any) {
      set({ error: err.message ?? 'Error actualizando perfil', isLoading: false })
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay usuario autenticado')

      const { error } = await supabase
        .from('profiles')
        .update(mapProfileToDB(updates))
        .eq('id', userId)

      if (error) throw error

      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error actualizando perfil', isLoading: false })
    }
  },

  completeOnboarding: async (profileData, pesoInicial) => {
    set({ isLoading: true, error: null })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay usuario autenticado')

      const updates = mapProfileToDB({ ...profileData, onboardingCompletado: true })
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

      if (profileError) throw profileError

      if (pesoInicial !== undefined && pesoInicial > 0) {
        const today = new Date().toISOString().split('T')[0]
        const { error: weightError } = await supabase
          .from('weight_history')
          .insert({
            profile_id: userId,
            peso: pesoInicial,
            fecha: today,
          })

        if (weightError) throw weightError
      }

      const profile = profileData as Profile
      set({ profile: { ...profile, onboardingCompletado: true }, isLoading: false })
    } catch (err: any) {
      set({ error: err.message ?? 'Error completando onboarding', isLoading: false })
      throw err
    }
  },

  addWeight: async (peso, fecha) => {
    set({ isLoading: true, error: null })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay usuario autenticado')

      const targetDate = fecha ?? new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('weight_history')
        .insert({
          profile_id: userId,
          peso,
          fecha: targetDate,
        })
        .select('id, peso, fecha')
        .single()

      if (error) throw error

      const entry = mapWeightFromDB(data)
      set((state) => ({
        weightEntries: [...state.weightEntries, entry].sort((a, b) =>
          a.fecha.localeCompare(b.fecha)
        ),
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error registrando peso', isLoading: false })
    }
  },

  removeWeight: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase
        .from('weight_history')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        weightEntries: state.weightEntries.filter((e) => e.id !== id),
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error eliminando peso', isLoading: false })
    }
  },

  addMeasurement: async (tipo, valor, fecha) => {
    set({ isLoading: true, error: null })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay usuario autenticado')

      const targetDate = fecha ?? new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('measurement_history')
        .insert({
          profile_id: userId,
          tipo,
          valor,
          fecha: targetDate,
        })
        .select('id, tipo, valor, fecha')
        .single()

      if (error) throw error

      const entry = mapMeasurementFromDB(data)
      set((state) => ({
        measurementEntries: [...state.measurementEntries, entry].sort((a, b) =>
          a.fecha.localeCompare(b.fecha)
        ),
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error registrando medida', isLoading: false })
    }
  },

  removeMeasurement: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase
        .from('measurement_history')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        measurementEntries: state.measurementEntries.filter((e) => e.id !== id),
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error eliminando medida', isLoading: false })
    }
  },

  // Photos: keep in localStorage for now (TODO: Supabase Storage)
  addPhoto: async (url, fecha) => {
    const targetDate = fecha ?? new Date().toISOString().split('T')[0]
    const entry: ProgressPhoto = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url,
      fecha: targetDate,
    }

    set((state) => {
      const newEntries = [...state.photoEntries, entry].sort((a, b) =>
        a.fecha.localeCompare(b.fecha)
      )
      localStorage.setItem('gymbro-photos', JSON.stringify(newEntries))
      return { photoEntries: newEntries }
    })
  },

  removePhoto: async (id) => {
    set((state) => {
      const newEntries = state.photoEntries.filter((p) => p.id !== id)
      localStorage.setItem('gymbro-photos', JSON.stringify(newEntries))
      return { photoEntries: newEntries }
    })
  },

  getLatestWeight: () => {
    const entries = get().weightEntries
    return entries.length > 0 ? entries[entries.length - 1] : undefined
  },

  getMeasurementsByType: (tipo) => {
    return get().measurementEntries.filter((e) => e.tipo === tipo)
  },

  reset: () => {
    localStorage.removeItem('gymbro-photos')
    set(initialState)
  },
}))
