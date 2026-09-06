const percentFormatter = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  signDisplay: 'exceptZero',
  maximumFractionDigits: 1,
})

export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio)
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}
