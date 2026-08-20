import { useEffect, useMemo, useRef, useState } from 'react'
import { Charts } from './components/Charts'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseList } from './components/ExpenseList'
import {
  eachDay,
  formatRangeLabel,
  parseISODate,
  rangeFor,
  shiftAnchor,
  toISODate,
} from './lib/date'
import { formatMoney } from './lib/format'
import {
  loadCurrency,
  loadExpenses,
  parseImportedExpenses,
  saveCurrency,
  saveExpenses,
  toCSV,
} from './lib/storage'
import type { Expense, Period } from './types'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Diario' },
  { value: 'week', label: 'Semanal' },
  { value: 'month', label: 'Mensual' },
]

const CURRENCIES = ['EUR', 'USD', 'COP', 'MXN', 'PEN', 'CLP', 'ARS']

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses())
  const [currency, setCurrency] = useState(() => loadCurrency('EUR'))
  const [period, setPeriod] = useState<Period>('month')
  const [anchor, setAnchor] = useState(() => new Date())
  const [editing, setEditing] = useState<Expense | null>(null)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => saveExpenses(expenses), [expenses])
  useEffect(() => saveCurrency(currency), [currency])

  const { start, end } = useMemo(() => rangeFor(period, anchor), [period, anchor])
  const startISO = toISODate(start)
  const endISO = toISODate(end)

  const visible = useMemo(
    () =>
      expenses
        .filter((e) => e.date >= startISO && e.date <= endISO)
        .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date))),
    [expenses, startISO, endISO],
  )

  const total = useMemo(() => visible.reduce((sum, e) => sum + e.amount, 0), [visible])

  const previousTotal = useMemo(() => {
    const prev = rangeFor(period, shiftAnchor(period, anchor, -1))
    const from = toISODate(prev.start)
    const to = toISODate(prev.end)
    return expenses.filter((e) => e.date >= from && e.date <= to).reduce((sum, e) => sum + e.amount, 0)
  }, [expenses, period, anchor])

  const dayCount = eachDay(start, end).length
  const average = total / dayCount

  const trend = useMemo(() => {
    if (period === 'day') {
      const byHourless = visible.reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] ?? 0) + e.amount
        return acc
      }, {})
      return Object.entries(byHourless).map(([label, value]) => ({ label, total: value }))
    }
    const totals = new Map<string, number>()
    for (const e of visible) totals.set(e.date, (totals.get(e.date) ?? 0) + e.amount)
    return eachDay(start, end).map((day) => {
      const iso = toISODate(day)
      return { label: String(day.getDate()), total: Math.round((totals.get(iso) ?? 0) * 100) / 100 }
    })
  }, [visible, period, start, end])

  const categories = useMemo(() => {
    const totals = new Map<string, number>()
    for (const e of visible) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
    return [...totals.entries()]
      .map(([category, value]) => ({ category, total: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.total - a.total)
  }, [visible])

  const delta = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : null

  function upsert(values: Omit<Expense, 'id' | 'createdAt'>) {
    if (editing) {
      const current = editing
      setExpenses((prev) => prev.map((e) => (e.id === current.id ? { ...e, ...values } : e)))
      setEditing(null)
    } else {
      setExpenses((prev) => [{ ...values, id: createId(), createdAt: Date.now() }, ...prev])
      setAnchor(parseISODate(values.date))
    }
  }

  function remove(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    setEditing((current) => (current?.id === id ? null : current))
  }

  function handleImport(file: File) {
    void file.text().then((text) => {
      try {
        const imported = parseImportedExpenses(text)
        setExpenses((prev) => {
          const known = new Set(prev.map((e) => e.id))
          return [...prev, ...imported.filter((e) => !known.has(e.id))]
        })
        setMessage(`Importados ${imported.length} gastos.`)
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'No se pudo importar el archivo.')
      }
    })
  }

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  return (
    <div className="mx-auto grid max-w-5xl gap-5 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Gastos</h1>
          <p className="text-sm text-neutral-500">Tus datos se guardan solo en este navegador.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            aria-label="Moneda"
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => download('gastos.json', JSON.stringify(expenses, null, 2), 'application/json')}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={() => download('gastos.csv', toCSV(expenses), 'text/csv')}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Importar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImport(file)
              e.target.value = ''
            }}
          />
        </div>
      </header>

      {message && (
        <p className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600">{message}</p>
      )}

      <ExpenseForm
        key={editing?.id ?? 'nuevo'}
        editing={editing}
        onSubmit={upsert}
        onCancelEdit={() => setEditing(null)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-1">
          {PERIODS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                period === option.value ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Período anterior"
            onClick={() => setAnchor((current) => shiftAnchor(period, current, -1))}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            ←
          </button>
          <span className="min-w-40 text-center text-sm font-medium">{formatRangeLabel(period, anchor)}</span>
          <button
            type="button"
            aria-label="Período siguiente"
            onClick={() => setAnchor((current) => shiftAnchor(period, current, 1))}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => setAnchor(new Date())}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Hoy
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Total del período" value={formatMoney(total, currency)} />
        <Card label="Promedio por día" value={formatMoney(average, currency)} />
        <Card
          label="vs. período anterior"
          value={delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`}
          tone={delta === null ? 'neutral' : delta > 0 ? 'up' : 'down'}
        />
      </div>

      <Charts trend={trend} categories={categories} currency={currency} />

      <ExpenseList expenses={visible} currency={currency} onEdit={setEditing} onDelete={remove} />
    </div>
  )
}

function Card({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'up' | 'down' | 'neutral' }) {
  const toneClass = tone === 'up' ? 'text-red-600' : tone === 'down' ? 'text-emerald-600' : 'text-neutral-900'
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  )
}
