import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format.js'
import StarRating from './StarRating.jsx'
import WishlistButton from './WishlistButton.jsx'

export default function ProductCard({ product, onAdd, busy }) {
  const outOfStock = product.stock <= 0
  const lowStock = !outOfStock && product.stock <= 5

  return (
    <article className="card product-card">
      <Link to={`/products/${product.id}`} className="product-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="image-placeholder">No image</div>
        )}
        {outOfStock && <span className="stock-flag">Out of stock</span>}
        {lowStock && <span className="stock-flag stock-flag-low">Only {product.stock} left</span>}
      </Link>

      <WishlistButton productId={product.id} className="wish-btn-float" />

      <div className="product-body">
        {product.categoryName && <span className="chip">{product.categoryName}</span>}
        <h3 className="product-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        <StarRating value={product.averageRating} count={product.reviewCount} className="card-stars" />

        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <strong className="price">{formatCurrency(product.price)}</strong>
          <button
            className="btn btn-primary btn-sm"
            disabled={outOfStock || busy}
            onClick={() => onAdd(product)}
          >
            {busy ? 'Adding…' : outOfStock ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
