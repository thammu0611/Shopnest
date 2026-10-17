import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CheckIcon, CloseIcon } from './Icons.jsx'

/**
 * A small confirmation that slides in from the corner and dismisses itself.
 * Renders nothing while `message` is empty.
 */
export default function Toast({ message, onClose, action, duration = 3200 }) {
  // Parents usually pass an inline arrow; keep the latest one in a ref so a
  // re-render does not restart the dismiss timer.
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(() => closeRef.current(), duration)
    return () => clearTimeout(timer)
  }, [message, duration])

  if (!message) return null

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-icon"><CheckIcon size={16} strokeWidth={2} /></span>
      <span className="toast-text">{message}</span>
      {action && (
        <Link to={action.to} className="toast-action" onClick={onClose}>{action.label}</Link>
      )}
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        <CloseIcon size={16} />
      </button>
    </div>
  )
}
