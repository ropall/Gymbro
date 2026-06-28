import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Block, BlockExercise, Cycle, SessionSet, Exercise } from '../types'

interface RoutineState {
  blocks: Block[]
  cycle: Cycle | null
  blockExercises: BlockExercise[]
  isLoading: boolean
  error: string | null
  showCycleSummary: boolean

  loadBlocksAndCycle: () => Promise<void>
  advancePosition: () => Promise<void>
  restDay: () => Promise<void>
  completeBlock: (params: { blockId: string; sets: Omit<SessionSet, 'id' | 'session_id'>[] }) => Promise<void>
  updateBlock: (blockId: string, updates: Partial<Pick<Block, 'nombre' | 'es_descanso'>>) => Promise<void>
  addBlockExercise: (blockId: string, exercise: Omit<BlockExercise, 'id' | 'block_id' | 'exercise'>) => Promise<void>
  removeBlockExercise: (blockExerciseId: string) => Promise<void>
  startNewCycle: () => Promise<void>
  canEditBlock: (posicion: number) => boolean
  reorderBlocks: (orderedBlockIds: string[]) => Promise<void>
  reset: () => void
}

const initialState = {
  blocks: [],
  cycle: null,
  blockExercises: [],
  isLoading: false,
  error: null,
  showCycleSummary: false,
}

function mapExerciseFromJoin(
  globalRow: any,
  userRow: any
): Exercise | null {
  if (globalRow) {
    return {
      id: globalRow.id,
      nombre: globalRow.nombre,
      grupoMuscular: globalRow.grupo_muscular ?? 'Cuerpo Completo',
      equipo: globalRow.equipo ?? 'Sin equipo',
      variaciones: globalRow.variaciones ?? null,
      isCustom: false,
      parentId: globalRow.parent_id ?? undefined,
    }
  }
  if (userRow) {
    return {
      id: userRow.id,
      nombre: userRow.nombre,
      grupoMuscular: userRow.grupo_muscular ?? 'Cuerpo Completo',
      equipo: userRow.equipo ?? 'Sin equipo',
      variaciones: null,
      isCustom: true,
      parentId: userRow.parent_id ?? undefined,
    }
  }
  return null
}

export const useRoutineStore = create<RoutineState>()((set, get) => ({
  ...initialState,

  loadBlocksAndCycle: async () => {
    set({ isLoading: true, error: null })

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay usuario autenticado')

      // Load blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('blocks')
        .select('id, profile_id, nombre, posicion, es_descanso, created_at')
        .eq('profile_id', userId)
        .order('posicion', { ascending: true })

      if (blocksError) throw blocksError

      const blocks: Block[] = (blocksData ?? []).map((b: any) => ({
        id: b.id,
        profile_id: b.profile_id,
        nombre: b.nombre,
        posicion: b.posicion,
        es_descanso: b.es_descanso,
        created_at: b.created_at,
      }))

      // Load active cycle
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id, profile_id, fecha_inicio, posicion_actual, activo, created_at')
        .eq('profile_id', userId)
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cycleError) throw cycleError

      let cycle: Cycle | null = null
      if (cycleData) {
        cycle = {
          id: cycleData.id,
          profile_id: cycleData.profile_id,
          fecha_inicio: cycleData.fecha_inicio,
          posicion_actual: cycleData.posicion_actual,
          activo: cycleData.activo,
          created_at: cycleData.created_at,
        }
      }

      // Load block exercises
      let blockExercises: BlockExercise[] = []
      if (blocks.length > 0) {
        const blockIds = blocks.map((b) => b.id)
        const { data: beData, error: beError } = await supabase
          .from('block_exercises')
          .select('id, block_id, global_exercise_id, user_exercise_id, series_objetivo, reps_objetivo_min, reps_objetivo_max, rpe_objetivo, descanso_segundos')
          .in('block_id', blockIds)

        if (beError) throw beError

        const globalIds = (beData ?? [])
          .map((be: any) => be.global_exercise_id)
          .filter(Boolean)
        const userIds = (beData ?? [])
          .map((be: any) => be.user_exercise_id)
          .filter(Boolean)

        let globalMap = new Map<string, any>()
        let userMap = new Map<string, any>()

        if (globalIds.length > 0) {
          const { data: gData } = await supabase
            .from('global_exercises')
            .select('id, nombre, grupo_muscular, equipo, variaciones, parent_id')
            .in('id', globalIds)
          ;(gData ?? []).forEach((g: any) => globalMap.set(g.id, g))
        }

        if (userIds.length > 0) {
          const { data: uData } = await supabase
            .from('user_exercises')
            .select('id, nombre, grupo_muscular, equipo, parent_id')
            .in('id', userIds)
          ;(uData ?? []).forEach((u: any) => userMap.set(u.id, u))
        }

        blockExercises = (beData ?? []).map((be: any) => {
          const exercise = mapExerciseFromJoin(
            be.global_exercise_id ? globalMap.get(be.global_exercise_id) : null,
            be.user_exercise_id ? userMap.get(be.user_exercise_id) : null
          )
          return {
            id: be.id,
            block_id: be.block_id,
            global_exercise_id: be.global_exercise_id,
            user_exercise_id: be.user_exercise_id,
            series_objetivo: be.series_objetivo,
            reps_objetivo_min: be.reps_objetivo_min,
            reps_objetivo_max: be.reps_objetivo_max,
            rpe_objetivo: be.rpe_objetivo,
            descanso_segundos: be.descanso_segundos,
            exercise: exercise ?? undefined,
          }
        })
      }

      set({
        blocks,
        cycle,
        blockExercises,
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.message ?? 'Error cargando rutina', isLoading: false })
    }
  },

  advancePosition: async () => {
    const cycle = get().cycle
    if (!cycle || !cycle.activo) return

    const nextPos = cycle.posicion_actual + 1

    if (nextPos > 7) {
      // End of cycle: pause and show summary
      try {
        const { error } = await supabase
          .from('cycles')
          .update({ activo: false, posicion_actual: 7 })
          .eq('id', cycle.id)

        if (error) throw error

        set({
          cycle: { ...cycle, activo: false },
          showCycleSummary: true,
        })
      } catch (err: any) {
        set({ error: err.message ?? 'Error avanzando ciclo' })
      }
      return
    }

    try {
      const { error } = await supabase
        .from('cycles')
        .update({ posicion_actual: nextPos })
        .eq('id', cycle.id)

      if (error) throw error

      set({ cycle: { ...cycle, posicion_actual: nextPos } })
    } catch (err: any) {
      set({ error: err.message ?? 'Error avanzando ciclo' })
    }
  },

  restDay: async () => {
    await get().advancePosition()
  },

  completeBlock: async ({ blockId, sets }) => {
    const cycle = get().cycle
    if (!cycle || !cycle.activo) throw new Error('No hay ciclo activo')

    try {
      // Create immutable session snapshot
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          cycle_id: cycle.id,
          block_id: blockId,
        })
        .select('id')
        .single()

      if (sessionError) throw sessionError

      // Get current block exercises for snapshot data
      const blockExercises = get().blockExercises

      if (sets.length > 0) {
        const inserts = sets.map((s, idx) => {
          const be = blockExercises.find((e) => e.id === s.block_exercise_id)
          return {
            session_id: sessionData.id,
            block_exercise_id: s.block_exercise_id,
            peso: s.peso,
            reps_reales: s.reps_reales,
            rpe_real: s.rpe_real,
            orden_serie: idx + 1,
            snapshot_nombre: be?.exercise?.nombre ?? null,
            snapshot_grupo_muscular: be?.exercise?.grupoMuscular ?? null,
            snapshot_series_objetivo: be?.series_objetivo ?? null,
            snapshot_reps_objetivo_min: be?.reps_objetivo_min ?? null,
            snapshot_reps_objetivo_max: be?.reps_objetivo_max ?? null,
            snapshot_rpe_objetivo: be?.rpe_objetivo ?? null,
            snapshot_descanso_segundos: be?.descanso_segundos ?? null,
          }
        })

        const { error: setsError } = await supabase.from('session_sets').insert(inserts)
        if (setsError) throw setsError
      }

      await get().advancePosition()
    } catch (err: any) {
      set({ error: err.message ?? 'Error completando bloque' })
      throw err
    }
  },

  updateBlock: async (blockId, updates) => {
    const { blocks, cycle } = get()
    const block = blocks.find((b) => b.id === blockId)
    if (!block) throw new Error('Bloque no encontrado')
    if (!cycle || !cycle.activo) {
      // If cycle is paused, any block can be edited
    } else if (block.posicion <= cycle.posicion_actual) {
      throw new Error('No se puede editar un bloque ya completado o actual')
    }

    try {
      const { error } = await supabase
        .from('blocks')
        .update({
          nombre: updates.nombre,
          es_descanso: updates.es_descanso,
        })
        .eq('id', blockId)

      if (error) throw error

      set({
        blocks: blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
      })
    } catch (err: any) {
      set({ error: err.message ?? 'Error actualizando bloque' })
      throw err
    }
  },

  addBlockExercise: async (blockId, exercise) => {
    const { blocks, cycle } = get()
    const block = blocks.find((b) => b.id === blockId)
    if (!block) throw new Error('Bloque no encontrado')
    if (cycle?.activo && block.posicion <= (cycle?.posicion_actual ?? 0)) {
      throw new Error('No se puede editar un bloque ya completado o actual')
    }

    try {
      const { data, error } = await supabase
        .from('block_exercises')
        .insert({
          block_id: blockId,
          global_exercise_id: exercise.global_exercise_id,
          user_exercise_id: exercise.user_exercise_id,
          series_objetivo: exercise.series_objetivo,
          reps_objetivo_min: exercise.reps_objetivo_min,
          reps_objetivo_max: exercise.reps_objetivo_max,
          rpe_objetivo: exercise.rpe_objetivo,
          descanso_segundos: exercise.descanso_segundos,
        })
        .select('id')
        .single()

      if (error) throw error

      const newBe: BlockExercise = {
        ...exercise,
        id: data.id,
        block_id: blockId,
      }

      set({
        blockExercises: [...get().blockExercises, newBe],
      })
    } catch (err: any) {
      set({ error: err.message ?? 'Error agregando ejercicio' })
      throw err
    }
  },

  removeBlockExercise: async (blockExerciseId) => {
    const { blockExercises, blocks, cycle } = get()
    const be = blockExercises.find((e) => e.id === blockExerciseId)
    if (!be) throw new Error('Ejercicio no encontrado')

    const block = blocks.find((b) => b.id === be.block_id)
    if (cycle?.activo && block && block.posicion <= (cycle?.posicion_actual ?? 0)) {
      throw new Error('No se puede editar un bloque ya completado o actual')
    }

    try {
      const { error } = await supabase
        .from('block_exercises')
        .delete()
        .eq('id', blockExerciseId)

      if (error) throw error

      set({
        blockExercises: blockExercises.filter((e) => e.id !== blockExerciseId),
      })
    } catch (err: any) {
      set({ error: err.message ?? 'Error eliminando ejercicio' })
      throw err
    }
  },

  startNewCycle: async () => {
    const { cycle } = get()

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay usuario autenticado')

      // Deactivate the previous cycle if there is one (when starting a new cycle
      // right after finishing one, there may be no active cycle in memory).
      if (cycle) {
        await supabase.from('cycles').update({ activo: false }).eq('id', cycle.id)
      }

      // Create new cycle
      const { data: newCycleData, error: newCycleError } = await supabase
        .from('cycles')
        .insert({
          profile_id: userId,
          posicion_actual: 1,
          activo: true,
        })
        .select('id, profile_id, fecha_inicio, posicion_actual, activo, created_at')
        .single()

      if (newCycleError) throw newCycleError

      const newCycle: Cycle = {
        id: newCycleData.id,
        profile_id: newCycleData.profile_id,
        fecha_inicio: newCycleData.fecha_inicio,
        posicion_actual: newCycleData.posicion_actual,
        activo: newCycleData.activo,
        created_at: newCycleData.created_at,
      }

      set({ cycle: newCycle, showCycleSummary: false })
    } catch (err: any) {
      set({ error: err.message ?? 'Error iniciando ciclo' })
    }
  },

  canEditBlock: (posicion) => {
    const { cycle } = get()
    if (!cycle) return true
    if (!cycle.activo) return true // paused between cycles
    return posicion > cycle.posicion_actual
  },

  reorderBlocks: async (orderedBlockIds) => {
    const { blocks } = get()
    if (orderedBlockIds.length !== blocks.length) {
      throw new Error('Lista de bloques incompleta')
    }
    set({ error: null })

    // Optimistically update local state first
    const reorderedBlocks = orderedBlockIds
      .map((id) => blocks.find((b) => b.id === id)!)
      .map((b, i) => ({ ...b, posicion: i + 1 }))

    set({ blocks: reorderedBlocks })

    // Use atomic PostgreSQL RPC function to avoid UNIQUE/CHECK constraint violations
    try {
      const { error } = await supabase.rpc('reorder_blocks', {
        block_ids: orderedBlockIds,
      })

      if (error) throw error
    } catch (err: any) {
      set({ blocks, error: err.message ?? 'Error reordenando bloques' })
      throw new Error(err.message ?? 'Error reordenando bloques')
    }
  },

  reset: () => set(initialState),
}))
