import { useState } from 'react'
import { storeApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setStatus({ type: '', text: '' })
    try {
      const { data } = await storeApi.subscribe(email.trim())
      setStatus({ type: 'ok', text: data.message })
      setEmail('')
    } catch (err) {
      setStatus({ type: 'error', text: apiMessage(err, 'Please enter a valid email address') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="newsletter">
      <div>
        <span className="eyebrow">The ShopNest letter</span>
        <h2>New arrivals and private offers, once a month.</h2>
        <p className="muted">No noise — just the edit. Unsubscribe whenever you like.</p>
      </div>
      <form className="newsletter-form" onSubmit={submit}>
        <input
          type="email"
          required
          placeholder="Your email address"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Joining…' : 'Subscribe'}</button>
        {status.text && (
          <p className={`newsletter-status ${status.type === 'error' ? 'is-error' : ''}`} role="status">
            {status.text}
          </p>
        )}
      </form>
    </section>
  )
}
