import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { NutritionMenu, NutritionMeal } from '../types'

interface NutritionState {
  menus: NutritionMenu[]
  isLoading: boolean
  error: string | null

  loadMenus: () => Promise<void>
  createMenu: (nombre: string) => Promise<void>
  updateMenu: (id: string, updates: Partial<Pick<NutritionMenu, 'nombre' | 'calorias' | 'proteinas' | 'carbohidratos' | 'grasas' | 'presupuesto'>>) => Promise<void>
  deleteMenu: (id: string) => Promise<void>

  addMeal: (menuId: string, meal: { nombre_comida: string; descripcion: string }) => Promise<void>
  updateMeal: (id: string, updates: { nombre_comida?: string; descripcion?: string }) => Promise<void>
  reorderMeal: (id: string, newOrden: number) => Promise<void>
  deleteMeal: (id: string) => Promise<void>
  reset: () => void
}

const initialState = {
  menus: [],
  isLoading: false,
  error: null,
}

export const useNutritionStore = create<NutritionState>()((set, get) => ({
  ...initialState,

  loadMenus: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) {
        set({ isLoading: false })
        return
      }

      const { data: menusData, error: menusError } = await supabase
        .from('nutrition_menus')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: true })

      if (menusError) throw menusError

      const menuIds = (menusData ?? []).map((m: any) => m.id)

      const mealsMap: Record<string, NutritionMeal[]> = {}
      if (menuIds.length > 0) {
        const { data: mealsData, error: mealsError } = await supabase
          .from('nutrition_meals')
          .select('*')
          .in('menu_id', menuIds)
          .order('orden', { ascending: true })

        if (mealsError) throw mealsError

        for (const meal of (mealsData ?? [])) {
          if (!mealsMap[meal.menu_id]) mealsMap[meal.menu_id] = []
          mealsMap[meal.menu_id].push(meal)
        }
      }

      const menus: NutritionMenu[] = (menusData ?? []).map((m: any) => ({
        id: m.id,
        profile_id: m.profile_id,
        nombre: m.nombre,
        calorias: m.calorias,
        proteinas: m.proteinas,
        carbohidratos: m.carbohidratos,
        grasas: m.grasas,
        presupuesto: m.presupuesto,
        created_at: m.created_at,
        meals: mealsMap[m.id] ?? [],
      }))

      set({ menus, isLoading: false })
    } catch (err: any) {
      set({ error: err.message ?? 'Error cargando menús', isLoading: false })
    }
  },

  createMenu: async (nombre) => {
    set({ isLoading: true, error: null })
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay usuario autenticado')

      const { data, error } = await supabase
        .from('nutrition_menus')
        .insert({ profile_id: userId, nombre })
        .select('*')
        .single()

      if (error) throw error

      const newMenu: NutritionMenu = {
        id: data.id,
        profile_id: data.profile_id,
        nombre: data.nombre,
        calorias: data.calorias,
        proteinas: data.proteinas,
        carbohidratos: data.carbohidratos,
        grasas: data.grasas,
        presupuesto: data.presupuesto,
        created_at: data.created_at,
        meals: [],
      }

      set((state) => ({ menus: [...state.menus, newMenu], isLoading: false }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error creando menú', isLoading: false })
    }
  },

  updateMenu: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('nutrition_menus')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        menus: state.menus.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error actualizando menú', isLoading: false })
    }
  },

  deleteMenu: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('nutrition_menus')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        menus: state.menus.filter((m) => m.id !== id),
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error eliminando menú', isLoading: false })
    }
  },

  addMeal: async (menuId, meal) => {
    set({ error: null })
    try {
      const menu = get().menus.find((m) => m.id === menuId)
      const nextOrden = (menu?.meals.length ?? 0) + 1

      const { data, error } = await supabase
        .from('nutrition_meals')
        .insert({ menu_id: menuId, ...meal, orden: nextOrden })
        .select('*')
        .single()

      if (error) throw error

      set((state) => ({
        menus: state.menus.map((m) =>
          m.id === menuId
            ? { ...m, meals: [...m.meals, data].sort((a, b) => a.orden - b.orden) }
            : m
        ),
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error agregando comida', isLoading: false })
    }
  },

  updateMeal: async (id, updates) => {
    set({ error: null })
    try {
      const { error } = await supabase
        .from('nutrition_meals')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        menus: state.menus.map((m) => ({
          ...m,
          meals: m.meals.map((meal) =>
            meal.id === id ? { ...meal, ...updates } : meal
          ),
        })),
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error actualizando comida', isLoading: false })
    }
  },

  reorderMeal: async (id, newOrden) => {
    set({ error: null })
    try {
      const { error } = await supabase
        .from('nutrition_meals')
        .update({ orden: newOrden })
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        menus: state.menus.map((m) => ({
          ...m,
          meals: m.meals
            .map((meal) => (meal.id === id ? { ...meal, orden: newOrden } : meal))
            .sort((a, b) => a.orden - b.orden),
        })),
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error reordenando comida', isLoading: false })
    }
  },

  deleteMeal: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('nutrition_meals')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        menus: state.menus.map((m) => ({
          ...m,
          meals: m.meals.filter((meal) => meal.id !== id),
        })),
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message ?? 'Error eliminando comida', isLoading: false })
    }
  },

  reset: () => {
    set(initialState)
  },
}))
