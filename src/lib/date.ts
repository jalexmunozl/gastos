import type { Period } from '../types'

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function today(): string {
  return toISODate(new Date())
}

/** Lunes de la semana que contiene la fecha dada. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d
}

export function endOfWeek(date: Date): Date {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  return d
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function rangeFor(period: Period, anchor: Date): { start: Date; end: Date } {
  if (period === 'day') {
    const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate())
    return { start: d, end: d }
  }
  if (period === 'week') return { start: startOfWeek(anchor), end: endOfWeek(anchor) }
  return { start: startOfMonth(anchor), end: endOfMonth(anchor) }
}

export function shiftAnchor(period: Period, anchor: Date, delta: number): Date {
  const d = new Date(anchor)
  if (period === 'day') d.setDate(d.getDate() + delta)
  else if (period === 'week') d.setDate(d.getDate() + delta * 7)
  else d.setMonth(d.getMonth() + delta)
  return d
}

export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

const longFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const shortFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })
const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })

export function formatRangeLabel(period: Period, anchor: Date): string {
  const { start, end } = rangeFor(period, anchor)
  if (period === 'day') return capitalize(longFormatter.format(start))
  if (period === 'week') return `${shortFormatter.format(start)} – ${shortFormatter.format(end)}`
  return capitalize(monthFormatter.format(start))
}

export function formatShortDate(iso: string): string {
  return shortFormatter.format(parseISODate(iso))
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
