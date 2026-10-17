import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, UserIcon } from './Icons.jsx'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { cart, resetCart } = useCart()
  const { count: wishlistCount, resetWishlist } = useWishlist()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    resetCart()
    resetWishlist()
    navigate('/')
  }

  return (
    <>
      <div className="announce" role="note">
        <span>Complimentary shipping on orders above ₹2,000</span>
        <span className="announce-sep" aria-hidden="true">✦</span>
        <span className="announce-extra">Secure checkout &amp; easy returns</span>
      </div>

      <header className="navbar">
        <div className="navbar-inner">
          <button
            type="button"
            className="icon-btn menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <nav id="primary-nav" className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            <NavLink to="/" end>Shop</NavLink>
            {isAuthenticated && <NavLink to="/orders">Orders</NavLink>}
            {isAuthenticated && <NavLink to="/account">Account</NavLink>}
            {isAuthenticated && <NavLink to="/wishlist" className="nav-only-mobile">Wishlist</NavLink>}
            {isAdmin && <NavLink to="/admin" end className="nav-only-mobile">Dashboard</NavLink>}
            {isAdmin && <NavLink to="/admin/products" className="nav-only-mobile">Products</NavLink>}
            {isAdmin && <NavLink to="/admin/orders" className="nav-only-mobile">Manage orders</NavLink>}
            {isAuthenticated ? (
              <button type="button" className="nav-only-mobile nav-signout" onClick={handleLogout}>
                Sign out
              </button>
            ) : (
              <>
                <NavLink to="/login" className="nav-only-mobile">Sign in</NavLink>
                <NavLink to="/register" className="nav-only-mobile">Create account</NavLink>
              </>
            )}
          </nav>

          <Link to="/" className="brand" aria-label="ShopNest home">
            <span className="brand-word">ShopNest</span>
            <span className="brand-tag">Maison · Est. 2024</span>
          </Link>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <Link to="/account" className="nav-user" title="Your account">
                  <UserIcon />
                  <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                </Link>
                <button className="nav-text-btn hide-sm" onClick={handleLogout}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-text-btn hide-sm">Sign in</Link>
                <Link to="/login" className="icon-btn show-sm" aria-label="Sign in"><UserIcon /></Link>
              </>
            )}

            {isAuthenticated && (
              <Link to="/wishlist" className="icon-btn" title="Wishlist" aria-label="Wishlist">
                <HeartIcon />
                {wishlistCount > 0 && <span className="count-badge">{wishlistCount}</span>}
              </Link>
            )}

            <Link to="/cart" className="icon-btn" title="Shopping bag" aria-label="Shopping bag">
              <BagIcon />
              {cart.totalItems > 0 && <span className="count-badge">{cart.totalItems}</span>}
            </Link>
          </div>
        </div>

        {isAdmin && (
          <div className="admin-bar">
            <span className="admin-bar-label">Atelier</span>
            <NavLink to="/admin" end>Dashboard</NavLink>
            <NavLink to="/admin/products">Products</NavLink>
            <NavLink to="/admin/orders">Orders</NavLink>
          </div>
        )}
      </header>

      {menuOpen && <div className="nav-scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
    </>
  )
}
