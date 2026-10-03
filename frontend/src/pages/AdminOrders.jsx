import { useEffect, useState } from 'react'
import { orderApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { formatCurrency, formatDate, statusClass } from '../utils/format.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

const STATUSES = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    setLoading(true)
    orderApi.all()
      .then(({ data }) => setOrders(data))
      .catch((err) => setError(apiMessage(err, 'Could not load orders')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const changeStatus = async (order, status) => {
    setBusyId(order.id)
    setError('')
    try {
      const { data } = await orderApi.updateStatus(order.id, status)
      setOrders((prev) => prev.map((o) => (o.id === data.id ? data : o)))
    } catch (err) {
      setError(apiMessage(err, 'Could not update the order'))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Loader label="Loading orders…" />

  return (
    <div className="admin-page">
      <h1>All orders</h1>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

      {orders.length === 0 ? (
        <p className="empty">No orders yet.</p>
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Items</th><th>Total</th>
                <th>Payment</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.orderNumber}</strong>
                    <div className="muted small">{formatDate(o.createdAt)}</div>
                  </td>
                  <td>
                    {o.customerName}
                    <div className="muted small">{o.customerEmail}</div>
                  </td>
                  <td>{o.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                  <td>{formatCurrency(o.totalAmount)}</td>
                  <td>
                    <span className={statusClass(o.paymentStatus)}>{o.paymentStatus}</span>
                    <div className="muted small">{o.paymentMethod}</div>
                  </td>
                  <td>
                    <select
                      value={o.status}
                      disabled={busyId === o.id}
                      onChange={(e) => changeStatus(o, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
