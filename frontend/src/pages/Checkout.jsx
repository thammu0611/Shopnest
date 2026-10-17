import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addressApi, orderApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatCurrency } from '../utils/format.js'
import usePageTitle from '../utils/usePageTitle.js'
import Alert from '../components/Alert.jsx'
import Loader from '../components/Loader.jsx'
import { PinIcon, PlusIcon, ShieldIcon } from '../components/Icons.jsx'

const PAYMENT_METHODS = [
  { value: 'CARD', label: 'Credit / debit card', note: 'Simulated — marked paid instantly' },
  { value: 'UPI', label: 'UPI', note: 'Simulated — marked paid instantly' },
  { value: 'COD', label: 'Cash on delivery', note: 'Pay when your order arrives' },
]

const NEW_ADDRESS = 'new'

/** The single-line form an order stores, built from a saved address. */
const streetOf = (a) => [a.line1, a.line2].filter(Boolean).join(', ')

export default function Checkout() {
  usePageTitle('Checkout')
  const { user } = useAuth()
  const { cart, ready, refresh } = useCart()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState([])
  const [selected, setSelected] = useState(NEW_ADDRESS)
  const [form, setForm] = useState({
    shippingName: user?.name || '',
    shippingPhone: user?.phone || '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPincode: '',
  })
  const [saveAddress, setSaveAddress] = useState(true)
  const [label, setLabel] = useState('Home')
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (ready && cart.items.length === 0) navigate('/cart', { replace: true })
  }, [ready, cart.items.length, navigate])

  useEffect(() => {
    addressApi.list()
      .then(({ data }) => {
        setAddresses(data)
        if (data.length > 0) setSelected(String(data[0].id))   // default first
      })
      .catch(() => setAddresses([]))
  }, [])

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const shippingFields = () => {
    if (selected === NEW_ADDRESS) return form
    const a = addresses.find((x) => String(x.id) === selected)
    return {
      shippingName: a.fullName,
      shippingPhone: a.phone,
      shippingAddress: streetOf(a),
      shippingCity: a.city,
      shippingState: a.state,
      shippingPincode: a.pincode,
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (selected === NEW_ADDRESS && saveAddress) {
        // Best effort: a full address book must not block the order.
        await addressApi.create({
          label: label || 'Home',
          fullName: form.shippingName,
          phone: form.shippingPhone,
          line1: form.shippingAddress,
          city: form.shippingCity,
          state: form.shippingState,
          pincode: form.shippingPincode,
        }).catch(() => {})
      }
      const { data } = await orderApi.checkout({ ...shippingFields(), paymentMethod })
      await refresh()
      navigate(`/orders/success/${data.id}`, { replace: true })
    } catch (err) {
      setError(apiMessage(err, 'Checkout failed'))
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return <Loader label="Loading your bag…" />

  return (
    <div className="checkout-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Checkout · Step 2 of 2</span>
          <h1>Delivery &amp; payment</h1>
          <p className="muted">Almost there — tell us where your order should go.</p>
        </div>
      </div>

      <div className="checkout-layout">
        <form className="card checkout-form" onSubmit={submit}>
          <h2 className="form-section-title"><span>01</span> Delivery address</h2>
          <Alert type="error" onClose={() => setError('')}>{error}</Alert>

          {addresses.length > 0 && (
            <div className="address-options" role="radiogroup" aria-label="Saved addresses">
              {addresses.map((a) => (
                <label key={a.id} className={`address-option ${selected === String(a.id) ? 'is-selected' : ''}`}>
                  <input
                    type="radio" name="address" value={a.id}
                    checked={selected === String(a.id)}
                    onChange={() => setSelected(String(a.id))}
                  />
                  <span className="address-option-body">
                    <span className="address-label">
                      <PinIcon size={14} /> {a.label}
                      {a.isDefault && <span className="badge">Default</span>}
                    </span>
                    <strong>{a.fullName}</strong>
                    <span>{streetOf(a)}</span>
                    <span>{a.city}, {a.state} {a.pincode}</span>
                    <span className="muted">{a.phone}</span>
                  </span>
                </label>
              ))}
              <label className={`address-option address-new ${selected === NEW_ADDRESS ? 'is-selected' : ''}`}>
                <input
                  type="radio" name="address" value={NEW_ADDRESS}
                  checked={selected === NEW_ADDRESS}
                  onChange={() => setSelected(NEW_ADDRESS)}
                />
                <span className="address-option-body">
                  <span className="address-label"><PlusIcon size={14} /> New address</span>
                  <span className="muted">Deliver somewhere else</span>
                </span>
              </label>
            </div>
          )}

          {selected === NEW_ADDRESS && (
            <div className="new-address">
              <div className="form-row">
                <label>
                  Full name
                  <input name="shippingName" value={form.shippingName} onChange={change} required autoComplete="name" />
                </label>
                <label>
                  Phone
                  <input name="shippingPhone" value={form.shippingPhone} onChange={change} autoComplete="tel"
                         required pattern="[0-9+\- ]{8,20}" title="8–20 digits" />
                </label>
              </div>

              <label>
                Address
                <textarea name="shippingAddress" rows="2" value={form.shippingAddress}
                          onChange={change} required maxLength={255} autoComplete="street-address"
                          placeholder="House / flat, street, area" />
              </label>

              <div className="form-row form-row-3">
                <label>
                  City
                  <input name="shippingCity" value={form.shippingCity} onChange={change} required autoComplete="address-level2" />
                </label>
                <label>
                  State
                  <input name="shippingState" value={form.shippingState} onChange={change} required autoComplete="address-level1" />
                </label>
                <label>
                  PIN code
                  <input name="shippingPincode" value={form.shippingPincode} onChange={change} inputMode="numeric"
                         required pattern="[0-9]{4,10}" title="4–10 digits" autoComplete="postal-code" />
                </label>
              </div>

              <div className="save-address">
                <label className="checkbox">
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                  Save this address to my account
                </label>
                {saveAddress && (
                  <select value={label} onChange={(e) => setLabel(e.target.value)} aria-label="Address label">
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                )}
              </div>
            </div>
          )}

          <h2 className="form-section-title"><span>02</span> Payment method</h2>
          <div className="payment-options">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.value} className="radio">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.value}
                  checked={paymentMethod === m.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="radio-copy">
                  {m.label}
                  <span className="muted small">{m.note}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="muted small">
            No real payment gateway is called. Card and UPI orders are marked paid instantly;
            cash-on-delivery orders stay pending until they are delivered.
          </p>

          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy ? 'Placing order…' : `Place order · ${formatCurrency(cart.total)}`}
          </button>
          <p className="summary-note">
            <ShieldIcon size={16} strokeWidth={1.3} />
            By placing your order you agree to our <Link to="/terms">terms of sale</Link>.
          </p>
        </form>

        <aside className="summary">
          <h2>Your bag</h2>
          <ul className="summary-items">
            {cart.items.map((item) => (
              <li key={item.id}>
                <span className="summary-thumb">
                  {item.imageUrl && <img src={item.imageUrl} alt="" />}
                  <span className="summary-qty">{item.quantity}</span>
                </span>
                <span className="summary-name">{item.name}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span>
          </div>
          {Number(cart.discount) > 0 && (
            <div className="summary-row discount-row">
              <span>Promo {cart.couponCode}</span><span>− {formatCurrency(cart.discount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Delivery</span>
            <span>{Number(cart.shipping) === 0 ? 'Complimentary' : formatCurrency(cart.shipping)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span><span>{formatCurrency(cart.total)}</span>
          </div>
          {cart.couponCode && cart.couponMessage && (
            <p className="small muted">{cart.couponMessage}. <Link to="/cart">Edit bag</Link></p>
          )}
          {!cart.couponCode && <p className="small muted">Have a promo code? <Link to="/cart">Add it in your bag</Link>.</p>}
        </aside>
      </div>
    </div>
  )
}
