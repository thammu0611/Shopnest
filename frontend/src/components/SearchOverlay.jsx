import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categoryApi, productApi } from '../api/endpoints.js'
import { formatCurrency } from '../utils/format.js'
import { ArrowRightIcon, CloseIcon, SearchIcon } from './Icons.jsx'

/** Full-width search panel with live product suggestions. */
export default function SearchOverlay({ open, onClose }) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [categories, setCategories] = useState([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return undefined
    setTerm('')
    setResults([])
    inputRef.current?.focus()
    if (categories.length === 0) categoryApi.list().then(({ data }) => setCategories(data)).catch(() => {})
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Debounced suggestions; a stale response never overwrites a newer one.
  useEffect(() => {
    const query = term.trim()
    if (query.length < 2) {
      setResults([])
      return undefined
    }
    let stale = false
    setSearching(true)
    const timer = setTimeout(() => {
      productApi.list({ search: query, size: 5, sort: 'popular' })
        .then(({ data }) => !stale && setResults(data.content))
        .catch(() => !stale && setResults([]))
        .finally(() => !stale && setSearching(false))
    }, 220)
    return () => { stale = true; clearTimeout(timer) }
  }, [term])

  if (!open) return null

  const submit = (e) => {
    e.preventDefault()
    const query = term.trim()
    if (!query) return
    onClose()
    navigate(`/shop?q=${encodeURIComponent(query)}`)
  }

  return (
    <>
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search">
        <form className="search-panel-form" onSubmit={submit} role="search">
          <SearchIcon size={22} />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search for products, brands and more"
            aria-label="Search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search">
            <CloseIcon />
          </button>
        </form>

        <div className="search-panel-body">
          {term.trim().length < 2 ? (
            <div className="search-suggest">
              <span className="eyebrow">Popular categories</span>
              <div className="search-chips">
                {categories.map((c) => (
                  <Link key={c.id} to={`/shop?category=${c.id}`} className="pill" onClick={onClose}>{c.name}</Link>
                ))}
                <Link to="/shop?sale=1" className="pill" onClick={onClose}>Sale</Link>
              </div>
            </div>
          ) : searching && results.length === 0 ? (
            <p className="muted search-empty">Searching…</p>
          ) : results.length === 0 ? (
            <p className="muted search-empty">No products match “{term.trim()}”.</p>
          ) : (
            <>
              <ul className="search-results">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link to={`/products/${p.id}`} onClick={onClose}>
                      {p.imageUrl ? <img src={p.imageUrl} alt="" /> : <span className="search-thumb" />}
                      <span className="search-result-name">
                        <strong>{p.name}</strong>
                        <span className="muted small">{p.brand || p.categoryName}</span>
                      </span>
                      <span className="search-result-price">{formatCurrency(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button className="btn btn-link" onClick={submit}>
                See all results for “{term.trim()}” <ArrowRightIcon size={15} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="search-scrim" onClick={onClose} aria-hidden="true" />
    </>
  )
}
