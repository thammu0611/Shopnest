import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format.js'
import StarRating from './StarRating.jsx'
import WishlistButton from './WishlistButton.jsx'
import { BagIcon } from './Icons.jsx'

export default function ProductCard({ product, onAdd, busy }) {
  const outOfStock = product.stock <= 0
  const lowStock = !outOfStock && product.stock <= 5

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

        {outOfStock && <span className="stock-flag">Sold out</span>}
        {lowStock && <span className="stock-flag stock-flag-low">Only {product.stock} left</span>}

        <WishlistButton productId={product.id} className="wish-btn-float" />

        <button
          type="button"
          className="quick-add"
          disabled={outOfStock || busy}
          onClick={() => onAdd(product)}
        >
          <BagIcon size={16} />
          {busy ? 'Adding…' : outOfStock ? 'Sold out' : 'Add to bag'}
        </button>
      </div>

      <div className="product-body">
        {product.categoryName && <span className="product-cat">{product.categoryName}</span>}
        <h3 className="product-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <StarRating value={product.averageRating} count={product.reviewCount} size={12} className="card-stars" />
        <span className="price">{formatCurrency(product.price)}</span>
      </div>
    </article>
  )
}
