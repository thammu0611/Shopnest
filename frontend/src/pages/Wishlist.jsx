import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { wishlistApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { formatCurrency } from '../utils/format.js'
import StarRating from '../components/StarRating.jsx'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

export default function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)

  const { refresh: refreshWishlist } = useWishlist()
  const { refresh: refreshCart } = useCart()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await wishlistApi.get()
      setItems(data.items)
    } catch (err) {
      setError(apiMessage(err, 'Could not load your wishlist'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const flash = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(''), 2500)
  }

  const handleRemove = async (item) => {
    setBusyId(item.productId)
    setError('')
    try {
      const { data } = await wishlistApi.remove(item.productId)
      setItems(data.items)
      refreshWishlist()
      flash(`${item.name} removed from your wishlist`)
    } catch (err) {
      setError(apiMessage(err, 'Could not remove that item'))
    } finally {
      setBusyId(null)
    }
  }

  const handleMove = async (item) => {
    setBusyId(item.productId)
    setError('')
    try {
      await wishlistApi.moveToCart(item.productId)
      await Promise.all([load(), refreshWishlist(), refreshCart()])
      flash(`${item.name} moved to your cart`)
    } catch (err) {
      // Most likely the item went out of stock while it sat in the wishlist.
      setError(apiMessage(err, 'Could not move that item to your cart'))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Loader label="Loading your wishlist…" />

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Wishlist</h1>
          <p className="muted">
            {items.length === 0
              ? 'Products you save will appear here.'
              : `${items.length} saved ${items.length === 1 ? 'product' : 'products'}.`}
          </p>
        </div>
      </div>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>

      {items.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon" aria-hidden="true">♡</div>
          <h2>Nothing saved yet</h2>
          <p className="muted">Tap the heart on any product to keep it here for later.</p>
          <Link to="/" className="btn btn-primary">Browse the shop</Link>
        </div>
      ) : (
        <div className="product-grid">
          {items.map((item) => {
            const outOfStock = item.stock <= 0
            const busy = busyId === item.productId
            return (
              <article key={item.id} className="card product-card">
                <Link to={`/products/${item.productId}`} className="product-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} loading="lazy" />
                  ) : (
                    <div className="image-placeholder">No image</div>
                  )}
                  {outOfStock && <span className="stock-flag">Out of stock</span>}
                </Link>

                <div className="product-body">
                  {item.categoryName && <span className="chip">{item.categoryName}</span>}
                  <h3 className="product-title">
                    <Link to={`/products/${item.productId}`}>{item.name}</Link>
                  </h3>

                  <StarRating value={item.averageRating} count={item.reviewCount} className="card-stars" />

                  <strong className="price">{formatCurrency(item.price)}</strong>

                  <div className="wish-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={outOfStock || busy}
                      onClick={() => handleMove(item)}
                    >
                      {busy ? 'Working…' : outOfStock ? 'Sold out' : 'Move to cart'}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={busy}
                      onClick={() => handleRemove(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
