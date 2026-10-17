import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import SearchOverlay from './SearchOverlay.jsx'
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons.jsx'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { cart, resetCart } = useCart()
  const { count: wishlistCount, resetWishlist } = useWishlist()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setMenuOpen(false) }, [location.pathname, location.search])

  // /shop carries several "pages" in its query string, so NavLink's own
  // path matching cannot tell Sale from Shop.
  const onShop = location.pathname === '/shop'
  const query = new URLSearchParams(location.search)
  const shopTab = !onShop ? null : query.get('sale') === '1' ? 'sale' : query.get('sort') === 'latest' && [...query.keys()].length === 1 ? 'new' : 'shop'
  const tabClass = (tab) => (shopTab === tab ? 'active' : '')

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
            <Link to="/shop" className={tabClass('shop')}>Shop</Link>
            <Link to="/shop?sort=latest" className={tabClass('new')}>New in</Link>
            <Link to="/shop?sale=1" className={tabClass('sale')}>Sale</Link>
            <NavLink to="/about">Our story</NavLink>
            {isAuthenticated && <NavLink to="/orders" className="nav-only-mobile">Orders</NavLink>}
            {isAuthenticated && <NavLink to="/account" className="nav-only-mobile">Account</NavLink>}
            {isAuthenticated && <NavLink to="/wishlist" className="nav-only-mobile">Wishlist</NavLink>}
            <NavLink to="/contact" className="nav-only-mobile">Contact us</NavLink>
            {isAdmin && <NavLink to="/admin" end className="nav-only-mobile">Dashboard</NavLink>}
            {isAdmin && <NavLink to="/admin/products" className="nav-only-mobile">Products</NavLink>}
            {isAdmin && <NavLink to="/admin/orders" className="nav-only-mobile">Manage orders</NavLink>}
            {isAdmin && <NavLink to="/admin/coupons" className="nav-only-mobile">Coupons</NavLink>}
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
            <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <SearchIcon />
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/account" className="nav-user" title="Your account">
                  <UserIcon />
                  <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                </Link>
                <button className="nav-text-btn hide-md" onClick={handleLogout}>Sign out</button>
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
            <NavLink to="/admin/categories">Categories</NavLink>
            <NavLink to="/admin/coupons">Coupons</NavLink>
            <NavLink to="/admin/customers">Customers</NavLink>
            <NavLink to="/admin/messages">Inbox</NavLink>
          </div>
        )}
      </header>

      {menuOpen && <div className="nav-scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
