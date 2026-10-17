import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import usePageTitle from '../utils/usePageTitle.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

const EMPTY = { name: '', description: '', imageUrl: '' }

export default function AdminCategories() {
  usePageTitle('Categories')
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    try {
      const { data } = await categoryApi.list()
      setCategories(data)
    } catch (err) {
      setError(apiMessage(err, 'Could not load categories'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const reset = () => { setForm(EMPTY); setEditingId(null) }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = { ...form, imageUrl: form.imageUrl || null }
      if (editingId) await categoryApi.update(editingId, payload)
      else await categoryApi.create(payload)
      setNotice(editingId ? 'Category updated' : 'Category created')
      reset()
      await load()
    } catch (err) {
      setError(apiMessage(err, 'Could not save the category'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (c) => {
    setError('')
    try {
      await categoryApi.remove(c.id)
      setNotice(`${c.name} deleted`)
      await load()
    } catch (err) {
      setError(apiMessage(err, 'Could not delete the category'))
    }
  }

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Atelier</span>
          <h1>Categories</h1>
          <p className="muted">Organise the catalogue and set the tiles shown on the home page.</p>
        </div>
      </div>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>

      <div className="admin-split">
        <form className="card admin-form" onSubmit={submit}>
          <h2>{editingId ? 'Edit category' : 'New category'}</h2>
          <label>Name<input name="name" value={form.name} onChange={change} required maxLength={80} /></label>
          <label>
            Description
            <textarea name="description" rows="2" value={form.description} onChange={change} maxLength={255} />
          </label>
          <label>
            Tile image URL
            <input name="imageUrl" value={form.imageUrl} onChange={change} placeholder="https://…" maxLength={500} />
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
          </div>
        </form>

        {loading ? <Loader label="Loading categories…" /> : (
          <div className="table-wrap card">
            <table>
              <thead><tr><th>Category</th><th>Live products</th><th></th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="cell-product">
                        {c.imageUrl && <img src={c.imageUrl} alt="" />}
                        <div>
                          <Link to={`/shop?category=${c.id}`}>{c.name}</Link>
                          <div className="muted small">{c.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.productCount}</td>
                    <td className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => {
                        setEditingId(c.id)
                        setForm({ name: c.name, description: c.description || '', imageUrl: c.imageUrl || '' })
                      }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
