import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { cart, resetCart } = useCart()
  const { count: wishlistCount, resetWishlist } = useWishlist()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    resetCart()
    resetWishlist()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="brand">
          <span className="brand-mark">SN</span> ShopNest
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>Shop</NavLink>
          {isAuthenticated && <NavLink to="/wishlist">Wishlist</NavLink>}
          {isAuthenticated && <NavLink to="/orders">My Orders</NavLink>}
          {isAuthenticated && <NavLink to="/account">Account</NavLink>}
          {isAdmin && <NavLink to="/admin">Dashboard</NavLink>}
          {isAdmin && <NavLink to="/admin/products">Products</NavLink>}
          {isAdmin && <NavLink to="/admin/orders">Orders Admin</NavLink>}
        </nav>

        <div className="nav-actions">
          {isAuthenticated && (
            <Link to="/wishlist" className="cart-link" title="Wishlist" aria-label="Wishlist">
              <span aria-hidden="true">♡</span>
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </Link>
          )}

          <Link to="/cart" className="cart-link">
            Cart
            {cart.totalItems > 0 && <span className="cart-badge">{cart.totalItems}</span>}
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/account" className="nav-user">Hi, {user.name.split(' ')[0]}</Link>
              <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
