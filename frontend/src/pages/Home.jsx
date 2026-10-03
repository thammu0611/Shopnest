import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryApi, productApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'

const PAGE_SIZE = 8

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState('latest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [addingId, setAddingId] = useState(null)

  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data)).catch(() => setCategories([]))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await productApi.list({
        page,
        size: PAGE_SIZE,
        sort,
        search: term || undefined,
        categoryId: categoryId || undefined,
      })
      setProducts(data.content)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(apiMessage(err, 'Could not load products. Is the API running on port 8080?'))
    } finally {
      setLoading(false)
    }
  }, [page, term, categoryId, sort])

  useEffect(() => { load() }, [load])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setTerm(search.trim())
  }

  const handleAdd = async (product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/' } })
      return
    }
    setAddingId(product.id)
    setError('')
    try {
      await addItem(product.id, 1)
      setNotice(`${product.name} added to your cart`)
      setTimeout(() => setNotice(''), 2500)
    } catch (err) {
      setError(apiMessage(err, 'Could not add that item'))
    } finally {
      setAddingId(null)
    }
  }

  return (
    <>
      <section className="hero">
        <h1>Everything you need, one cart away.</h1>
        <p>A demo storefront powered by a Spring Boot REST API, React and MySQL.</p>
      </section>

      <section className="toolbar">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>

        <div className="filters">
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(0) }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0) }}>
            <option value="latest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </section>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>

      {loading ? (
        <Loader label="Loading products…" />
      ) : products.length === 0 ? (
        <p className="empty">No products matched your search.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={handleAdd}
              busy={addingId === product.id}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ← Previous
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button
            className="btn btn-ghost"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </>
  )
}
