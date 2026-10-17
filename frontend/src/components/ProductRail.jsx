import { Link } from 'react-router-dom'
import ProductCard from './ProductCard.jsx'
import { ArrowRightIcon } from './Icons.jsx'

/** A titled row of product cards, with an optional "view all" link. */
export default function ProductRail({ eyebrow, title, products, link, onAdd, busyId }) {
  if (!products || products.length === 0) return null
  return (
    <section className="rail">
      <header className="rail-head">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        {link && (
          <Link to={link.to} className="rail-link">
            {link.label} <ArrowRightIcon size={15} />
          </Link>
        )}
      </header>
      <div className="product-grid rail-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={onAdd} busy={busyId === p.id} />
        ))}
      </div>
    </section>
  )
}
