import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { storeApi, wishlistApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { describeOffer, formatCurrency } from '../utils/format.js'
import usePageTitle from '../utils/usePageTitle.js'
import Alert from '../components/Alert.jsx'
import Loader from '../components/Loader.jsx'
import Toast from '../components/Toast.jsx'
import PriceTag from '../components/PriceTag.jsx'
import { ArrowLeftIcon, ArrowRightIcon, BagIcon, CloseIcon, ShieldIcon, TagIcon } from '../components/Icons.jsx'

export default function Cart() {
  usePageTitle('Shopping bag')
  const { cart, loading, updateItem, removeItem, clearCart, applyCoupon, removeCoupon } = useCart()
  const { refresh: refreshWishlist } = useWishlist()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [code, setCode] = useState('')
  const [offers, setOffers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    storeApi.offers().then(({ data }) => setOffers(data)).catch(() => setOffers([]))
  }, [])

  const guard = async (id, action, success) => {
    setBusyId(id)
    setError('')
    try {
      await action()
      if (success) setNotice(success)
      return true
    } catch (err) {
      setError(apiMessage(err, 'Could not update your bag'))
      return false
    } finally {
      setBusyId(null)
    }
  }

  const handleApply = async (e, value = code) => {
    e?.preventDefault()
    if (!value.trim()) return
    const ok = await guard('coupon', () => applyCoupon(value.trim()), `${value.trim().toUpperCase()} applied`)
    if (ok) setCode('')
  }

  /** "Save for later": into the wishlist, out of the bag. */
  const saveForLater = (item) =>
    guard(item.id, async () => {
      await wishlistApi.add(item.productId)
      await removeItem(item.id)
      await refreshWishlist()
    }, `${item.name} saved to your wishlist`)

  if (loading && cart.items.length === 0) return <Loader label="Loading your bag…" />

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon"><BagIcon size={40} strokeWidth={1} /></span>
        <h1>Your bag is empty</h1>
        <p className="muted">Discover the collection and add the pieces you love.</p>
        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <Link to="/shop" className="btn btn-primary btn-lg">Explore the collection</Link>
          <Link to="/wishlist" className="btn btn-ghost btn-lg">View wishlist</Link>
        </div>
      </div>
    )
  }

  const threshold = Number(cart.freeShippingThreshold || 2000)
  const remaining = Math.max(0, threshold - Number(cart.subtotal))
  const progress = Math.min(100, (Number(cart.subtotal) / threshold) * 100)
  const mrpSavings = cart.items.reduce(
    (sum, i) => sum + (i.mrp && Number(i.mrp) > Number(i.price) ? (Number(i.mrp) - Number(i.price)) * i.quantity : 0),
    0
  )
  const totalSavings = mrpSavings + Number(cart.discount || 0)
  const unusedOffers = offers.filter((o) => o.code !== cart.couponCode)

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
                <PriceTag price={item.price} mrp={item.mrp} size="sm" />
                <span className="muted small">
                  {item.stock <= 5 ? `Only ${item.stock} left` : 'In stock'}
                </span>
                <div className="cart-line-actions">
                  <button
                    className="link-btn link-quiet"
                    disabled={busyId === item.id}
                    onClick={() => saveForLater(item)}
                  >Save for later</button>
                  <button
                    className="link-btn link-quiet"
                    disabled={busyId === item.id}
                    onClick={() => guard(item.id, () => removeItem(item.id))}
                  >Remove</button>
                </div>
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
            <Link to="/shop" className="btn btn-link"><ArrowLeftIcon size={16} /> Continue shopping</Link>
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

          <div className="coupon-box">
            {cart.couponCode ? (
              <div className={`coupon-applied ${cart.couponMessage ? 'is-pending' : ''}`}>
                <TagIcon size={18} />
                <div>
                  <strong>{cart.couponCode}</strong>
                  <span className="small">
                    {cart.couponMessage || cart.couponDescription || 'Applied to your order'}
                  </span>
                </div>
                <button
                  className="icon-btn"
                  aria-label="Remove code"
                  disabled={busyId === 'coupon'}
                  onClick={() => guard('coupon', removeCoupon, 'Code removed')}
                >
                  <CloseIcon size={16} />
                </button>
              </div>
            ) : (
              <form className="coupon-form" onSubmit={handleApply}>
                <input
                  placeholder="Promo code"
                  aria-label="Promo code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={30}
                />
                <button className="btn btn-ghost btn-sm" disabled={busyId === 'coupon' || !code.trim()}>Apply</button>
              </form>
            )}

            {unusedOffers.length > 0 && (
              <details className="offers">
                <summary>{unusedOffers.length} offer{unusedOffers.length === 1 ? '' : 's'} available</summary>
                <ul>
                  {unusedOffers.map((o) => (
                    <li key={o.code}>
                      <div>
                        <strong>{o.code}</strong>
                        <span className="small muted">{o.description || describeOffer(o)}</span>
                      </div>
                      <button
                        className="link-btn"
                        disabled={busyId === 'coupon'}
                        onClick={(e) => handleApply(e, o.code)}
                      >Apply</button>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          <div className="summary-row">
            <span>Subtotal ({cart.totalItems})</span>
            <span>{formatCurrency(cart.subtotal)}</span>
          </div>
          {Number(cart.discount) > 0 && (
            <div className="summary-row discount-row">
              <span>Promo {cart.couponCode}</span>
              <span>− {formatCurrency(cart.discount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Delivery</span>
            <span>{Number(cart.shipping) === 0 ? 'Complimentary' : formatCurrency(cart.shipping)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatCurrency(cart.total)}</span>
          </div>
          {totalSavings > 0 && (
            <p className="savings-note">You are saving {formatCurrency(totalSavings)} on this order</p>
          )}
          <button className="btn btn-primary btn-lg btn-block" onClick={() => navigate('/checkout')}>
            Proceed to checkout <ArrowRightIcon size={16} />
          </button>
          <p className="summary-note">
            <ShieldIcon size={16} strokeWidth={1.3} /> Secure checkout · Card, UPI or cash on delivery
          </p>
        </aside>
      </div>

      <Toast message={notice} onClose={() => setNotice('')} />
    </div>
  )
}
