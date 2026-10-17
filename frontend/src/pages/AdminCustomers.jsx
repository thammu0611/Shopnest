import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { formatCurrency, formatDate } from '../utils/format.js'
import usePageTitle from '../utils/usePageTitle.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

export default function AdminCustomers() {
  usePageTitle('Customers')
  const [customers, setCustomers] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([adminApi.customers(), adminApi.subscribers()])
      .then(([c, s]) => { setCustomers(c.data); setSubscribers(s.data) })
      .catch((err) => setError(apiMessage(err, 'Could not load customers')))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => `${c.name} ${c.email} ${c.phone || ''}`.toLowerCase().includes(q))
  }, [customers, query])

  if (loading) return <Loader label="Loading customers…" />

  const buyers = customers.filter((c) => c.orderCount > 0).length

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Atelier</span>
          <h1>Customers</h1>
          <p className="muted">{customers.length} accounts · {buyers} have ordered · {subscribers.length} newsletter subscribers</p>
        </div>
        <input
          className="admin-search"
          type="search"
          placeholder="Search name, email or phone"
          aria-label="Search customers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

      <div className="table-wrap card">
        <table>
          <thead><tr><th>Customer</th><th>Phone</th><th>Role</th><th>Orders</th><th>Total spent</th><th>Joined</th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                  <div className="muted small">{c.email}</div>
                </td>
                <td>{c.phone || '—'}</td>
                <td><span className={`badge ${c.role === 'ROLE_ADMIN' ? 'badge-refunded' : ''}`}>{c.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}</span></td>
                <td>{c.orderCount}</td>
                <td>{formatCurrency(c.totalSpent)}</td>
                <td>{formatDate(c.memberSince)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="empty">No customers match “{query}”.</p>}
      </div>

      {subscribers.length > 0 && (
        <section className="card" style={{ marginTop: '1.5rem' }}>
          <h2>Newsletter subscribers</h2>
          <ul className="subscriber-list">
            {subscribers.map((s) => (
              <li key={s.id}><span>{s.email}</span><span className="muted small">{formatDate(s.subscribedAt)}</span></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
