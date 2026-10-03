import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from './Loader.jsx'

export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader label="Checking your session…" />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
