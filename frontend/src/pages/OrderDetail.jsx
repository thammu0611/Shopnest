import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { orderApi } from '../api/endpoints.js'
import { useCart } from '../context/CartContext.jsx'
import usePageTitle from '../utils/usePageTitle.js'
import { PrinterIcon, RefreshIcon } from '../components/Icons.jsx'
import { apiMessage } from '../api/client.js'
import { formatCurrency, formatDate, statusClass } from '../utils/format.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

/** The happy path a parcel travels. CANCELLED sits outside it. */
const PIPELINE = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']
const CANCELLABLE = ['PLACED', 'CONFIRMED']

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [reordering, setReordering] = useState(false)
  const { addItem } = useCart()
  const navigate = useNavigate()
  usePageTitle(order ? `Order ${order.orderNumber}` : 'Order')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await orderApi.get(id)
      setOrder(data)
    } catch (err) {
      setError(apiMessage(err, 'Could not load that order'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const handleCancel = async () => {
    setCancelling(true)
    setError('')
    try {
      const { data } = await orderApi.cancel(id)
      setOrder(data)
      setConfirming(false)
      setNotice('Order cancelled. The items have been returned to stock.')
    } catch (err) {
      setError(apiMessage(err, 'Could not cancel this order'))
      setConfirming(false)
    } finally {
      setCancelling(false)
    }
  }

  /** Puts every still-available line back in the bag at its original quantity. */
  const handleBuyAgain = async () => {
    setReordering(true)
    setError('')
    const failed = []
    for (const item of order.items) {
      if (!item.productId) { failed.push(item.productName); continue }
      try {
        await addItem(item.productId, item.quantity)
      } catch {
        failed.push(item.productName)
      }
    }
    setReordering(false)
    if (failed.length === order.items.length) {
      setError('None of these items can be ordered again right now.')
    } else if (failed.length > 0) {
      setError(`Added to your bag, except: ${failed.join(', ')} (unavailable or low on stock).`)
    } else {
      navigate('/cart')
    }
  }

  if (loading) return <Loader label="Loading your order…" />
  if (!order) {
    return (
      <>
        <Alert type="error" onClose={() => setError('')}>{error}</Alert>
        <div className="empty-state card">
          <h2>Order not found</h2>
          <p className="muted">It may belong to a different account.</p>
          <Link to="/orders" className="btn btn-primary">Back to my orders</Link>
        </div>
      </>
    )
  }

  const cancelled = order.status === 'CANCELLED'
  const currentStep = PIPELINE.indexOf(order.status)
  const canCancel = CANCELLABLE.includes(order.status)

  return (
    <>
      <Link to="/orders" className="back-link">← Back to my orders</Link>

      <div className="page-head">
        <div>
          <h1>{order.orderNumber}</h1>
          <p className="muted">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="page-head-actions">
          <div className="badges">
            <span className={statusClass(order.status)}>{order.status}</span>
            <span className={statusClass(order.paymentStatus)}>{order.paymentStatus}</span>
          </div>
          <div className="form-actions">
            <Link to={`/orders/${order.id}/invoice`} className="btn btn-ghost btn-sm">
              <PrinterIcon size={15} /> Invoice
            </Link>
            <button className="btn btn-primary btn-sm" onClick={handleBuyAgain} disabled={reordering}>
              <RefreshIcon size={15} /> {reordering ? 'Adding…' : 'Buy again'}
            </button>
          </div>
        </div>
      </div>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>

      <section className="card">
        <h2>Progress</h2>
        {cancelled ? (
          <div className="timeline-cancelled">
            <span className="badge badge-cancelled">Cancelled</span>
            <p className="muted small">
              This order was cancelled and its items were returned to stock
              {order.paymentStatus === 'REFUNDED' ? ', and the payment was refunded.' : '.'}
            </p>
          </div>
        ) : (
          <ol className="timeline">
            {PIPELINE.map((step, index) => {
              const state = index < currentStep ? 'done' : index === currentStep ? 'current' : 'todo'
              return (
                <li key={step} className={`timeline-step is-${state}`}>
                  <span className="timeline-dot" aria-hidden="true">
                    {state === 'done' ? '✓' : ''}
                  </span>
                  <span className="timeline-label">{step}</span>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <div className="order-detail-layout">
        <section className="card">
          <h2>Items</h2>
          {order.items.map((item) => (
            <div key={item.id} className="order-line">
              {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" />}
              <div>
                {item.productId ? (
                  <Link to={`/products/${item.productId}`} className="cart-name">{item.productName}</Link>
                ) : (
                  <span className="cart-name">{item.productName}</span>
                )}
                <div className="muted small">
                  {formatCurrency(item.unitPrice)} × {item.quantity}
                </div>
              </div>
              <strong>{formatCurrency(item.subtotal)}</strong>
            </div>
          ))}

          <div className="summary-row" style={{ marginTop: '1rem' }}>
            <span>Items</span><span>{formatCurrency(order.subtotal)}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="summary-row discount-row">
              <span>Promo {order.couponCode}</span><span>− {formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Delivery</span>
            <span>{Number(order.shipping) > 0 ? formatCurrency(order.shipping) : 'Complimentary'}</span>
          </div>
          <div className="summary-row total">
            <span>Total paid</span><span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </section>

        <aside>
          <section className="card">
            <h2>Delivery</h2>
            <p className="ship-block">
              <strong>{order.shippingName}</strong><br />
              {order.shippingAddress}<br />
              {order.shippingCity}{order.shippingState ? `, ${order.shippingState}` : ''} — {order.shippingPincode}<br />
              {order.shippingPhone}
            </p>
          </section>

          <section className="card" style={{ marginTop: '1rem' }}>
            <h2>Payment</h2>
            <div className="summary-row"><span>Method</span><span>{order.paymentMethod}</span></div>
            <div className="summary-row"><span>Status</span><span>{order.paymentStatus}</span></div>
            {order.paymentReference && (
              <div className="summary-row"><span>Reference</span><span>{order.paymentReference}</span></div>
            )}
          </section>

          {canCancel && (
            <section className="card cancel-card" style={{ marginTop: '1rem' }}>
              <h2>Cancel this order</h2>
              {confirming ? (
                <>
                  <p className="muted small">
                    This cannot be undone. The items go back into stock
                    {order.paymentStatus === 'PAID' ? ' and the payment is refunded.' : '.'}
                  </p>
                  <div className="form-actions">
                    <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
                      {cancelling ? 'Cancelling…' : 'Yes, cancel it'}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setConfirming(false)} disabled={cancelling}>
                      Keep order
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="muted small">Possible until the order ships.</p>
                  <button className="btn btn-danger btn-block" onClick={() => setConfirming(true)}>
                    Cancel order
                  </button>
                </>
              )}
            </section>
          )}
        </aside>
      </div>
    </>
  )
}
