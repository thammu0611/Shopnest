import { useEffect, useState } from 'react'
import { addressApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import Alert from './Alert.jsx'
import Loader from './Loader.jsx'
import { PinIcon, PlusIcon } from './Icons.jsx'

const BLANK = {
  label: 'Home', fullName: '', phone: '', line1: '', line2: '',
  city: '', state: '', pincode: '', makeDefault: false,
}

/** Saved delivery addresses: list, add, edit, delete, make default. */
export default function AddressBook({ onNotice }) {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)        // null = closed
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () =>
    addressApi.list()
      .then(({ data }) => setAddresses(data))
      .catch((err) => setError(apiMessage(err, 'Could not load your addresses')))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const change = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const openNew = () => { setEditingId(null); setForm({ ...BLANK, makeDefault: addresses.length === 0 }) }
  const openEdit = (a) => {
    setEditingId(a.id)
    setForm({ ...BLANK, ...a, line2: a.line2 || '', makeDefault: a.isDefault })
  }

  const run = async (action, message) => {
    setBusy(true)
    setError('')
    try {
      await action()
      await load()
      onNotice?.(message)
      return true
    } catch (err) {
      setError(apiMessage(err, 'Could not save that address'))
      return false
    } finally {
      setBusy(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    const payload = { ...form }
    delete payload.id
    delete payload.isDefault
    const ok = await run(
      () => (editingId ? addressApi.update(editingId, payload) : addressApi.create(payload)),
      editingId ? 'Address updated' : 'Address saved'
    )
    if (ok) setForm(null)
  }

  if (loading) return <Loader label="Loading addresses…" />

  return (
    <section className="address-book">
      <div className="section-head">
        <div>
          <h2>Address book</h2>
          <p className="muted small">Saved addresses appear at checkout so you can order in one tap.</p>
        </div>
        {!form && (
          <button className="btn btn-ghost btn-sm" onClick={openNew} disabled={addresses.length >= 10}>
            <PlusIcon size={15} /> Add address
          </button>
        )}
      </div>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>

      {form && (
        <form className="card address-form" onSubmit={submit}>
          <h3>{editingId ? 'Edit address' : 'New address'}</h3>
          <div className="form-row form-row-3">
            <label>
              Label
              <select name="label" value={form.label} onChange={change}>
                <option>Home</option><option>Work</option><option>Other</option>
              </select>
            </label>
            <label>
              Full name
              <input name="fullName" value={form.fullName} onChange={change} required maxLength={100} />
            </label>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={change} required pattern="[0-9+\- ]{8,20}" title="8–20 digits" />
            </label>
          </div>
          <label>
            Address line 1
            <input name="line1" value={form.line1} onChange={change} required maxLength={200} placeholder="House / flat, street" />
          </label>
          <label>
            Address line 2 <span className="muted small">(optional)</span>
            <input name="line2" value={form.line2} onChange={change} maxLength={200} placeholder="Area, landmark" />
          </label>
          <div className="form-row form-row-3">
            <label>City<input name="city" value={form.city} onChange={change} required maxLength={80} /></label>
            <label>State<input name="state" value={form.state} onChange={change} required maxLength={80} /></label>
            <label>
              PIN code
              <input name="pincode" value={form.pincode} onChange={change} required pattern="[0-9]{4,10}" title="4–10 digits" inputMode="numeric" />
            </label>
          </div>
          <label className="checkbox">
            <input type="checkbox" name="makeDefault" checked={form.makeDefault} onChange={change} />
            Use as my default address
          </label>
          <div className="form-actions" style={{ marginTop: '1.25rem' }}>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save address'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !form ? (
        <div className="empty-state card">
          <span className="empty-icon"><PinIcon size={36} strokeWidth={1} /></span>
          <h3>No saved addresses yet</h3>
          <p className="muted">Add one now, or tick “save this address” at checkout.</p>
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((a) => (
            <article key={a.id} className={`card address-card ${a.isDefault ? 'is-default' : ''}`}>
              <span className="address-label">
                <PinIcon size={14} /> {a.label}
                {a.isDefault && <span className="badge badge-confirmed">Default</span>}
              </span>
              <strong>{a.fullName}</strong>
              <p>
                {a.line1}{a.line2 && <><br />{a.line2}</>}<br />
                {a.city}, {a.state} {a.pincode}<br />
                <span className="muted">{a.phone}</span>
              </p>
              <div className="address-actions">
                <button className="link-btn link-quiet" onClick={() => openEdit(a)} disabled={busy}>Edit</button>
                {!a.isDefault && (
                  <button className="link-btn link-quiet" disabled={busy}
                          onClick={() => run(() => addressApi.makeDefault(a.id), 'Default address updated')}>
                    Make default
                  </button>
                )}
                <button className="link-btn link-quiet" disabled={busy}
                        onClick={() => run(() => addressApi.remove(a.id), 'Address removed')}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
