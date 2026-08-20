import type { Expense } from '../types'
import { formatShortDate } from '../lib/date'
import { formatMoney } from '../lib/format'

type Props = {
  expenses: Expense[]
  currency: string
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseList({ expenses, currency, onEdit, onDelete }: Props) {
  if (expenses.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
        Sin gastos en este período.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {expenses.map((expense) => (
        <li key={expense.id} className="group flex items-center gap-3 px-4 py-3">
          <div className="w-14 shrink-0 text-xs text-neutral-400">{formatShortDate(expense.date)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{expense.note || expense.category}</p>
            <p className="text-xs text-neutral-400">{expense.category}</p>
          </div>
          <div className="text-sm font-semibold tabular-nums">{formatMoney(expense.amount, currency)}</div>
          <div className="flex gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(expense)}
              aria-label={`Editar gasto ${expense.note || expense.category}`}
              className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(expense.id)}
              aria-label={`Eliminar gasto ${expense.note || expense.category}`}
              className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
