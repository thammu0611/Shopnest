import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { apiMessage } from '../api/client.js'
import { formatCurrency } from '../utils/format.js'
import Alert from '../components/Alert.jsx'
import Loader from '../components/Loader.jsx'
import { ArrowLeftIcon, ArrowRightIcon, BagIcon, ShieldIcon } from '../components/Icons.jsx'

// Mirrors CartService.FREE_SHIPPING_THRESHOLD on the backend.
const FREE_SHIPPING_THRESHOLD = 2000

export default function Cart() {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart()
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const navigate = useNavigate()

  const guard = async (id, action) => {
    setBusyId(id)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(apiMessage(err, 'Could not update your cart'))
    } finally {
      setBusyId(null)
    }
  }

  if (loading && cart.items.length === 0) return <Loader label="Loading your bag…" />

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon"><BagIcon size={40} strokeWidth={1} /></span>
        <h1>Your bag is empty</h1>
        <p className="muted">Discover the collection and add the pieces you love.</p>
        <Link to="/" className="btn btn-primary btn-lg">Explore the collection</Link>
      </div>
    )
  }

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - Number(cart.subtotal))
  const progress = Math.min(100, (Number(cart.subtotal) / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <div className="cart-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Checkout · Step 1 of 2</span>
          <h1>Shopping bag</h1>
          <p className="muted">{cart.totalItems} {cart.totalItems === 1 ? 'piece' : 'pieces'} reserved for you.</p>
        </div>
      </div>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

      <div className="cart-layout">
        <div className="cart-lines">
          {cart.items.map((item) => (
            <div className="cart-line" key={item.id}>
              <Link to={`/products/${item.productId}`} className="cart-thumb">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} />
                  : <div className="image-placeholder">No image</div>}
              </Link>

              <div className="cart-info">
                <Link to={`/products/${item.productId}`} className="cart-name">{item.name}</Link>
                <span className="muted small">{formatCurrency(item.price)} each · {item.stock} in stock</span>
                <button
                  className="link-btn link-quiet"
                  disabled={busyId === item.id}
                  onClick={() => guard(item.id, () => removeItem(item.id))}
                >Remove</button>
              </div>

              <div className="qty-control">
                <button
                  aria-label="Decrease quantity"
                  disabled={item.quantity <= 1 || busyId === item.id}
                  onClick={() => guard(item.id, () => updateItem(item.id, item.quantity - 1))}
                >−</button>
                <span>{item.quantity}</span>
                <button
                  aria-label="Increase quantity"
                  disabled={item.quantity >= item.stock || busyId === item.id}
                  onClick={() => guard(item.id, () => updateItem(item.id, item.quantity + 1))}
                >+</button>
              </div>

              <div className="cart-subtotal">{formatCurrency(item.subtotal)}</div>
            </div>
          ))}

          <div className="cart-foot">
            <Link to="/" className="btn btn-link"><ArrowLeftIcon size={16} /> Continue shopping</Link>
            <button className="link-btn link-quiet" onClick={() => guard('all', clearCart)}>
              Empty bag
            </button>
          </div>
        </div>

        <aside className="summary">
          <h2>Order summary</h2>

          <div className="ship-meter">
            <p className="small">
              {remaining > 0
                ? <>You are <strong>{formatCurrency(remaining)}</strong> away from complimentary delivery.</>
                : <>Your order qualifies for <strong>complimentary delivery</strong>.</>}
            </p>
            <div className="bar-track bar-track-sm">
              <div className="bar-fill bar-accent" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="summary-row">
            <span>Subtotal ({cart.totalItems})</span>
            <span>{formatCurrency(cart.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>{Number(cart.shipping) === 0 ? 'Complimentary' : formatCurrency(cart.shipping)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatCurrency(cart.total)}</span>
          </div>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => navigate('/checkout')}>
            Proceed to checkout <ArrowRightIcon size={16} />
          </button>
          <p className="summary-note">
            <ShieldIcon size={16} strokeWidth={1.3} /> Secure checkout · Card, UPI or cash on delivery
          </p>
        </aside>
      </div>
    </div>
  )
}
