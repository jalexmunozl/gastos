import { useState } from 'react'
import { CATEGORIES, type Expense } from '../types'
import { today } from '../lib/date'

type Props = {
  editing: Expense | null
  onSubmit: (values: Omit<Expense, 'id' | 'createdAt'>) => void
  onCancelEdit: () => void
}

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-900'

export function ExpenseForm({ editing, onSubmit, onCancelEdit }: Props) {
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [category, setCategory] = useState<string>(editing?.category ?? CATEGORIES[0])
  const [note, setNote] = useState(editing?.note ?? '')
  const [date, setDate] = useState(editing?.date ?? today())
  const [error, setError] = useState('')

  function reset() {
    setAmount('')
    setCategory(CATEGORIES[0])
    setNote('')
    setDate(today())
    setError('')
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const value = Number(amount.replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0) {
      setError('Ingresa un monto mayor que 0.')
      return
    }
    if (!date) {
      setError('Selecciona una fecha.')
      return
    }
    onSubmit({ amount: Math.round(value * 100) / 100, category, note: note.trim(), date })
    reset()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto] sm:items-end"
    >
      <label className="grid gap-1 text-xs font-medium text-neutral-500">
        Monto
        <input
          className={inputClass}
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label="Monto"
        />
      </label>

      <label className="grid gap-1 text-xs font-medium text-neutral-500">
        Categoría
        <select
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Categoría"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-xs font-medium text-neutral-500">
        Nota
        <input
          className={inputClass}
          placeholder="Opcional"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-label="Nota"
        />
      </label>

      <label className="grid gap-1 text-xs font-medium text-neutral-500">
        Fecha
        <input
          type="date"
          className={inputClass}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Fecha"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          {editing ? 'Guardar' : 'Añadir'}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              reset()
              onCancelEdit()
            }}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
          >
            Cancelar
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600 sm:col-span-5">{error}</p>}
    </form>
  )
}
