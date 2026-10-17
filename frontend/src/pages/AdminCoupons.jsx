import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { describeOffer, formatDate } from '../utils/format.js'
import usePageTitle from '../utils/usePageTitle.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

const EMPTY = {
  code: '', description: '', discountType: 'PERCENT', value: '', minOrderAmount: '',
  maxDiscount: '', expiresAt: '', usageLimit: '', oncePerCustomer: false, active: true,
}

const numOrNull = (v) => (v === '' || v == null ? null : Number(v))

function couponState(c) {
  if (!c.active) return ['Paused', 'badge-pending']
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return ['Expired', 'badge-cancelled']
  if (c.usageLimit && c.usedCount >= c.usageLimit) return ['Used up', 'badge-cancelled']
  return ['Live', 'badge-confirmed']
}

export default function AdminCoupons() {
  usePageTitle('Coupons')
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi.coupons()
      setCoupons(data)
    } catch (err) {
      setError(apiMessage(err, 'Could not load coupons'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const change = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : name === 'code' ? value.toUpperCase() : value })
  }
  const reset = () => { setForm(EMPTY); setEditingId(null) }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const payload = {
      ...form,
      value: Number(form.value),
      minOrderAmount: numOrNull(form.minOrderAmount),
      maxDiscount: form.discountType === 'PERCENT' ? numOrNull(form.maxDiscount) : null,
      usageLimit: numOrNull(form.usageLimit),
      expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59` : null,
    }
    try {
      if (editingId) await adminApi.updateCoupon(editingId, payload)
      else await adminApi.createCoupon(payload)
      setNotice(editingId ? `${payload.code} updated` : `${payload.code} created`)
      reset()
      await load()
    } catch (err) {
      setError(apiMessage(err, 'Could not save the coupon'))
    } finally {
      setBusy(false)
    }
  }

  const edit = (c) => {
    setEditingId(c.id)
    setForm({
      code: c.code, description: c.description || '', discountType: c.discountType,
      value: String(c.value), minOrderAmount: c.minOrderAmount ?? '', maxDiscount: c.maxDiscount ?? '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '', usageLimit: c.usageLimit ?? '',
      oncePerCustomer: c.oncePerCustomer, active: c.active,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (c) => {
    try {
      await adminApi.removeCoupon(c.id)
      setNotice(`${c.code} deleted`)
      await load()
    } catch (err) {
      setError(apiMessage(err, 'Could not delete the coupon'))
    }
  }

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Atelier</span>
          <h1>Coupons &amp; offers</h1>
          <p className="muted">Live codes are listed to shoppers under “offers available” in the bag.</p>
        </div>
      </div>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>

      <form className="card admin-form" onSubmit={submit}>
        <h2>{editingId ? `Edit ${form.code}` : 'New coupon'}</h2>
        <div className="form-row form-row-3">
          <label>Code<input name="code" value={form.code} onChange={change} required maxLength={30} pattern="[A-Za-z0-9_\-]+" placeholder="SUMMER20" /></label>
          <label>
            Type
            <select name="discountType" value={form.discountType} onChange={change}>
              <option value="PERCENT">Percentage off</option>
              <option value="FLAT">Fixed amount off</option>
            </select>
          </label>
          <label>
            {form.discountType === 'PERCENT' ? 'Percent (%)' : 'Amount (₹)'}
            <input type="number" name="value" min="1" step="0.01" max={form.discountType === 'PERCENT' ? 90 : undefined}
                   value={form.value} onChange={change} required />
          </label>
        </div>
        <label>Description<input name="description" value={form.description} onChange={change} maxLength={200} placeholder="Shown to shoppers" /></label>
        <div className="form-row form-row-4">
          <label>Min. order (₹)<input type="number" name="minOrderAmount" min="0" value={form.minOrderAmount} onChange={change} /></label>
          <label>
            Max. discount (₹)
            <input type="number" name="maxDiscount" min="1" value={form.maxDiscount} onChange={change}
                   disabled={form.discountType !== 'PERCENT'} />
          </label>
          <label>Total uses<input type="number" name="usageLimit" min="1" value={form.usageLimit} onChange={change} placeholder="Unlimited" /></label>
          <label>Expires on<input type="date" name="expiresAt" value={form.expiresAt} onChange={change} /></label>
        </div>
        <div className="form-checks">
          <label className="checkbox">
            <input type="checkbox" name="oncePerCustomer" checked={form.oncePerCustomer} onChange={change} />
            Once per customer
          </label>
          <label className="checkbox">
            <input type="checkbox" name="active" checked={form.active} onChange={change} />
            Active
          </label>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Update coupon' : 'Create coupon'}</button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>

      {loading ? <Loader label="Loading coupons…" /> : (
        <div className="table-wrap card">
          <table>
            <thead><tr><th>Code</th><th>Offer</th><th>Used</th><th>Expires</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {coupons.map((c) => {
                const [label, cls] = couponState(c)
                return (
                  <tr key={c.id}>
                    <td><strong className="coupon-code">{c.code}</strong></td>
                    <td>
                      {describeOffer(c)}
                      {c.oncePerCustomer && <div className="muted small">Once per customer</div>}
                    </td>
                    <td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                    <td>{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</td>
                    <td><span className={`badge ${cls}`}>{label}</span></td>
                    <td className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => edit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {coupons.length === 0 && <p className="empty">No coupons yet.</p>}
        </div>
      )}
    </div>
  )
}
