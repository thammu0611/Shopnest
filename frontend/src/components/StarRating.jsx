/**
 * Stars in two modes.
 *
 * Read-only (default): renders a half-precision bar from `value`, used on
 * product cards and the review list.
 *
 * Interactive (`onChange` given): renders five radio-like buttons with hover
 * preview, used in the "write a review" form.
 */
import { useId, useState } from 'react'

function Star({ fill, size }) {
  // 0 = empty, 1 = full, anything between = partially filled via the gradient.
  // useId keeps the gradient id stable across renders and unique per instance.
  const id = useId()
  return (
    <svg className="star" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.9 5.88 6.5.94-4.7 4.58 1.11 6.46L12 17.31l-5.81 3.05 1.11-6.46L2.6 9.32l6.5-.94L12 2.5z"
        fill={`url(#${id})`}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function StarRating({
  value = 0,
  count,
  size = 15,
  onChange,
  showValue = false,
  className = '',
}) {
  const [hover, setHover] = useState(0)
  const interactive = typeof onChange === 'function'
  const shown = interactive && hover > 0 ? hover : Number(value) || 0

  if (interactive) {
    return (
      <div className={`stars stars-input ${className}`} role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={Number(value) === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className="star-btn"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(n)}
          >
            <Star fill={shown >= n ? 1 : 0} size={size + 7} />
          </button>
        ))}
      </div>
    )
  }

  // No reviews yet - say so rather than showing five empty stars.
  if (!count && !Number(value)) {
    return <span className={`stars-empty small muted ${className}`}>No reviews yet</span>
  }

  return (
    <span
      className={`stars ${className}`}
      title={`${Number(value).toFixed(1)} out of 5`}
      aria-label={`Rated ${Number(value).toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={Math.max(0, Math.min(1, shown - n + 1))} />
      ))}
      {showValue && <strong className="stars-value">{Number(value).toFixed(1)}</strong>}
      {count != null && <span className="stars-count">({count})</span>}
    </span>
  )
}
