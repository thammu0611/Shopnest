import { useCallback, useEffect, useState } from 'react'
import { categoryApi, productApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'
import PriceTag from '../components/PriceTag.jsx'
import usePageTitle from '../utils/usePageTitle.js'

const EMPTY = {
  name: '', brand: '', description: '', price: '', mrp: '', imageUrl: '', images: '',
  stock: '', categoryId: '', active: true, featured: false,
}

export default function AdminProducts() {
  usePageTitle('Products')
  const [query, setQuery] = useState('')
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
      brand: form.brand || null,
      description: form.description,
      price: Number(form.price),
      mrp: form.mrp ? Number(form.mrp) : null,
      imageUrl: form.imageUrl || null,
      images: form.images.split('\n').map((u) => u.trim()).filter(Boolean),
      stock: Number(form.stock),
      active: form.active,
      featured: form.featured,
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
      brand: product.brand || '',
      description: product.description || '',
      price: String(product.price),
      mrp: product.mrp ? String(product.mrp) : '',
      imageUrl: product.imageUrl || '',
      images: (product.images || []).join('\n'),
      stock: String(product.stock),
      categoryId: product.categoryId ? String(product.categoryId) : '',
      active: product.active,
      featured: Boolean(product.featured),
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
      <div className="page-head">
        <div>
          <span className="eyebrow">Atelier</span>
          <h1>Products</h1>
          <p className="muted">{products.length} products · {products.filter((p) => p.active).length} live</p>
        </div>
      </div>
      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>

      <form className="card admin-form" onSubmit={submit}>
        <h2>{editingId ? 'Edit product' : 'Add a product'}</h2>

        <div className="form-row form-row-3">
          <label>
            Name
            <input name="name" value={form.name} onChange={change} required />
          </label>
          <label>
            Brand
            <input name="brand" value={form.brand} onChange={change} maxLength={80} />
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

        <div className="form-row form-row-3">
          <label>
            Selling price (₹)
            <input type="number" name="price" min="1" step="0.01"
                   value={form.price} onChange={change} required />
          </label>
          <label>
            MRP (₹) <span className="muted small">optional</span>
            <input type="number" name="mrp" min="1" step="0.01"
                   value={form.mrp} onChange={change} placeholder="Shows as on sale" />
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

        <label>
          Gallery images <span className="muted small">one URL per line, up to 8</span>
          <textarea name="images" rows="2" value={form.images} onChange={change} placeholder="https://…" />
        </label>

        <div className="form-checks">
          <label className="checkbox">
            <input type="checkbox" name="active" checked={form.active} onChange={change} />
            Visible in the store
          </label>
          <label className="checkbox">
            <input type="checkbox" name="featured" checked={form.featured} onChange={change} />
            Feature on the home page
          </label>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Update product' : 'Create product'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>
          )}
        </div>
      </form>

      {loading ? <Loader label="Loading catalogue…" /> : (<>
        <input
          className="admin-search"
          type="search"
          placeholder="Search products"
          aria-label="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {products.filter((p) => `${p.name} ${p.brand || ''} ${p.categoryName || ''}`
                .toLowerCase().includes(query.trim().toLowerCase())).map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-product">
                      {p.imageUrl && <img src={p.imageUrl} alt="" />}
                      <div>
                        <span>{p.name}</span>
                        {p.brand && <div className="muted small">{p.brand}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{p.categoryName || '—'}</td>
                  <td><PriceTag price={p.price} mrp={p.mrp} discountPercent={p.discountPercent} size="sm" /></td>
                  <td className={p.stock <= 5 ? 'cell-warn' : ''}>{p.stock}</td>
                  <td>{p.soldCount}</td>
                  <td>
                    <div className="badges">
                      <span className={p.active ? 'badge badge-confirmed' : 'badge badge-cancelled'}>
                        {p.active ? 'LIVE' : 'HIDDEN'}
                      </span>
                      {p.featured && <span className="badge badge-refunded">Featured</span>}
                    </div>
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
      </>)}
    </div>
  )
}
