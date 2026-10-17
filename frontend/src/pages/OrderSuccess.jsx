import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { formatCurrency, formatDate, statusClass } from '../utils/format.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'
import { CheckIcon } from '../components/Icons.jsx'

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    orderApi.get(id)
      .then(({ data }) => setOrder(data))
      .catch((err) => setError(apiMessage(err, 'Order not found')))
  }, [id])

  if (error) return <Alert type="error">{error}</Alert>
  if (!order) return <Loader label="Fetching your order…" />

  return (
    <div className="success-page">
      <div className="success-badge"><CheckIcon size={30} strokeWidth={1.5} /></div>
      <span className="eyebrow">Thank you</span>
      <h1>Your order is confirmed</h1>
      <p className="muted">
        Order <strong>{order.orderNumber}</strong> · {formatDate(order.createdAt)}
      </p>

      <div className="card order-card">
        <div className="order-head">
          <span className={statusClass(order.status)}>{order.status}</span>
          <span className={statusClass(order.paymentStatus)}>{order.paymentStatus}</span>
          <span className="muted">{order.paymentMethod} · {order.paymentReference}</span>
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
          <span>Total paid</span><span>{formatCurrency(order.totalAmount)}</span>
        </div>

        <div className="ship-to">
          <strong>Shipping to</strong>
          <p>
            {order.shippingName} · {order.shippingPhone}<br />
            {order.shippingAddress}, {order.shippingCity} — {order.shippingPincode}
          </p>
        </div>
      </div>

      <div className="success-actions">
        <Link to="/orders" className="btn btn-ghost">View all orders</Link>
        <Link to="/" className="btn btn-primary">Keep shopping</Link>
      </div>
    </div>
  )
}
