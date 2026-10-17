const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export function formatCurrency(value) {
  const amount = Number(value ?? 0)
  return currency.format(Number.isFinite(amount) ? amount : 0)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function statusClass(status) {
  return `badge badge-${(status || '').toLowerCase()}`
}

/** Short human description of a coupon, e.g. "10% off, up to ₹500". */
export function describeOffer(o) {
  const amount = o.discountType === 'PERCENT' ? `${Number(o.value)}% off` : `${formatCurrency(o.value)} off`
  const cap = o.maxDiscount ? `, up to ${formatCurrency(o.maxDiscount)}` : ''
  const min = o.minOrderAmount ? ` on orders of ${formatCurrency(o.minOrderAmount)}+` : ''
  return amount + cap + min
}
