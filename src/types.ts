export type Expense = {
  id: string
  amount: number
  category: string
  note: string
  /** Fecha en formato YYYY-MM-DD */
  date: string
  createdAt: number
}

export type Period = 'day' | 'week' | 'month'

export const CATEGORIES = [
  'Comida',
  'Transporte',
  'Vivienda',
  'Salud',
  'Ocio',
  'Compras',
  'Servicios',
  'Otros',
] as const
