import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatCurrency } from '../utils/format.js'
import Alert from '../components/Alert.jsx'

const PAYMENT_METHODS = [
  { value: 'CARD', label: 'Card (simulated)' },
  { value: 'UPI', label: 'UPI (simulated)' },
  { value: 'COD', label: 'Cash on delivery' },
]

export default function Checkout() {
  const { user } = useAuth()
  const { cart, refresh } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    shippingName: user?.name || '',
    shippingPhone: user?.phone || '',
    shippingAddress: '',
    shippingCity: '',
    shippingPincode: '',
    paymentMethod: 'CARD',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (cart.items.length === 0) navigate('/cart', { replace: true })
  }, [cart.items.length, navigate])

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data } = await orderApi.checkout(form)
      await refresh()
      navigate(`/orders/success/${data.id}`, { replace: true })
    } catch (err) {
      setError(apiMessage(err, 'Checkout failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <form className="card checkout-form" onSubmit={submit}>
          <h2>Shipping details</h2>
          <Alert type="error" onClose={() => setError('')}>{error}</Alert>

          <label>
            Full name
            <input name="shippingName" value={form.shippingName} onChange={change} required />
          </label>

          <label>
            Phone
            <input name="shippingPhone" value={form.shippingPhone} onChange={change}
                   required pattern="[0-9+\- ]{8,20}" title="8–20 digits" />
          </label>

          <label>
            Address
            <textarea name="shippingAddress" rows="3" value={form.shippingAddress}
                      onChange={change} required />
          </label>

          <div className="form-row">
            <label>
              City
              <input name="shippingCity" value={form.shippingCity} onChange={change} required />
            </label>
            <label>
              PIN code
              <input name="shippingPincode" value={form.shippingPincode} onChange={change}
                     required pattern="[0-9]{4,10}" title="4–10 digits" />
            </label>
          </div>

          <h2>Payment method</h2>
          <div className="payment-options">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.value} className="radio">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.value}
                  checked={form.paymentMethod === m.value}
                  onChange={change}
                />
                {m.label}
              </label>
            ))}
          </div>
          <p className="muted small">
            No real gateway is called — card and UPI orders are marked PAID instantly,
            cash-on-delivery stays PENDING until an admin marks it delivered.
          </p>

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Placing order…' : `Place order · ${formatCurrency(cart.total)}`}
          </button>
        </form>

        <aside className="card summary">
          <h2>Your items</h2>
          {cart.items.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>{item.name} × {item.quantity}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          <hr />
          <div className="summary-row">
            <span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{Number(cart.shipping) === 0 ? 'Free' : formatCurrency(cart.shipping)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span><span>{formatCurrency(cart.total)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
