import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Footer() {
  const { isAuthenticated } = useAuth()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-word">ShopNest</span>
          <p>
            Thoughtfully chosen essentials for everyday living — curated, carefully
            packed and delivered to your door.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/">The collection</Link>
          <Link to="/cart">Shopping bag</Link>
          {isAuthenticated && <Link to="/wishlist">Wishlist</Link>}
        </div>

        <div className="footer-col">
          <h4>Client services</h4>
          {isAuthenticated ? (
            <>
              <Link to="/orders">Order history</Link>
              <Link to="/account">My account</Link>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create an account</Link>
            </>
          )}
        </div>

        <div className="footer-col">
          <h4>The ShopNest promise</h4>
          <span>Complimentary shipping above ₹2,000</span>
          <span>Secure, encrypted checkout</span>
          <span>Cancel any time before dispatch</span>
        </div>
      </div>

      <div className="footer-base">
        <span>© {year} ShopNest Maison</span>
        <span>Spring Boot · React · MySQL</span>
      </div>
    </footer>
  )
}
