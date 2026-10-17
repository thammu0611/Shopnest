import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categoryApi, productApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'
import Toast from '../components/Toast.jsx'
import {
  ArrowLeftIcon, ArrowRightIcon, ReturnIcon, SearchIcon, ShieldIcon, SparkleIcon, TruckIcon,
} from '../components/Icons.jsx'

const PAGE_SIZE = 8

const HERO_MAIN = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1100&q=80'
const HERO_SIDE = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=80'

const PROMISES = [
  { icon: TruckIcon, title: 'Complimentary delivery', text: 'On every order above ₹2,000' },
  { icon: ShieldIcon, title: 'Secure checkout', text: 'Card, UPI or cash on delivery' },
  { icon: ReturnIcon, title: 'Change of heart', text: 'Cancel any time before dispatch' },
  { icon: SparkleIcon, title: 'Curated quality', text: 'Every piece reviewed by real buyers' },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
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
  const collectionRef = useRef(null)

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
      setTotalItems(data.totalElements ?? data.content.length)
    } catch (err) {
      setError(apiMessage(err, 'Could not load products. Is the API running on port 8080?'))
    } finally {
      setLoading(false)
    }
  }, [page, term, categoryId, sort])

  useEffect(() => { load() }, [load])

  const scrollToCollection = () =>
    collectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setTerm(search.trim())
  }

  const pickCategory = (id) => {
    setCategoryId(id)
    setPage(0)
  }

  const goToPage = (next) => {
    setPage(next)
    scrollToCollection()
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
      setNotice(`${product.name} has been added to your bag`)
    } catch (err) {
      setError(apiMessage(err, 'Could not add that item'))
    } finally {
      setAddingId(null)
    }
  }

  const activeCategory = categories.find((c) => String(c.id) === String(categoryId))

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">The Autumn Edit · {new Date().getFullYear()}</span>
          <h1>
            Considered pieces for a <em>beautifully</em> ordinary life.
          </h1>
          <p>
            A quiet edit of objects we would happily live with: timeless, well-made
            and chosen with care, from everyday tech to the books on your nightstand.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={scrollToCollection}>
              Explore the collection <ArrowRightIcon size={16} />
            </button>
            {isAuthenticated ? (
              <Link to="/wishlist" className="btn btn-link">View your wishlist</Link>
            ) : (
              <Link to="/register" className="btn btn-link">Become a member</Link>
            )}
          </div>
        </div>

        <div className="hero-visual">
          <figure className="hero-img hero-img-main">
            <img src={HERO_MAIN} alt="A minimalist wristwatch on a soft neutral backdrop" />
          </figure>
          <figure className="hero-img hero-img-side">
            <img src={HERO_SIDE} alt="A structured leather bag" />
          </figure>
          <div className="hero-note">
            <span className="eyebrow">New in</span>
            <strong>Timeless accessories</strong>
          </div>
        </div>
      </section>

      <section className="promise-strip" aria-label="Our promise">
        {PROMISES.map(({ icon: Icon, title, text }) => (
          <div className="promise" key={title}>
            <Icon size={26} strokeWidth={1.2} />
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="collection" ref={collectionRef} id="collection">
        <header className="section-title">
          <span className="eyebrow">Curated for you</span>
          <h2>{activeCategory ? activeCategory.name : 'The Collection'}</h2>
          <p className="muted">
            {activeCategory?.description || 'Every piece, hand-picked. Browse by category or search for something specific.'}
          </p>
        </header>

        <div className="category-pills" role="tablist" aria-label="Categories">
          <button
            type="button"
            role="tab"
            aria-selected={categoryId === ''}
            className={`pill ${categoryId === '' ? 'is-active' : ''}`}
            onClick={() => pickCategory('')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={String(categoryId) === String(c.id)}
              className={`pill ${String(categoryId) === String(c.id) ? 'is-active' : ''}`}
              onClick={() => pickCategory(String(c.id))}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="toolbar">
          <form className="search-form" onSubmit={handleSearch} role="search">
            <SearchIcon size={18} className="search-icon" />
            <input
              type="search"
              placeholder="Search the collection"
              aria-label="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-ghost btn-sm" type="submit">Search</button>
          </form>

          <div className="toolbar-meta">
            {!loading && (
              <span className="result-count">
                {totalItems} {totalItems === 1 ? 'piece' : 'pieces'}
                {term && <> for “{term}”</>}
              </span>
            )}
            <label className="sort-select">
              <span>Sort</span>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0) }}>
                <option value="latest">Newest arrivals</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>
        </div>

        <Alert type="error" onClose={() => setError('')}>{error}</Alert>

        {loading ? (
          <Loader label="Curating the collection…" />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing quite matches</h3>
            <p className="muted">Try a different search term or browse all categories.</p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setSearch(''); setTerm(''); pickCategory('') }}
            >
              Clear filters
            </button>
          </div>
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
      </section>

      {!isAuthenticated && (
        <section className="member-banner">
          <span className="eyebrow">ShopNest membership</span>
          <h2>Save the pieces you love. Return when you are ready.</h2>
          <p>Members keep a personal wishlist, track every order and leave reviews for the community.</p>
          <Link to="/register" className="btn btn-light btn-lg">Join ShopNest</Link>
        </section>
      )}

      <Toast message={notice} onClose={() => setNotice('')} action={{ to: '/cart', label: 'View bag' }} />
    </>
  )
}
