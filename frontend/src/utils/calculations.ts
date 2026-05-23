import type { Sexo } from '../types'

/**
 * Calcula el Índice de Masa Corporal (IMC)
 * peso en kg, altura en cm
 */
export function calculateIMC(peso: number, alturaCm: number): number {
  const alturaM = alturaCm / 100
  return parseFloat((peso / (alturaM * alturaM)).toFixed(2))
}

/**
 * Calcula la Tasa Metabólica Basal (TMB) usando Mifflin-St Jeor
 * peso en kg, altura en cm, edad en años
 */
export function calculateTMB(peso: number, alturaCm: number, edad: number, sexo: Sexo): number {
  const base = 10 * peso + 6.25 * alturaCm - 5 * edad
  return sexo === 'masculino' ? Math.round(base + 5) : Math.round(base - 161)
}

/**
 * Calcula la edad en años a partir de una fecha de nacimiento (YYYY-MM-DD)
 */
export function calculateEdad(fechaNacimiento: string): number {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

/**
 * Genera un ID único simple (suficiente para datos locales)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) a formato legible en español
 */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Obtiene la fecha de hoy en formato ISO (YYYY-MM-DD)
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
