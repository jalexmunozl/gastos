import type { Expense } from '../types'

export const STORAGE_KEY = 'gastos.expenses.v1'
export const CURRENCY_KEY = 'gastos.currency.v1'

function isExpense(value: unknown): value is Expense {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.amount === 'number' &&
    Number.isFinite(record.amount) &&
    typeof record.category === 'string' &&
    typeof record.note === 'string' &&
    typeof record.date === 'string' &&
    typeof record.createdAt === 'number'
  )
}

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isExpense)
  } catch {
    return []
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
  } catch {
    // El almacenamiento puede estar lleno o deshabilitado: se ignora.
  }
}

export function loadCurrency(fallback: string): string {
  try {
    return localStorage.getItem(CURRENCY_KEY) ?? fallback
  } catch {
    return fallback
  }
}

export function saveCurrency(currency: string): void {
  try {
    localStorage.setItem(CURRENCY_KEY, currency)
  } catch {
    // Ignorado.
  }
}

export function parseImportedExpenses(json: string): Expense[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('No se pudo leer el archivo JSON.')
  }
  const list = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { expenses?: unknown }).expenses)
      ? (parsed as { expenses: unknown[] }).expenses
      : null
  if (!list) throw new Error('El archivo no contiene una lista de gastos.')
  const valid = list.filter(isExpense)
  if (valid.length === 0) throw new Error('No se encontraron gastos válidos en el archivo.')
  return valid
}

export function toCSV(expenses: Expense[]): string {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const rows = expenses.map((e) =>
    [e.date, e.category, e.note, e.amount.toFixed(2)].map((v) => escape(String(v))).join(','),
  )
  return ['fecha,categoria,nota,monto', ...rows].join('\n')
}
