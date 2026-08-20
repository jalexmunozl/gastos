import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney } from '../lib/format'

type Point = { label: string; total: number }
type CategoryTotal = { category: string; total: number }

type Props = {
  trend: Point[]
  categories: CategoryTotal[]
  currency: string
}

export function Charts({ trend, categories, currency }: Props) {
  const max = categories.reduce((acc, item) => Math.max(acc, item.total), 0)

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-medium text-neutral-500">Evolución</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="#a3a3a3" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#a3a3a3" width={56} />
              <Tooltip
                cursor={{ fill: '#fafafa' }}
                formatter={(value) => [formatMoney(Number(value), currency), 'Total']}
              />
              <Bar dataKey="total" fill="#171717" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-medium text-neutral-500">Por categoría</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-neutral-400">Sin datos.</p>
        ) : (
          <ul className="grid gap-3">
            {categories.map((item) => (
              <li key={item.category} className="grid gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-600">{item.category}</span>
                  <span className="font-medium tabular-nums">{formatMoney(item.total, currency)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-100">
                  <div
                    className="h-1.5 rounded-full bg-neutral-900"
                    style={{ width: `${max > 0 ? (item.total / max) * 100 : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
