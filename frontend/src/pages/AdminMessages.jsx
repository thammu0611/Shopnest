import { useEffect, useState } from 'react'
import { adminApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { formatDate } from '../utils/format.js'
import usePageTitle from '../utils/usePageTitle.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'
import { MailIcon } from '../components/Icons.jsx'

export default function AdminMessages() {
  usePageTitle('Inbox')
  const [messages, setMessages] = useState([])
  const [showResolved, setShowResolved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    adminApi.messages()
      .then(({ data }) => setMessages(data))
      .catch((err) => setError(apiMessage(err, 'Could not load messages')))
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (m) => {
    setBusyId(m.id)
    try {
      const { data } = await adminApi.setMessageResolved(m.id, !m.resolved)
      setMessages((prev) => prev.map((x) => (x.id === data.id ? data : x)))
    } catch (err) {
      setError(apiMessage(err, 'Could not update the message'))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Loader label="Loading inbox…" />

  const open = messages.filter((m) => !m.resolved)
  const shown = showResolved ? messages : open

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Atelier</span>
          <h1>Inbox</h1>
          <p className="muted">{open.length} open · {messages.length - open.length} resolved</p>
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
          Show resolved
        </label>
      </div>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

      {shown.length === 0 ? (
        <div className="empty-state card">
          <span className="empty-icon"><MailIcon size={36} strokeWidth={1} /></span>
          <h3>Inbox zero</h3>
          <p className="muted">Messages sent from the contact page will appear here.</p>
        </div>
      ) : (
        <div className="message-list">
          {shown.map((m) => (
            <article key={m.id} className={`card message ${m.resolved ? 'is-resolved' : ''}`}>
              <header className="message-head">
                <div>
                  <strong>{m.subject}</strong>
                  {m.orderNumber && <span className="badge">{m.orderNumber}</span>}
                  <div className="muted small">
                    {m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`}>{m.email}</a> · {formatDate(m.createdAt)}
                  </div>
                </div>
                <button className={`btn btn-sm ${m.resolved ? 'btn-ghost' : 'btn-primary'}`}
                        disabled={busyId === m.id} onClick={() => toggle(m)}>
                  {m.resolved ? 'Reopen' : 'Mark resolved'}
                </button>
              </header>
              <p className="message-body">{m.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
