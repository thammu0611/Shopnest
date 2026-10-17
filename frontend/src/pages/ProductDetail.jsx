import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { productApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import StarRating from '../components/StarRating.jsx'
import WishlistButton from '../components/WishlistButton.jsx'
import ProductReviews from '../components/ProductReviews.jsx'
import ProductRail from '../components/ProductRail.jsx'
import PriceTag from '../components/PriceTag.jsx'
import Loader from '../components/Loader.jsx'
import Alert from '../components/Alert.jsx'
import Toast from '../components/Toast.jsx'
import useAddToCart from '../utils/useAddToCart.js'
import usePageTitle from '../utils/usePageTitle.js'
import { readRecentlyViewed, rememberProduct } from '../utils/recentlyViewed.js'
import { formatCurrency } from '../utils/format.js'
import { BagIcon, ReturnIcon, ShareIcon, ShieldIcon, TruckIcon } from '../components/Icons.jsx'

const TABS = ['Description', 'Details', 'Delivery & returns']

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [recent, setRecent] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [tab, setTab] = useState(TABS[0])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const cart = useAddToCart()
  usePageTitle(product?.name)

  useEffect(() => {
    setLoading(true)
    setLoadError('')
    setQuantity(1)
    setActiveImage(0)
    setTab(TABS[0])
    // read before remembering, so the current product is not in its own rail
    setRecent(readRecentlyViewed().filter((p) => String(p.id) !== String(id)).slice(0, 4))
    productApi.get(id)
      .then(({ data }) => {
        setProduct(data)
        rememberProduct(data)
      })
      .catch((err) => setLoadError(apiMessage(err, 'Product not found')))
      .finally(() => setLoading(false))
    productApi.related(id, 4).then(({ data }) => setRelated(data)).catch(() => setRelated([]))
  }, [id])

  /** Keep the headline stars in step after someone posts or deletes a review. */
  const handleReviewsChanged = (summary) => {
    setProduct((prev) =>
      prev ? { ...prev, averageRating: summary.averageRating, reviewCount: summary.reviewCount } : prev
    )
  }

  const handleBuyNow = async () => {
    if (await cart.add(product, quantity)) navigate('/cart')
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url })
      } else {
        await navigator.clipboard.writeText(url)
        cart.setNotice('Link copied to your clipboard')
      }
    } catch {
      /* the share sheet was dismissed */
    }
  }

  if (loading) return <Loader label="Loading product…" />
  if (!product) {
    return (
      <div className="empty-state">
        <h1>Product not found</h1>
        <p className="muted">{loadError || 'It may have been removed from the store.'}</p>
        <Link to="/shop" className="btn btn-primary">Back to the shop</Link>
      </div>
    )
  }

  const gallery = [product.imageUrl, ...(product.images || [])].filter(Boolean)
  const maxQty = Math.max(product.stock, 1)
  const inStock = product.stock > 0
  const saving = product.mrp && Number(product.mrp) > Number(product.price)
    ? (Number(product.mrp) - Number(product.price)) * quantity
    : 0

  return (
    <div className="detail">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/shop">Shop</Link>
        {product.categoryName && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={`/shop?category=${product.categoryId}`}>{product.categoryName}</Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="detail-grid">
        <div className="gallery">
          <div className="detail-image">
            {gallery.length > 0
              ? <img src={gallery[activeImage]} alt={product.name} />
              : <div className="image-placeholder tall">No image</div>}
            {product.discountPercent && <span className="stock-flag stock-flag-sale detail-flag">{product.discountPercent}% off</span>}
          </div>
          {gallery.length > 1 && (
            <div className="gallery-thumbs" role="tablist" aria-label="Product images">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  role="tab"
                  aria-selected={i === activeImage}
                  aria-label={`Image ${i + 1}`}
                  className={i === activeImage ? 'is-active' : ''}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-body">
          <span className="eyebrow">{product.brand || product.categoryName}</span>
          <h1>{product.name}</h1>

          <a href="#reviews" className="detail-rating">
            <StarRating value={product.averageRating} count={product.reviewCount} size={15} showValue />
          </a>

          <div className="detail-price">
            <PriceTag price={product.price} mrp={product.mrp} discountPercent={product.discountPercent} size="lg" />
            <span className="tax-note">Inclusive of all taxes</span>
          </div>

          <p className="detail-desc">{product.description}</p>

          <p className={`stock-line ${inStock ? (product.stock <= 5 ? 'is-low' : 'is-in') : 'is-out'}`}>
            <span className="stock-dot" aria-hidden="true" />
            {inStock
              ? product.stock <= 5
                ? `Only ${product.stock} left — order soon`
                : 'In stock, ready to dispatch'
              : 'Currently sold out'}
          </p>

          <Alert type="error" onClose={() => cart.setError('')}>{cart.error}</Alert>

          <div className="detail-actions">
            <div className="qty-control qty-lg" aria-label="Quantity">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >−</button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={quantity >= maxQty}
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              >+</button>
            </div>
            <button
              className="btn btn-ghost btn-lg detail-add"
              disabled={!inStock || cart.addingId === product.id}
              onClick={() => cart.add(product, quantity)}
            >
              <BagIcon size={17} />
              {cart.addingId === product.id ? 'Adding…' : inStock ? 'Add to bag' : 'Sold out'}
            </button>
            <WishlistButton productId={product.id} className="wish-btn-square" />
          </div>
          <button
            className="btn btn-primary btn-lg btn-block buy-now"
            disabled={!inStock || cart.addingId === product.id}
            onClick={handleBuyNow}
          >
            Buy now{saving > 0 && ` · you save ${formatCurrency(saving)}`}
          </button>

          <ul className="assurance">
            <li><TruckIcon size={20} strokeWidth={1.2} /> Complimentary delivery on orders above ₹2,000</li>
            <li><ShieldIcon size={20} strokeWidth={1.2} /> Secure checkout — card, UPI or cash on delivery</li>
            <li><ReturnIcon size={20} strokeWidth={1.2} /> Cancel free of charge until your order ships</li>
          </ul>

          <button className="link-btn link-quiet share-btn" onClick={handleShare}>
            <ShareIcon size={15} /> Share this piece
          </button>
        </div>
      </div>

      <section className="detail-tabs">
        <div className="tab-list" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={tab === t ? 'is-active' : ''}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="tab-panel" role="tabpanel">
          {tab === 'Description' && <p>{product.description || 'No description yet.'}</p>}
          {tab === 'Details' && (
            <dl className="spec-list">
              {product.brand && <><dt>Brand</dt><dd>{product.brand}</dd></>}
              {product.categoryName && <><dt>Category</dt><dd>{product.categoryName}</dd></>}
              <dt>Product code</dt><dd>SN-{String(product.id).padStart(5, '0')}</dd>
              {product.mrp && <><dt>MRP</dt><dd>{formatCurrency(product.mrp)} (incl. of all taxes)</dd></>}
              <dt>Availability</dt><dd>{inStock ? `${product.stock} in stock` : 'Sold out'}</dd>
            </dl>
          )}
          {tab === 'Delivery & returns' && (
            <div className="policy-copy">
              <p>Orders above ₹2,000 ship free; below that a flat ₹49 delivery fee applies.
                 You can pay by card, UPI or cash on delivery.</p>
              <p>You can cancel any order yourself from <Link to="/orders">your orders</Link> until it ships —
                 the items go back into stock and card or UPI payments are refunded.</p>
              <p>Read our full <Link to="/shipping-returns">shipping &amp; returns policy</Link>.</p>
            </div>
          )}
        </div>
      </section>

      <div id="reviews">
        <ProductReviews productId={product.id} onChange={handleReviewsChanged} />
      </div>

      <ProductRail
        eyebrow="You may also like"
        title="Complete the look"
        products={related}
        link={product.categoryId ? { to: `/shop?category=${product.categoryId}`, label: `More ${product.categoryName}` } : null}
        onAdd={cart.add}
        busyId={cart.addingId}
      />

      <ProductRail eyebrow="Your history" title="Recently viewed" products={recent} />

      <Toast
        message={cart.notice}
        onClose={() => cart.setNotice('')}
        action={cart.notice.includes('bag') ? { to: '/cart', label: 'View bag' } : null}
      />
    </div>
  )
}
