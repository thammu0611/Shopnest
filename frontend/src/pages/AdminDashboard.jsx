import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { formatCurrency } from '../utils/format.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

/** Order of the pipeline, so the status bars always read left to right. */
const STATUS_ORDER = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardApi.get()
      .then(({ data }) => setData(data))
      .catch((err) => setError(apiMessage(err, 'Could not load the dashboard')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader label="Crunching the numbers…" />
  if (!data) {
    return (
      <>
        <Alert type="error" onClose={() => setError('')}>{error}</Alert>
        <p className="empty">The dashboard could not be loaded.</p>
      </>
    )
  }

  const statuses = STATUS_ORDER.filter((s) => s in data.ordersByStatus)
  const busiest = Math.max(1, ...statuses.map((s) => data.ordersByStatus[s]))
  const topUnits = Math.max(1, ...data.topSellers.map((p) => p.unitsSold))

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Atelier</span>
          <h1>Dashboard</h1>
          <p className="muted">Everything happening across the store right now.</p>
        </div>
      </div>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

      <section className="stat-grid">
        <div className="stat-tile card stat-tile-accent">
          <span className="stat-label">Revenue</span>
          <strong className="stat-value">{formatCurrency(data.totalRevenue)}</strong>
          <span className="stat-note">excludes cancelled orders</span>
        </div>
        <div className="stat-tile card">
          <span className="stat-label">Orders</span>
          <strong className="stat-value">{data.totalOrders}</strong>
          <span className="stat-note">{formatCurrency(data.averageOrderValue)} average</span>
        </div>
        <div className="stat-tile card">
          <span className="stat-label">Products</span>
          <strong className="stat-value">{data.totalProducts}</strong>
        </div>
        <div className="stat-tile card">
          <span className="stat-label">Customers</span>
          <strong className="stat-value">{data.totalCustomers}</strong>
        </div>
      </section>

      <section className="stat-grid stat-grid-compact">
        <Link to="/admin/messages" className="stat-tile card">
          <span className="stat-label">Open messages</span>
          <strong className="stat-value">{data.openMessages}</strong>
          <span className="stat-note">from the contact page</span>
        </Link>
        <Link to="/admin/coupons" className="stat-tile card">
          <span className="stat-label">Live coupons</span>
          <strong className="stat-value">{data.activeCoupons}</strong>
          <span className="stat-note">shown to shoppers</span>
        </Link>
        <Link to="/admin/customers" className="stat-tile card">
          <span className="stat-label">Subscribers</span>
          <strong className="stat-value">{data.subscribers}</strong>
          <span className="stat-note">on the newsletter</span>
        </Link>
      </section>

      <div className="dash-layout">
        <section className="card">
          <div className="section-head">
            <h2>Orders by status</h2>
            <Link to="/admin/orders" className="small">Manage orders →</Link>
          </div>

          {data.totalOrders === 0 ? (
            <p className="empty">No orders yet.</p>
          ) : (
            <ul className="bar-list">
              {statuses.map((status) => (
                <li key={status}>
                  <div className="bar-head">
                    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
                    <strong>{data.ordersByStatus[status]}</strong>
                  </div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill bar-${status.toLowerCase()}`}
                      style={{ width: `${(data.ordersByStatus[status] / busiest) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="section-head">
            <h2>Low stock</h2>
            <Link to="/admin/products" className="small">Manage products →</Link>
          </div>

          {data.lowStock.length === 0 ? (
            <p className="empty">Every product is comfortably stocked.</p>
          ) : (
            <ul className="mini-list">
              {data.lowStock.map((p) => (
                <li key={p.productId}>
                  {p.imageUrl && <img src={p.imageUrl} alt="" loading="lazy" />}
                  <div>
                    <Link to={`/products/${p.productId}`}>{p.name}</Link>
                  </div>
                  <span className={`badge ${p.stock === 0 ? 'badge-cancelled' : 'badge-pending'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card">
        <div className="section-head">
          <h2>Best sellers</h2>
        </div>

        {data.topSellers.length === 0 ? (
          <p className="empty">No sales recorded yet.</p>
        ) : (
          <ul className="mini-list seller-list">
            {data.topSellers.map((p, index) => (
              <li key={p.productId}>
                <span className="rank">{index + 1}</span>
                {p.imageUrl && <img src={p.imageUrl} alt="" loading="lazy" />}
                <div className="seller-main">
                  <Link to={`/products/${p.productId}`}>{p.name}</Link>
                  <div className="bar-track bar-track-sm">
                    <div className="bar-fill bar-accent" style={{ width: `${(p.unitsSold / topUnits) * 100}%` }} />
                  </div>
                </div>
                <div className="seller-figures">
                  <strong>{formatCurrency(p.revenue)}</strong>
                  <span className="muted small">{p.unitsSold} sold</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
