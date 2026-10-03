import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { productApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatCurrency } from '../utils/format.js'
import StarRating from '../components/StarRating.jsx'
import WishlistButton from '../components/WishlistButton.jsx'
import ProductReviews from '../components/ProductReviews.jsx'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    productApi
      .get(id)
      .then(({ data }) => setProduct(data))
      .catch((err) => setError(apiMessage(err, 'Product not found')))
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } })
      return
    }
    setBusy(true)
    setError('')
    try {
      await addItem(product.id, quantity)
      setNotice('Added to your cart')
    } catch (err) {
      setError(apiMessage(err, 'Could not add that item'))
    } finally {
      setBusy(false)
    }
  }

  /** Keep the headline stars in step after someone posts or deletes a review. */
  const handleReviewsChanged = (summary) => {
    setProduct((prev) =>
      prev ? { ...prev, averageRating: summary.averageRating, reviewCount: summary.reviewCount } : prev
    )
  }

  if (loading) return <Loader label="Loading product…" />
  if (!product) return <Alert type="error">{error || 'Product not found'}</Alert>

  return (
    <div className="detail">
      <Link to="/" className="back-link">← Back to shop</Link>

      <div className="detail-grid">
        <div className="detail-image">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} />
            : <div className="image-placeholder tall">No image</div>}
        </div>

        <div className="detail-body">
          {product.categoryName && <span className="chip">{product.categoryName}</span>}
          <h1>{product.name}</h1>

          <a href="#reviews" className="detail-rating">
            <StarRating value={product.averageRating} count={product.reviewCount} size={16} showValue />
          </a>

          <p className="detail-price">{formatCurrency(product.price)}</p>
          <p className="detail-desc">{product.description}</p>

          <p className={product.stock > 0 ? 'in-stock' : 'out-stock'}>
            {product.stock > 0 ? `In stock — ${product.stock} available` : 'Currently out of stock'}
          </p>

          <Alert type="error" onClose={() => setError('')}>{error}</Alert>
          <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>

          <div className="detail-actions">
            <label>
              Qty
              <input
                type="number"
                min="1"
                max={Math.max(product.stock, 1)}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <button
              className="btn btn-primary"
              disabled={product.stock <= 0 || busy}
              onClick={handleAdd}
            >
              {busy ? 'Adding…' : 'Add to cart'}
            </button>
            <WishlistButton productId={product.id} className="wish-btn-inline" withLabel />
            <Link to="/cart" className="btn btn-ghost">Go to cart</Link>
          </div>
        </div>
      </div>

      <div id="reviews">
        <ProductReviews productId={product.id} onChange={handleReviewsChanged} />
      </div>
    </div>
  )
}
