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
import Toast from '../components/Toast.jsx'
import { BagIcon, ReturnIcon, ShieldIcon, TruckIcon } from '../components/Icons.jsx'

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
      setNotice(`${quantity} × ${product.name} added to your bag`)
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

  const maxQty = Math.max(product.stock, 1)
  const inStock = product.stock > 0

  return (
    <div className="detail">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Shop</Link>
        {product.categoryName && <><span aria-hidden="true">/</span><span>{product.categoryName}</span></>}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="detail-grid">
        <div className="detail-image">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} />
            : <div className="image-placeholder tall">No image</div>}
        </div>

        <div className="detail-body">
          {product.categoryName && <span className="eyebrow">{product.categoryName}</span>}
          <h1>{product.name}</h1>

          <a href="#reviews" className="detail-rating">
            <StarRating value={product.averageRating} count={product.reviewCount} size={15} showValue />
          </a>

          <p className="detail-price">{formatCurrency(product.price)}</p>
          <p className="detail-desc">{product.description}</p>

          <p className={`stock-line ${inStock ? (product.stock <= 5 ? 'is-low' : 'is-in') : 'is-out'}`}>
            <span className="stock-dot" aria-hidden="true" />
            {inStock
              ? product.stock <= 5
                ? `Only ${product.stock} left — order soon`
                : 'In stock, ready to dispatch'
              : 'Currently sold out'}
          </p>

          <Alert type="error" onClose={() => setError('')}>{error}</Alert>

          <div className="detail-actions">
            <div className="qty-control qty-lg" aria-label="Quantity">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >−</button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={quantity >= maxQty}
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              >+</button>
            </div>
            <button
              className="btn btn-primary btn-lg detail-add"
              disabled={!inStock || busy}
              onClick={handleAdd}
            >
              <BagIcon size={17} />
              {busy ? 'Adding…' : inStock ? 'Add to bag' : 'Sold out'}
            </button>
            <WishlistButton productId={product.id} className="wish-btn-square" />
          </div>

          <ul className="assurance">
            <li><TruckIcon size={20} strokeWidth={1.2} /> Complimentary delivery on orders above ₹2,000</li>
            <li><ShieldIcon size={20} strokeWidth={1.2} /> Secure checkout — card, UPI or cash on delivery</li>
            <li><ReturnIcon size={20} strokeWidth={1.2} /> Cancel free of charge until your order ships</li>
          </ul>
        </div>
      </div>

      <div id="reviews">
        <ProductReviews productId={product.id} onChange={handleReviewsChanged} />
      </div>

      <Toast message={notice} onClose={() => setNotice('')} action={{ to: '/cart', label: 'View bag' }} />
    </div>
  )
}
