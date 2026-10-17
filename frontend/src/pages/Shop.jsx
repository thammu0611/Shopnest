import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categoryApi, productApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'
import Toast from '../components/Toast.jsx'
import useAddToCart from '../utils/useAddToCart.js'
import usePageTitle from '../utils/usePageTitle.js'
import { formatCurrency } from '../utils/format.js'
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon, FilterIcon } from '../components/Icons.jsx'

const PAGE_SIZE = 12

const SORTS = [
  { value: 'latest', label: 'Newest arrivals' },
  { value: 'popular', label: 'Best selling' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
]

const RATINGS = [
  { value: '4', label: '4★ & above' },
  { value: '3', label: '3★ & above' },
]

/**
 * The full catalogue. Every filter lives in the URL, so a filtered view can
 * be bookmarked, shared, and survives the back button.
 */
export default function Shop() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const brand = params.get('brand') || ''
  const min = params.get('min') || ''
  const max = params.get('max') || ''
  const rating = params.get('rating') || ''
  const inStock = params.get('stock') === '1'
  const sale = params.get('sale') === '1'
  const sort = params.get('sort') || 'latest'
  const page = Math.max(0, Number(params.get('page') || 1) - 1)

  const [categories, setCategories] = useState([])
  const [facets, setFacets] = useState({ minPrice: null, maxPrice: null, brands: [] })
  const [products, setProducts] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [price, setPrice] = useState({ min, max })
  const cart = useAddToCart()

  const activeCategory = categories.find((c) => String(c.id) === category)
  const heading = q ? `Results for “${q}”` : sale ? 'The Sale' : activeCategory ? activeCategory.name : 'All products'
  usePageTitle(heading)

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data)).catch(() => {})
    productApi.facets().then(({ data }) => setFacets(data)).catch(() => {})
  }, [])

  // keep the price inputs in step with the URL (e.g. after "clear all")
  useEffect(() => { setPrice({ min, max }) }, [min, max])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    productApi.list({
      page,
      size: PAGE_SIZE,
      sort,
      search: q || undefined,
      categoryId: category || undefined,
      brand: brand || undefined,
      minPrice: min || undefined,
      maxPrice: max || undefined,
      minRating: rating || undefined,
      inStock: inStock || undefined,
      onSale: sale || undefined,
    })
      .then(({ data }) => {
        if (cancelled) return
        setProducts(data.content)
        setTotalPages(data.totalPages)
        setTotalItems(data.totalElements)
      })
      .catch((err) => !cancelled && setError(apiMessage(err, 'Could not load products. Is the API running?')))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [q, category, brand, min, max, rating, inStock, sale, sort, page])

  /** Change some filters; any filter change returns to page 1. */
  const update = (changes, { keepPage = false } = {}) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value == null || value === false) next.delete(key)
      else next.set(key, value === true ? '1' : String(value))
    })
    if (!keepPage) next.delete('page')
    setParams(next)
  }

  const goToPage = (n) => {
    update({ page: n + 1 }, { keepPage: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const applyPrice = (e) => {
    e.preventDefault()
    update({ min: price.min, max: price.max })
  }

  const chips = useMemo(() => {
    const list = []
    if (q) list.push({ key: 'q', label: `“${q}”` })
    if (activeCategory) list.push({ key: 'category', label: activeCategory.name })
    if (brand) list.push({ key: 'brand', label: brand })
    if (min || max) {
      list.push({
        key: ['min', 'max'],
        label: `${min ? formatCurrency(min) : 'Any'} – ${max ? formatCurrency(max) : 'Any'}`,
      })
    }
    if (rating) list.push({ key: 'rating', label: `${rating}★ & above` })
    if (inStock) list.push({ key: 'stock', label: 'In stock' })
    if (sale) list.push({ key: 'sale', label: 'On sale' })
    return list
  }, [q, activeCategory, brand, min, max, rating, inStock, sale])

  const removeChip = (key) => {
    const keys = Array.isArray(key) ? key : [key]
    update(Object.fromEntries(keys.map((k) => [k, ''])))
  }

  const clearAll = () => setParams(sort !== 'latest' ? { sort } : {})

  const filters = (
    <div className="filters-panel">
      <div className="filter-group">
        <h4>Category</h4>
        <ul className="filter-list">
          <li>
            <button className={!category ? 'is-active' : ''} onClick={() => update({ category: '' })}>
              All categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                className={category === String(c.id) ? 'is-active' : ''}
                onClick={() => update({ category: c.id })}
              >
                {c.name} <span className="muted">{c.productCount}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-group">
        <h4>Price</h4>
        <form className="price-range" onSubmit={applyPrice}>
          <input
            type="number" min="0" inputMode="numeric" aria-label="Minimum price"
            placeholder={facets.minPrice ? `₹${Math.floor(facets.minPrice)}` : 'Min'}
            value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })}
          />
          <span aria-hidden="true">–</span>
          <input
            type="number" min="0" inputMode="numeric" aria-label="Maximum price"
            placeholder={facets.maxPrice ? `₹${Math.ceil(facets.maxPrice)}` : 'Max'}
            value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })}
          />
          <button className="btn btn-ghost btn-sm" type="submit">Go</button>
        </form>
      </div>

      {facets.brands.length > 0 && (
        <div className="filter-group">
          <h4>Brand</h4>
          <ul className="filter-list">
            <li>
              <button className={!brand ? 'is-active' : ''} onClick={() => update({ brand: '' })}>All brands</button>
            </li>
            {facets.brands.map((b) => (
              <li key={b}>
                <button className={brand === b ? 'is-active' : ''} onClick={() => update({ brand: b })}>{b}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="filter-group">
        <h4>Customer rating</h4>
        <div className="filter-options">
          {RATINGS.map((r) => (
            <label key={r.value} className="radio radio-plain">
              <input
                type="radio" name="rating" checked={rating === r.value}
                onChange={() => update({ rating: r.value })}
              />
              {r.label}
            </label>
          ))}
          {rating && <button className="link-btn link-quiet" onClick={() => update({ rating: '' })}>Any rating</button>}
        </div>
      </div>

      <div className="filter-group">
        <h4>Availability</h4>
        <div className="filter-options">
          <label className="checkbox">
            <input type="checkbox" checked={inStock} onChange={(e) => update({ stock: e.target.checked })} />
            In stock only
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={sale} onChange={(e) => update({ sale: e.target.checked })} />
            On sale
          </label>
        </div>
      </div>
    </div>
  )

  return (
    <div className="shop-page">
      <div className="page-head">
        <div>
          <span className="eyebrow">{sale ? 'Limited time' : 'The collection'}</span>
          <h1>{heading}</h1>
          <p className="muted">
            {activeCategory?.description && !q
              ? activeCategory.description
              : 'Considered pieces, chosen with care.'}
          </p>
        </div>
      </div>

      <div className="shop-layout">
        <aside className={`shop-filters ${drawerOpen ? 'is-open' : ''}`} aria-label="Filters">
          <div className="drawer-head">
            <h3>Filters</h3>
            <button className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close filters">
              <CloseIcon />
            </button>
          </div>
          {filters}
          <div className="drawer-foot">
            <button className="btn btn-primary btn-block" onClick={() => setDrawerOpen(false)}>
              Show {totalItems} {totalItems === 1 ? 'result' : 'results'}
            </button>
          </div>
        </aside>
        {drawerOpen && <div className="nav-scrim shop-scrim" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}

        <div className="shop-results">
          <div className="toolbar">
            <button className="btn btn-ghost btn-sm filter-toggle" onClick={() => setDrawerOpen(true)}>
              <FilterIcon size={16} /> Filters{chips.length > 0 && ` (${chips.length})`}
            </button>
            <span className="result-count">
              {loading ? 'Searching…' : `${totalItems} ${totalItems === 1 ? 'piece' : 'pieces'}`}
            </span>
            <label className="sort-select">
              <span>Sort</span>
              <select value={sort} onChange={(e) => update({ sort: e.target.value === 'latest' ? '' : e.target.value })}>
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <div className="filter-chips">
              {chips.map((c) => (
                <button key={c.label} className="filter-chip" onClick={() => removeChip(c.key)}>
                  {c.label} <CloseIcon size={13} />
                </button>
              ))}
              <button className="link-btn link-quiet" onClick={clearAll}>Clear all</button>
            </div>
          )}

          <Alert type="error" onClose={() => setError('')}>{error}</Alert>
          <Alert type="error" onClose={() => cart.setError('')}>{cart.error}</Alert>

          {loading ? (
            <Loader label="Curating the collection…" />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>Nothing quite matches</h3>
              <p className="muted">Try removing a filter or searching for something broader.</p>
              <button className="btn btn-ghost" onClick={clearAll}>Clear filters</button>
            </div>
          ) : (
            <div className="product-grid shop-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={cart.add} busy={cart.addingId === p.id} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button
                className="icon-btn icon-btn-outline"
                disabled={page === 0}
                onClick={() => goToPage(page - 1)}
                aria-label="Previous page"
              >
                <ArrowLeftIcon size={18} />
              </button>
              <span>
                <strong>{String(page + 1).padStart(2, '0')}</strong>
                <span className="muted"> / {String(totalPages).padStart(2, '0')}</span>
              </span>
              <button
                className="icon-btn icon-btn-outline"
                disabled={page >= totalPages - 1}
                onClick={() => goToPage(page + 1)}
                aria-label="Next page"
              >
                <ArrowRightIcon size={18} />
              </button>
            </nav>
          )}
        </div>
      </div>

      <Toast message={cart.notice} onClose={() => cart.setNotice('')} action={{ to: '/cart', label: 'View bag' }} />
    </div>
  )
}
