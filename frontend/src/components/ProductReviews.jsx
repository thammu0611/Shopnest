import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reviewApi } from '../api/endpoints.js'
import { apiMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDate } from '../utils/format.js'
import StarRating from './StarRating.jsx'
import Alert from './Alert.jsx'

/**
 * The whole review block for one product: summary, histogram, the write form
 * (which doubles as an edit form) and the list. `onChange` lets the parent
 * refresh the headline rating after a submit.
 */
export default function ProductReviews({ productId, onChange }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  const load = useCallback(async () => {
    try {
      const { data } = await reviewApi.summary(productId)
      setSummary(data)
      if (data.myReview) {
        setRating(data.myReview.rating)
        setComment(data.myReview.comment ?? '')
      }
    } catch (err) {
      setError(apiMessage(err, 'Could not load reviews'))
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${productId}` } })
      return
    }
    if (rating < 1) {
      setError('Pick a star rating first')
      return
    }

    setSaving(true)
    setError('')
    try {
      const { data } = await reviewApi.submit(productId, { rating, comment: comment.trim() || null })
      setSummary(data)
      setEditing(false)
      setNotice(summary?.myReview ? 'Your review was updated' : 'Thanks for your review')
      setTimeout(() => setNotice(''), 2500)
      onChange?.(data)
    } catch (err) {
      setError(apiMessage(err, 'Could not save your review'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    setError('')
    try {
      const { data } = await reviewApi.removeMine(productId)
      setSummary(data)
      setRating(0)
      setComment('')
      setEditing(false)
      setNotice('Your review was removed')
      setTimeout(() => setNotice(''), 2500)
      onChange?.(data)
    } catch (err) {
      setError(apiMessage(err, 'Could not remove your review'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null
  if (!summary) return null

  const total = summary.reviewCount
  const mine = summary.myReview
  const showForm = !mine || editing
  const others = mine ? summary.reviews.filter((r) => r.id !== mine.id) : summary.reviews

  return (
    <section className="reviews">
      <div className="section-head">
        <h2>Ratings &amp; reviews</h2>
      </div>

      <div className="review-summary card">
        <div className="review-score">
          <strong>{summary.averageRating ? summary.averageRating.toFixed(1) : '—'}</strong>
          <StarRating value={summary.averageRating ?? 0} count={null} size={17} />
          <span className="muted small">
            {total === 0 ? 'No reviews yet' : `${total} review${total === 1 ? '' : 's'}`}
          </span>
        </div>

        <ul className="histogram">
          {[5, 4, 3, 2, 1].map((star) => {
            const n = summary.distribution?.[star] ?? 0
            return (
              <li key={star}>
                <span className="histogram-star">{star}★</span>
                <div className="bar-track bar-track-sm">
                  <div
                    className="bar-fill bar-accent"
                    style={{ width: total ? `${(n / total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="histogram-count muted small">{n}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <Alert type="error" onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setNotice('')}>{notice}</Alert>

      {!isAuthenticated && (
        <p className="muted small review-signin">
          <button className="link-btn" onClick={() => navigate('/login', { state: { from: `/products/${productId}` } })}>
            Sign in
          </button>{' '}
          to leave a review.
        </p>
      )}

      {isAuthenticated && showForm && (
        <form className="card review-form" onSubmit={handleSubmit}>
          <h3>{mine ? 'Edit your review' : 'Write a review'}</h3>

          <label className="block">
            Your rating
            <StarRating value={rating} onChange={setRating} />
          </label>

          <label>
            Your thoughts <span className="muted small">(optional)</span>
            <textarea
              rows={3}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like, or not like, about it?"
            />
          </label>

          <div className="form-actions">
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : mine ? 'Update review' : 'Post review'}
            </button>
            {mine && (
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {isAuthenticated && mine && !editing && (
        <article className="card review review-mine">
          <div className="review-head">
            <div>
              <StarRating value={mine.rating} count={null} />
              <strong className="review-author">Your review</strong>
              {mine.verifiedPurchase && <span className="badge badge-confirmed">Verified purchase</span>}
            </div>
            <div className="row-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={saving}>Delete</button>
            </div>
          </div>
          {mine.comment && <p className="review-text">{mine.comment}</p>}
          <span className="muted small">{formatDate(mine.createdAt)}</span>
        </article>
      )}

      {others.length === 0 ? (
        total === 0 && <p className="empty">Be the first to review this product.</p>
      ) : (
        <div className="review-list">
          {others.map((r) => (
            <article className="card review" key={r.id}>
              <div className="review-head">
                <div>
                  <StarRating value={r.rating} count={null} />
                  <strong className="review-author">{r.userName}</strong>
                  {r.verifiedPurchase && <span className="badge badge-confirmed">Verified purchase</span>}
                </div>
                <span className="muted small">{formatDate(r.createdAt)}</span>
              </div>
              {r.comment && <p className="review-text">{r.comment}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
