import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases de Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número al formato argentino (coma para decimales, punto para miles)
 * @param value - Número a formatear
 * @param decimals - Número de decimales (default: 1)
 * @returns String formateado
 */
export function formatNumberAR(value: number | string | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) {
    return ''
  }
  
  return numValue.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Convierte un string con formato argentino (coma decimal) a número
 * @param value - String con formato argentino (ej: "3,5" o "1.234,56")
 * @returns Número o null si no es válido
 */
export function parseNumberAR(value: string): number | null {
  if (!value || value.trim() === '') {
    return null
  }
  
  // Reemplazar punto de miles y coma de decimal por formato estándar
  // "1.234,56" -> "1234.56"
  const normalized = value
    .replace(/\./g, '') // Eliminar puntos (separadores de miles)
    .replace(',', '.') // Reemplazar coma por punto (decimal)
  
  const parsed = parseFloat(normalized)
  
  if (isNaN(parsed)) {
    return null
  }
  
  return parsed
}

/**
 * Formatea un input para aceptar solo números con formato argentino
 * @param value - Valor del input
 * @returns Valor formateado para el input
 */
export function formatInputNumberAR(value: string): string {
  if (!value) return ''
  
  // Permitir solo números, coma y punto
  const cleaned = value.replace(/[^\d,.-]/g, '')
  
  // Si hay múltiples comas, mantener solo la primera
  const commaIndex = cleaned.indexOf(',')
  if (commaIndex !== -1) {
    const beforeComma = cleaned.substring(0, commaIndex + 1).replace(/,/g, '')
    const afterComma = cleaned.substring(commaIndex + 1).replace(/[^\d]/g, '')
    return beforeComma + ',' + afterComma
  }
  
  // Si hay puntos, tratarlos como separadores de miles
  const parts = cleaned.split('.')
  if (parts.length > 1) {
    // El último punto podría ser un error, tratarlo como decimal
    // Por ahora, solo permitir un punto antes de la coma
    return parts.join('')
  }
  
  return cleaned
}
