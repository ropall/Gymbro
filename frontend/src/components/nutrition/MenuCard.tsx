import { useState } from 'react'
import type { NutritionMenu } from '../../types'
import { MacroEditor } from './MacroEditor'
import { BudgetEditor } from './BudgetEditor'
import { MealItem } from './MealItem'
import { AddMealForm } from './AddMealForm'

interface MenuCardProps {
  menu: NutritionMenu
  onUpdateMenu: (id: string, updates: Partial<NutritionMenu>) => void
  onDeleteMenu: (id: string) => void
  onAddMeal: (menuId: string, meal: { nombre_comida: string; descripcion: string }) => void
  onUpdateMeal: (id: string, updates: { nombre_comida?: string; descripcion?: string }) => void
  onReorderMeal: (id: string, newOrden: number) => void
  onDeleteMeal: (id: string) => void
}

export function MenuCard({ menu, onUpdateMenu, onDeleteMenu, onAddMeal, onUpdateMeal, onReorderMeal, onDeleteMeal }: MenuCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(menu.nombre)

  function handleSaveName() {
    setEditingName(false)
    const trimmed = nameValue.trim()
    if (trimmed && trimmed !== menu.nombre) {
      onUpdateMenu(menu.id, { nombre: trimmed })
    } else {
      setNameValue(menu.nombre)
    }
  }

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
      <div
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-black/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
          {editingName ? (
            <input
              type="text"
              className="bg-brand-dark border border-brand-accent rounded px-2 py-1 text-base font-bold text-brand-primaryText font-heading outline-none"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') {
                  setNameValue(menu.nombre)
                  setEditingName(false)
                }
              }}
              autoFocus
            />
          ) : (
            <h4
              className="text-base font-bold text-brand-lightAccent font-heading hover:text-brand-primaryText transition-colors"
              onClick={() => { setNameValue(menu.nombre); setEditingName(true) }}
            >
              {menu.nombre}
            </h4>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-brand-danger">¿Eliminar?</span>
                <button
                  onClick={() => { onDeleteMenu(menu.id); setShowDeleteConfirm(false) }}
                  className="text-xs px-2 py-1 bg-brand-dangerBg text-brand-danger rounded"
                >
                  Sí
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs px-2 py-1 bg-brand-border text-brand-mutedText rounded"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 text-brand-mutedText hover:text-brand-danger transition-colors"
                aria-label={`Eliminar ${menu.nombre}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-brand-mutedText transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          <MacroEditor
            calorias={menu.calorias}
            proteinas={menu.proteinas}
            carbohidratos={menu.carbohidratos}
            grasas={menu.grasas}
            onSave={(updates) => onUpdateMenu(menu.id, updates)}
          />

          <div className="border-t border-brand-border pt-4">
            <label className="text-xs text-brand-mutedText block mb-1">Presupuesto mensual</label>
            <BudgetEditor
              presupuesto={menu.presupuesto}
              onSave={(val) => onUpdateMenu(menu.id, { presupuesto: val })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-brand-mutedText uppercase tracking-wider">Comidas</h5>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-xs text-brand-accent hover:text-brand-lightAccent font-medium transition-colors"
                >
                  + Agregar comida
                </button>
              )}
            </div>

            {menu.meals.length === 0 && !showAddForm && (
              <p className="text-xs text-brand-mutedText">Sin comidas aún</p>
            )}

            {menu.meals.map((meal, idx) => (
              <MealItem
                key={meal.id}
                meal={meal}
                isFirst={idx === 0}
                isLast={idx === menu.meals.length - 1}
                onMoveUp={() => onReorderMeal(meal.id, meal.orden - 1)}
                onMoveDown={() => onReorderMeal(meal.id, meal.orden + 1)}
                onUpdate={(updates) => onUpdateMeal(meal.id, updates)}
                onDelete={() => onDeleteMeal(meal.id)}
              />
            ))}

            {showAddForm && (
              <div className="bg-brand-dark border border-brand-border rounded-xl p-4">
                <AddMealForm
                  onAdd={(meal) => {
                    onAddMeal(menu.id, meal)
                    setShowAddForm(false)
                  }}
                  usedMealNames={menu.meals.map((m) => m.nombre_comida)}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
