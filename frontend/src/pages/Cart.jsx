import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { apiMessage } from '../api/client.js'
import { formatCurrency } from '../utils/format.js'
import Alert from '../components/Alert.jsx'
import Loader from '../components/Loader.jsx'

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

  if (loading && cart.items.length === 0) return <Loader label="Loading your cart…" />

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <h1>Your cart is empty</h1>
        <p className="muted">Browse the catalogue and add something you like.</p>
        <Link to="/" className="btn btn-primary">Start shopping</Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1>Your cart</h1>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

      <div className="cart-layout">
        <div className="cart-lines">
          {cart.items.map((item) => (
            <div className="card cart-line" key={item.id}>
              <Link to={`/products/${item.productId}`} className="cart-thumb">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} />
                  : <div className="image-placeholder">No image</div>}
              </Link>

              <div className="cart-info">
                <Link to={`/products/${item.productId}`} className="cart-name">{item.name}</Link>
                <span className="muted">{formatCurrency(item.price)} each</span>
                <span className="muted small">{item.stock} in stock</span>
              </div>

              <div className="qty-control">
                <button
                  disabled={item.quantity <= 1 || busyId === item.id}
                  onClick={() => guard(item.id, () => updateItem(item.id, item.quantity - 1))}
                >−</button>
                <span>{item.quantity}</span>
                <button
                  disabled={item.quantity >= item.stock || busyId === item.id}
                  onClick={() => guard(item.id, () => updateItem(item.id, item.quantity + 1))}
                >+</button>
              </div>

              <div className="cart-subtotal">{formatCurrency(item.subtotal)}</div>

              <button
                className="btn btn-danger btn-sm"
                disabled={busyId === item.id}
                onClick={() => guard(item.id, () => removeItem(item.id))}
              >Remove</button>
            </div>
          ))}

          <button className="btn btn-ghost" onClick={() => guard('all', clearCart)}>
            Clear cart
          </button>
        </div>

        <aside className="card summary">
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Items ({cart.totalItems})</span>
            <span>{formatCurrency(cart.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{Number(cart.shipping) === 0 ? 'Free' : formatCurrency(cart.shipping)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatCurrency(cart.total)}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
          <Link to="/" className="muted center block">Continue shopping</Link>
        </aside>
      </div>
    </div>
  )
}
