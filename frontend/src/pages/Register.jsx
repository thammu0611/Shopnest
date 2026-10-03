import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { apiMessage } from '../api/client.js'
import Alert from '../components/Alert.jsx'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const { register } = useAuth()
  const { refresh } = useCart()
  const navigate = useNavigate()

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    setError('')
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || null,
      })
      await refresh()
      navigate('/', { replace: true })
    } catch (err) {
      setError(apiMessage(err, 'Could not create your account'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Create your account</h1>
        <p className="muted">It takes about ten seconds.</p>

        <Alert type="error" onClose={() => setError('')}>{error}</Alert>

        <label>
          Full name
          <input name="name" value={form.name} onChange={change} required minLength={2} />
        </label>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={change} required />
        </label>

        <label>
          Phone (optional)
          <input name="phone" value={form.phone} onChange={change} />
        </label>

        <label>
          Password
          <input type="password" name="password" value={form.password}
                 onChange={change} required minLength={6} />
        </label>

        <label>
          Confirm password
          <input type="password" name="confirm" value={form.confirm}
                 onChange={change} required minLength={6} />
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>

        <p className="muted center">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
