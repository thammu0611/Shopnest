import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'

/**
 * The heart toggle. Signed-out visitors are sent to the login page rather
 * than silently failing, matching what "Add to cart" already does.
 */
export default function WishlistButton({ productId, className = '', withLabel = false }) {
  const { isAuthenticated } = useAuth()
  const { has, toggle, busyId } = useWishlist()
  const navigate = useNavigate()

  const saved = isAuthenticated && has(productId)
  const busy = busyId === Number(productId)

  const handleClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/' } })
      return
    }
    try {
      await toggle(productId)
    } catch {
      /* the wishlist is a convenience - a failure here should not break the page */
    }
  }

  return (
    <button
      type="button"
      className={`wish-btn ${saved ? 'is-saved' : ''} ${className}`}
      onClick={handleClick}
      disabled={busy}
      aria-pressed={saved}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20.3l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 11.48L12 20.3z"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
      {withLabel && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  )
}
