import { useState } from 'react'
import { Link } from 'react-router-dom'
import { storeApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import usePageTitle from '../utils/usePageTitle.js'
import Alert from '../components/Alert.jsx'
import { CheckIcon, ClockIcon, MailIcon, ReturnIcon } from '../components/Icons.jsx'

const SUBJECTS = ['Order enquiry', 'Delivery', 'Cancellation or refund', 'Product question', 'Something else']

export default function Contact() {
  usePageTitle('Contact us')
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', subject: SUBJECTS[0], orderNumber: '', message: '',
  })
  const [error, setError] = useState('')
  const [sent, setSent] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data } = await storeApi.contact(form)
      setSent(data.message)
    } catch (err) {
      setError(apiMessage(err, 'Could not send your message'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="contact-page">
      <header className="info-head">
        <span className="eyebrow">Client services</span>
        <h1>How can we help?</h1>
        <p className="info-intro">Send us a note and a member of our team will reply by email.</p>
      </header>

      <div className="contact-layout">
        {sent ? (
          <div className="card contact-sent">
            <span className="success-badge"><CheckIcon size={30} strokeWidth={1.5} /></span>
            <h2>Message sent</h2>
            <p className="muted">{sent}</p>
            <Link to="/shop" className="btn btn-primary">Continue shopping</Link>
          </div>
        ) : (
          <form className="card" onSubmit={submit}>
            <Alert type="error" onClose={() => setError('')}>{error}</Alert>
            <div className="form-row">
              <label>Your name<input name="name" value={form.name} onChange={change} required maxLength={100} /></label>
              <label>Email<input type="email" name="email" value={form.email} onChange={change} required maxLength={150} /></label>
            </div>
            <div className="form-row">
              <label>
                Topic
                <select name="subject" value={form.subject} onChange={change}>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label>
                Order number <span className="muted small">(optional)</span>
                <input name="orderNumber" value={form.orderNumber} onChange={change} maxLength={40} placeholder="ORD-…" />
              </label>
            </div>
            <label>
              Message
              <textarea name="message" rows="6" value={form.message} onChange={change} required minLength={10} maxLength={2000} />
            </label>
            <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
          </form>
        )}

        <aside className="contact-aside">
          <div className="contact-point">
            <ClockIcon size={22} strokeWidth={1.2} />
            <div><strong>Quick replies</strong><p className="muted">We aim to answer every message within one business day.</p></div>
          </div>
          <div className="contact-point">
            <ReturnIcon size={22} strokeWidth={1.2} />
            <div><strong>Cancel in a click</strong><p className="muted">Orders can be cancelled from <Link to="/orders">My orders</Link> until they ship.</p></div>
          </div>
          <div className="contact-point">
            <MailIcon size={22} strokeWidth={1.2} />
            <div><strong>Answers, instantly</strong><p className="muted">Most questions are covered in our <Link to="/faq">FAQ</Link>.</p></div>
          </div>
        </aside>
      </div>
    </div>
  )
}
