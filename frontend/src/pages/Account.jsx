import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { accountApi } from '../api/endpoints.js'
import usePageTitle from '../utils/usePageTitle.js'
import AddressBook from '../components/AddressBook.jsx'
import { apiMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency, formatDate } from '../utils/format.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'profile', label: 'Profile' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'security', label: 'Password' },
]

export default function Account() {
  usePageTitle('My account')
  const { refreshUser, logout } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'overview'
  const setTab = (key) => setParams(key === 'overview' ? {} : { tab: key })

  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [profile, setProfile] = useState({ name: '', phone: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    accountApi.get()
      .then(({ data }) => {
        setAccount(data)
        setProfile({ name: data.name ?? '', phone: data.phone ?? '' })
      })
      .catch((err) => setError(apiMessage(err, 'Could not load your account')))
      .finally(() => setLoading(false))
  }, [])

  const flash = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(''), 3000)
  }

  const handleProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setError('')
    try {
      const { data } = await accountApi.update(profile)
      setAccount(data)
      // Keep the name in the navbar in step with what was just saved.
      if (typeof refreshUser === 'function') await refreshUser()
      flash('Profile updated')
    } catch (err) {
      setError(apiMessage(err, 'Could not update your profile'))
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    setError('')

    if (passwords.newPassword !== passwords.confirm) {
      setError('The two new passwords do not match')
      return
    }

    setSavingPassword(true)
    try {
      await accountApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' })
      flash('Password changed. Your current session stays signed in.')
    } catch (err) {
      setError(apiMessage(err, 'Could not change your password'))
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) return <Loader label="Loading your account…" />
  if (!account) {
    return (
      <>
        <Alert type="error" onClose={() => setError('')}>{error}</Alert>
        <p className="empty">Your account could not be loaded.</p>
      </>
    )
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Welcome back, {account.name.split(' ')[0]}</span>
          <h1>My account</h1>
          <p className="muted">
            {account.email} · member since {formatDate(account.memberSince)}
          </p>
        </div>
      </div>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>

      <div className="tab-list account-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key}
                  className={tab === t.key ? 'is-active' : ''} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (<>
      <section className="stat-grid">
        <Link to="/orders" className="stat-tile card">
          <span className="stat-label">Orders placed</span>
          <strong className="stat-value">{account.orderCount}</strong>
        </Link>
        <div className="stat-tile card">
          <span className="stat-label">Total spent</span>
          <strong className="stat-value">{formatCurrency(account.totalSpent)}</strong>
        </div>
        <Link to="/wishlist" className="stat-tile card">
          <span className="stat-label">Saved products</span>
          <strong className="stat-value">{account.wishlistCount}</strong>
        </Link>
        <div className="stat-tile card">
          <span className="stat-label">Reviews written</span>
          <strong className="stat-value">{account.reviewCount}</strong>
        </div>
      </section>

      <div className="account-shortcuts">
        <Link to="/orders" className="card shortcut">
          <strong>Orders &amp; returns</strong>
          <span className="muted small">Track, cancel or reorder</span>
        </Link>
        <button className="card shortcut" onClick={() => setTab('addresses')}>
          <strong>Address book</strong>
          <span className="muted small">Manage delivery addresses</span>
        </button>
        <Link to="/wishlist" className="card shortcut">
          <strong>Wishlist</strong>
          <span className="muted small">Pieces you saved for later</span>
        </Link>
        <Link to="/contact" className="card shortcut">
          <strong>Need help?</strong>
          <span className="muted small">Write to client services</span>
        </Link>
      </div>
      </>)}

      {tab === 'addresses' && <AddressBook onNotice={flash} />}

      <div className="account-layout">
        {tab === 'profile' && (
        <form className="card" onSubmit={handleProfile}>
          <h2>Profile</h2>
          <p className="muted small">Your email address is used to sign in and cannot be changed.</p>

          <label>
            Full name
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
              minLength={2}
              maxLength={100}
            />
          </label>

          <label>
            Phone
            <input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Optional"
              maxLength={20}
            />
          </label>

          <label>
            Email
            <input value={account.email} disabled />
          </label>

          <button className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </form>
        )}

        {tab === 'security' && (
        <form className="card" onSubmit={handlePassword}>
          <h2>Change password</h2>
          <p className="muted small">Use at least 6 characters.</p>

          <label>
            Current password
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              required
              autoComplete="current-password"
            />
          </label>

          <label>
            New password
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          <button className="btn btn-primary" disabled={savingPassword}>
            {savingPassword ? 'Updating…' : 'Update password'}
          </button>
        </form>
        )}

        {tab === 'security' && (
          <div className="card">
            <h2>Signed in</h2>
            <p className="muted small">You are signed in on this device as {account.email}.</p>
            <button className="btn btn-ghost" onClick={logout}>Sign out</button>
          </div>
        )}
      </div>
    </>
  )
}
