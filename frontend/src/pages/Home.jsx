import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryApi, productApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import ProductRail from '../components/ProductRail.jsx'
import Newsletter from '../components/Newsletter.jsx'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'
import Toast from '../components/Toast.jsx'
import useAddToCart from '../utils/useAddToCart.js'
import usePageTitle from '../utils/usePageTitle.js'
import { readRecentlyViewed } from '../utils/recentlyViewed.js'
import {
  ArrowRightIcon, ReturnIcon, ShieldIcon, SparkleIcon, TruckIcon,
} from '../components/Icons.jsx'

const HERO_MAIN = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1100&q=80'
const HERO_SIDE = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=80'
const SALE_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1100&q=80'

const PROMISES = [
  { icon: TruckIcon, title: 'Complimentary delivery', text: 'On every order above ₹2,000' },
  { icon: ShieldIcon, title: 'Secure checkout', text: 'Card, UPI or cash on delivery' },
  { icon: ReturnIcon, title: 'Change of heart', text: 'Cancel any time before dispatch' },
  { icon: SparkleIcon, title: 'Curated quality', text: 'Every piece reviewed by real buyers' },
]

export default function Home() {
  usePageTitle(null)
  const { isAuthenticated } = useAuth()
  const cart = useAddToCart()

  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [newest, setNewest] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [onSale, setOnSale] = useState([])
  const [recent] = useState(() => readRecentlyViewed().slice(0, 4))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const four = { page: 0, size: 4 }
    Promise.all([
      categoryApi.list(),
      productApi.list({ ...four, featured: true, sort: 'popular' }),
      productApi.list({ ...four, sort: 'latest' }),
      productApi.list({ ...four, sort: 'popular' }),
      productApi.list({ ...four, onSale: true, sort: 'popular' }),
    ])
      .then(([c, f, n, b, s]) => {
        setCategories(c.data)
        setFeatured(f.data.content)
        setNewest(n.data.content)
        setBestSellers(b.data.content)
        setOnSale(s.data.content)
      })
      .catch((err) => setError(apiMessage(err, 'Could not load the store. Is the API running on port 8080?')))
      .finally(() => setLoading(false))
  }, [])

  const bestDiscount = Math.max(0, ...onSale.map((p) => p.discountPercent || 0))

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
            <Link to="/shop" className="btn btn-primary btn-lg">
              Explore the collection <ArrowRightIcon size={16} />
            </Link>
            <Link to="/shop?sale=1" className="btn btn-link">Shop the sale</Link>
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

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="error" onClose={() => cart.setError('')}>{cart.error}</Alert>

      {loading ? (
        <Loader label="Curating the collection…" />
      ) : (
        <>
          {categories.length > 0 && (
            <section className="category-section">
              <header className="section-title">
                <span className="eyebrow">Browse</span>
                <h2>Shop by category</h2>
              </header>
              <div className="category-tiles">
                {categories.map((c) => (
                  <Link key={c.id} to={`/shop?category=${c.id}`} className="category-tile">
                    {c.imageUrl ? <img src={c.imageUrl} alt="" loading="lazy" /> : <span className="tile-fallback" />}
                    <span className="category-tile-copy">
                      <strong>{c.name}</strong>
                      <span>{c.productCount} {c.productCount === 1 ? 'piece' : 'pieces'}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <ProductRail
            eyebrow="Hand-picked"
            title="The Edit"
            products={featured}
            link={{ to: '/shop', label: 'View all' }}
            onAdd={cart.add}
            busyId={cart.addingId}
          />

          {onSale.length > 0 && (
            <section className="sale-banner">
              <div className="sale-banner-media">
                <img src={SALE_IMAGE} alt="" loading="lazy" />
              </div>
              <div className="sale-banner-copy">
                <span className="eyebrow">Limited time</span>
                <h2>The Season Sale — up to {bestDiscount}% off.</h2>
                <p>Considered pieces at quieter prices. Stock is limited and once it is gone, it is gone.</p>
                <Link to="/shop?sale=1" className="btn btn-light btn-lg">Shop the sale</Link>
              </div>
            </section>
          )}

          <ProductRail
            eyebrow="Just landed"
            title="New arrivals"
            products={newest}
            link={{ to: '/shop?sort=latest', label: 'See everything new' }}
            onAdd={cart.add}
            busyId={cart.addingId}
          />

          <ProductRail
            eyebrow="Most loved"
            title="Best sellers"
            products={bestSellers.some((p) => p.soldCount > 0) ? bestSellers : []}
            link={{ to: '/shop?sort=popular', label: 'Shop best sellers' }}
            onAdd={cart.add}
            busyId={cart.addingId}
          />

          <ProductRail eyebrow="Pick up where you left off" title="Recently viewed" products={recent} />
        </>
      )}

      <Newsletter />

      {!isAuthenticated && (
        <section className="member-banner">
          <span className="eyebrow">ShopNest membership</span>
          <h2>Save the pieces you love. Return when you are ready.</h2>
          <p>Members keep a personal wishlist, save delivery addresses, track every order and unlock welcome offers.</p>
          <Link to="/register" className="btn btn-light btn-lg">Join ShopNest</Link>
        </section>
      )}

      <Toast message={cart.notice} onClose={() => cart.setNotice('')} action={{ to: '/cart', label: 'View bag' }} />
    </>
  )
}
