import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { apiMessage } from '../api/client.js'
import Alert from '../components/Alert.jsx'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const { login } = useAuth()
  const { refresh } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await login(form.email, form.password)
      await refresh()
      navigate(user.role === 'ROLE_ADMIN' && redirectTo === '/' ? '/admin' : redirectTo, { replace: true })
    } catch (err) {
      setError(apiMessage(err, 'Invalid email or password'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <aside className="auth-visual" aria-hidden="true">
        <img src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=80" alt="" />
        <div className="auth-visual-copy">
          <span className="eyebrow">Members</span>
          <p>Your wishlist, your orders and your reviews — all in one quiet place.</p>
        </div>
      </aside>
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">Client account</span>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to continue to your ShopNest account.</p>

        <Alert type="error" onClose={() => setError('')}>{error}</Alert>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={change} required />
        </label>

        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={change} required />
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="muted center">
          New here? <Link to="/register">Create an account</Link>
        </p>

        <div className="demo-box">
          <strong>Demo logins</strong>
          <span>Customer — user@shopnest.com / User@123</span>
          <span>Admin — admin@shopnest.com / Admin@123</span>
        </div>
      </form>
    </div>
  )
}
