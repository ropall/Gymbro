import { useEffect, useState } from 'react'
import { useNutritionStore } from '../stores/nutritionStore'
import { useAuthStore } from '../stores/authStore'
import { MenuCard } from '../components/nutrition/MenuCard'

export function Nutricion() {
  const menus = useNutritionStore((state) => state.menus)
  const isLoading = useNutritionStore((state) => state.isLoading)
  const error = useNutritionStore((state) => state.error)
  const loadMenus = useNutritionStore((state) => state.loadMenus)
  const createMenu = useNutritionStore((state) => state.createMenu)
  const updateMenu = useNutritionStore((state) => state.updateMenu)
  const deleteMenu = useNutritionStore((state) => state.deleteMenu)
  const addMeal = useNutritionStore((state) => state.addMeal)
  const updateMeal = useNutritionStore((state) => state.updateMeal)
  const reorderMeal = useNutritionStore((state) => state.reorderMeal)
  const deleteMeal = useNutritionStore((state) => state.deleteMeal)

  const user = useAuthStore((state) => state.user)

  const [showNewMenuInput, setShowNewMenuInput] = useState(false)
  const [newMenuName, setNewMenuName] = useState('')

  useEffect(() => {
    if (user) {
      loadMenus()
    }
  }, [user, loadMenus])

  function handleCreateMenu() {
    const trimmed = newMenuName.trim()
    if (!trimmed) return
    createMenu(trimmed)
    setNewMenuName('')
    setShowNewMenuInput(false)
  }

  if (isLoading && menus.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-brand-lightAccent text-lg font-bold animate-pulse">
          Cargando nutrición...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-[Montserrat]">Nutrición</h2>
          <p className="text-brand-mutedText text-sm">Referencias de menús y macros</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {showNewMenuInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-brand-dark border border-brand-accent rounded-lg px-3 py-2 text-sm text-white outline-none"
            placeholder="Nombre del menú"
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateMenu()
              if (e.key === 'Escape') { setShowNewMenuInput(false); setNewMenuName('') }
            }}
            autoFocus
          />
          <button
            onClick={handleCreateMenu}
            className="bg-brand-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-lightAccent transition-colors"
          >
            Crear
          </button>
          <button
            onClick={() => { setShowNewMenuInput(false); setNewMenuName('') }}
            className="px-4 py-2 text-sm text-brand-mutedText hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewMenuInput(true)}
          className="w-full border-2 border-dashed border-brand-border rounded-2xl py-4 text-sm text-brand-mutedText hover:border-brand-accent hover:text-brand-accent transition-colors"
        >
          + Nuevo menú
        </button>
      )}

      {menus.length === 0 && !showNewMenuInput && (
        <div className="text-center py-12">
          <p className="text-brand-mutedText text-sm">No hay menús aún. Crea tu primer menú diario.</p>
        </div>
      )}

      <div className="space-y-4">
        {menus.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            onUpdateMenu={updateMenu}
            onDeleteMenu={deleteMenu}
            onAddMeal={addMeal}
            onUpdateMeal={updateMeal}
            onReorderMeal={reorderMeal}
            onDeleteMeal={deleteMeal}
          />
        ))}
      </div>
    </div>
  )
}
