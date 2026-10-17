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
          <p className="footer-payments">
            <span>Card</span><span>UPI</span><span>Cash on delivery</span>
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/shop">All products</Link>
          <Link to="/shop?sort=latest">New arrivals</Link>
          <Link to="/shop?sort=popular">Best sellers</Link>
          <Link to="/shop?sale=1">Sale</Link>
        </div>

        <div className="footer-col">
          <h4>Client services</h4>
          <Link to="/contact">Contact us</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/shipping-returns">Shipping &amp; returns</Link>
          {isAuthenticated ? <Link to="/orders">Track an order</Link> : <Link to="/login">Sign in</Link>}
        </div>

        <div className="footer-col">
          <h4>ShopNest</h4>
          <Link to="/about">Our story</Link>
          {isAuthenticated ? <Link to="/account">My account</Link> : <Link to="/register">Create an account</Link>}
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms of sale</Link>
        </div>
      </div>

      <div className="footer-base">
        <span>© {year} ShopNest Maison</span>
        <span>Prices inclusive of all taxes</span>
      </div>
    </footer>
  )
}
