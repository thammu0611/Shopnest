import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderApi } from '../api/endpoints.js'
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
  const itemsTotal = order.items.reduce((sum, i) => sum + Number(i.subtotal), 0)
  const shipping = Number(order.totalAmount) - itemsTotal

  return (
    <>
      <Link to="/orders" className="back-link">← Back to my orders</Link>

      <div className="page-head">
        <div>
          <h1>{order.orderNumber}</h1>
          <p className="muted">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="badges">
          <span className={statusClass(order.status)}>{order.status}</span>
          <span className={statusClass(order.paymentStatus)}>{order.paymentStatus}</span>
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
            <span>Items</span><span>{formatCurrency(itemsTotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping > 0 ? formatCurrency(shipping) : 'Free'}</span>
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
              {order.shippingCity} — {order.shippingPincode}<br />
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
