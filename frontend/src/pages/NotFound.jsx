import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="empty-state not-found">
      <span className="eyebrow">Error 404</span>
      <h1>This page has wandered off</h1>
      <p className="muted">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/shop" className="btn btn-primary btn-lg">Return to the collection</Link>
    </div>
  )
}
