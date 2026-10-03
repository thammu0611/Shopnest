import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>404</h1>
      <p className="muted">That page doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Back to shop</Link>
    </div>
  )
}
