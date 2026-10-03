import { useCallback, useEffect, useState } from 'react'
import { categoryApi, productApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { formatCurrency } from '../utils/format.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

const EMPTY = {
  name: '', description: '', price: '', imageUrl: '',
  stock: '', categoryId: '', active: true,
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([
        productApi.adminList(),
        categoryApi.list(),
      ])
      setProducts(p.data)
      setCategories(c.data)
    } catch (err) {
      setError(apiMessage(err, 'Could not load the catalogue'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const change = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const reset = () => { setForm(EMPTY); setEditingId(null) }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      imageUrl: form.imageUrl || null,
      stock: Number(form.stock),
      active: form.active,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    }
    try {
      if (editingId) {
        await productApi.update(editingId, payload)
        setNotice('Product updated')
      } else {
        await productApi.create(payload)
        setNotice('Product created')
      }
      reset()
      await load()
    } catch (err) {
      setError(apiMessage(err, 'Could not save the product'))
    } finally {
      setBusy(false)
      setTimeout(() => setNotice(''), 2500)
    }
  }

  const edit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      imageUrl: product.imageUrl || '',
      stock: String(product.stock),
      categoryId: product.categoryId ? String(product.categoryId) : '',
      active: product.active,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (product) => {
    setError('')
    try {
      await productApi.remove(product.id)
      setNotice(`${product.name} deactivated`)
      await load()
    } catch (err) {
      setError(apiMessage(err, 'Could not remove the product'))
    }
  }

  return (
    <div className="admin-page">
      <h1>Product management</h1>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>

      <form className="card admin-form" onSubmit={submit}>
        <h2>{editingId ? 'Edit product' : 'Add a product'}</h2>

        <div className="form-row">
          <label>
            Name
            <input name="name" value={form.name} onChange={change} required />
          </label>
          <label>
            Category
            <select name="categoryId" value={form.categoryId} onChange={change}>
              <option value="">Uncategorised</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>

        <label>
          Description
          <textarea name="description" rows="2" value={form.description} onChange={change} />
        </label>

        <div className="form-row">
          <label>
            Price (₹)
            <input type="number" name="price" min="1" step="0.01"
                   value={form.price} onChange={change} required />
          </label>
          <label>
            Stock
            <input type="number" name="stock" min="0" value={form.stock} onChange={change} required />
          </label>
        </div>

        <label>
          Image URL
          <input name="imageUrl" value={form.imageUrl} onChange={change}
                 placeholder="https://…" />
        </label>

        <label className="checkbox">
          <input type="checkbox" name="active" checked={form.active} onChange={change} />
          Visible in the store
        </label>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Update product' : 'Create product'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>
          )}
        </div>
      </form>

      {loading ? <Loader label="Loading catalogue…" /> : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Visible</th><th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-product">
                      {p.imageUrl && <img src={p.imageUrl} alt="" />}
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.categoryName || '—'}</td>
                  <td>{formatCurrency(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <span className={p.active ? 'badge badge-confirmed' : 'badge badge-cancelled'}>
                      {p.active ? 'LIVE' : 'HIDDEN'}
                    </span>
                  </td>
                  <td className="row-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => edit(p)}>Edit</button>
                    {p.active && (
                      <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
