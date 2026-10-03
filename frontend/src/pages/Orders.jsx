import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { formatCurrency, formatDate, statusClass } from '../utils/format.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    orderApi.mine()
      .then(({ data }) => setOrders(data))
      .catch((err) => setError(apiMessage(err, 'Could not load your orders')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader label="Loading your orders…" />

  return (
    <div className="orders-page">
      <div className="page-head">
        <div>
          <h1>My orders</h1>
          <p className="muted">
            {orders.length === 0
              ? 'Your order history will appear here.'
              : `${orders.length} order${orders.length === 1 ? '' : 's'} so far.`}
          </p>
        </div>
      </div>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p className="muted">You haven't placed any orders yet.</p>
          <Link to="/" className="btn btn-primary">Start shopping</Link>
        </div>
      ) : (
        orders.map((order) => (
          <div className="card order-card" key={order.id}>
            <div className="order-head">
              <div>
                <Link to={`/orders/${order.id}`} className="order-number">{order.orderNumber}</Link>
                <span className="muted"> · {formatDate(order.createdAt)}</span>
              </div>
              <div className="badges">
                <span className={statusClass(order.status)}>{order.status}</span>
                <span className={statusClass(order.paymentStatus)}>{order.paymentStatus}</span>
              </div>
            </div>

            {order.items.map((item) => (
              <div className="order-line" key={item.id}>
                {item.imageUrl && <img src={item.imageUrl} alt={item.productName} />}
                <div>
                  <strong>{item.productName}</strong>
                  <span className="muted"> × {item.quantity}</span>
                </div>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}

            <div className="summary-row total">
              <span>Total</span><span>{formatCurrency(order.totalAmount)}</span>
            </div>

            <div className="order-foot">
              <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm">
                View details{['PLACED', 'CONFIRMED'].includes(order.status) ? ' / cancel' : ''} →
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
