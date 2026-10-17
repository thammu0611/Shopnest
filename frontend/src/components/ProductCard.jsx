import { Link } from 'react-router-dom'
import StarRating from './StarRating.jsx'
import WishlistButton from './WishlistButton.jsx'
import PriceTag from './PriceTag.jsx'
import { BagIcon } from './Icons.jsx'

/**
 * `onAdd` is optional: without it (e.g. the recently-viewed rail) the card is
 * a plain link with no quick-add button.
 */
export default function ProductCard({ product, onAdd, busy }) {
  const outOfStock = product.stock <= 0
  const lowStock = !outOfStock && product.stock <= 5
  const onSale = product.mrp != null && Number(product.mrp) > Number(product.price)

  return (
    <article className="product-card">
      <div className="product-media">
        <Link to={`/products/${product.id}`} className="product-image" tabIndex={-1} aria-hidden="true">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" loading="lazy" />
          ) : (
            <div className="image-placeholder">No image</div>
          )}
        </Link>

        <div className="card-flags">
          {outOfStock && <span className="stock-flag">Sold out</span>}
          {!outOfStock && onSale && <span className="stock-flag stock-flag-sale">Sale</span>}
          {lowStock && <span className="stock-flag stock-flag-low">Only {product.stock} left</span>}
        </div>

        <WishlistButton productId={product.id} className="wish-btn-float" />

        {onAdd && (
          <button
            type="button"
            className="quick-add"
            disabled={outOfStock || busy}
            onClick={() => onAdd(product)}
          >
            <BagIcon size={16} />
            {busy ? 'Adding…' : outOfStock ? 'Sold out' : 'Add to bag'}
          </button>
        )}
      </div>

      <div className="product-body">
        <span className="product-cat">{product.brand || product.categoryName}</span>
        <h3 className="product-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <StarRating value={product.averageRating} count={product.reviewCount} size={12} className="card-stars" />
        <PriceTag price={product.price} mrp={product.mrp} discountPercent={product.discountPercent} size="sm" />
      </div>
    </article>
  )
}
