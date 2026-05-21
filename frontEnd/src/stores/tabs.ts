export type Tab = 'inicio' | 'rutinas' | 'historial' | 'nutricion' | 'perfil'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: '🏠' },
  { id: 'rutinas', label: 'Rutinas', icon: '🏋️' },
  { id: 'historial', label: 'Historial', icon: '📋' },
  { id: 'nutricion', label: 'Nutrición', icon: '🍎' },
  { id: 'perfil', label: 'Perfil', icon: '👤' },
]

export { TABS }
