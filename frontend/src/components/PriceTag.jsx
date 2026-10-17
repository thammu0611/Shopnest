import { formatCurrency } from '../utils/format.js'

/** Selling price, with the struck-through MRP and percentage off when on sale. */
export default function PriceTag({ price, mrp, discountPercent, size = 'md' }) {
  const onSale = mrp != null && Number(mrp) > Number(price)
  const percent = discountPercent ?? (onSale ? Math.round((1 - Number(price) / Number(mrp)) * 100) : null)
  return (
    <span className={`price-tag price-tag-${size}`}>
      <span className="price-now">{formatCurrency(price)}</span>
      {onSale && (
        <>
          <s className="price-was" aria-label={`MRP ${formatCurrency(mrp)}`}>{formatCurrency(mrp)}</s>
          <span className="price-off">{percent}% off</span>
        </>
      )}
    </span>
  )
}
