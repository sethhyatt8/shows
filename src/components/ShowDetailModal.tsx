import { useEffect, useState } from 'react'
import type { LibraryTvItem, WatchStatus } from '../types/library'
import type { ShowReview } from '../types/reviews'
import { displayTitle, posterUrl } from '../lib/display'
import { streamingProviders } from '../lib/streaming'
import { WATCH_STATUS_OPTIONS, watchStatusLabel } from '../lib/statuses'

type Props = {
  item: LibraryTvItem
  review: ShowReview
  canEdit: boolean
  onRequestEdit: () => void
  onClose: () => void
  onSave: (
    showId: string,
    patch: Partial<Pick<ShowReview, 'rating' | 'review' | 'status'>>,
  ) => Promise<unknown>
}

export function ShowDetailModal({
  item,
  review,
  canEdit,
  onRequestEdit,
  onClose,
  onSave,
}: Props) {
  const title = displayTitle(item)
  const poster = posterUrl(item)
  const [ratingInput, setRatingInput] = useState(
    review.rating == null ? '' : String(review.rating),
  )
  const [reviewText, setReviewText] = useState(review.review)
  const [status, setStatus] = useState<WatchStatus>(review.status)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setRatingInput(review.rating == null ? '' : String(review.rating))
    setReviewText(review.review)
    setStatus(review.status)
    setSaveError(null)
  }, [review, item.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canEdit) {
      onRequestEdit()
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const trimmed = ratingInput.trim()
      const rating =
        trimmed === '' ? null : Math.min(100, Math.max(0, Number(trimmed)))
      if (rating != null && !Number.isFinite(rating)) {
        setSaveError('Rating must be a number from 0 to 100.')
        return
      }
      await onSave(item.id, { rating, review: reviewText, status })
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not save'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const hasReviewContent =
    review.rating != null ||
    review.review.trim().length > 0 ||
    review.status !== 'watching'

  const statusLabel = watchStatusLabel(review.status)

  return (
    <div className="modal" role="presentation" onClick={onClose}>
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="show-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="modal__layout">
          <div className="modal__poster">
            {poster ? (
              <img src={poster} alt="" width={300} height={450} />
            ) : (
              <div className="show-card__placeholder" aria-hidden>
                <span>{title.slice(0, 1)}</span>
              </div>
            )}
          </div>

          <div className="modal__content">
            <h2 id="show-modal-title" className="modal__title">
              {title}
            </h2>
            {item.cached.overview ? (
              <p className="modal__overview">{item.cached.overview}</p>
            ) : null}
            {item.cached.topCast.length > 0 ? (
              <p className="modal__cast">
                <strong>Cast:</strong> {item.cached.topCast.join(', ')}
              </p>
            ) : null}
            {streamingProviders(item).length > 0 ? (
              <p className="modal__cast">
                <strong>Streaming (US):</strong>{' '}
                {streamingProviders(item).join(', ')}
              </p>
            ) : null}

            {canEdit ? (
              <form className="modal__form" onSubmit={handleSubmit}>
                <label className="modal__label" htmlFor="show-status">
                  Status
                </label>
                <select
                  id="show-status"
                  className="modal__input"
                  value={status}
                  disabled={saving}
                  onChange={(e) => setStatus(e.target.value as WatchStatus)}
                >
                  {WATCH_STATUS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <label className="modal__label" htmlFor="show-rating">
                  Rating (0–100)
                </label>
                <input
                  id="show-rating"
                  className="modal__input"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={ratingInput}
                  onChange={(e) => setRatingInput(e.target.value)}
                  placeholder="—"
                  disabled={saving}
                />

                <label className="modal__label" htmlFor="show-review">
                  Review
                </label>
                <textarea
                  id="show-review"
                  className="modal__textarea"
                  rows={5}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Your thoughts…"
                  disabled={saving}
                />

                {saveError ? (
                  <p className="modal__error" role="alert">
                    {saveError}
                  </p>
                ) : null}

                <div className="modal__actions">
                  <button
                    type="submit"
                    className="modal__save"
                    disabled={saving}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="modal__readonly">
                <p className="modal__readonly-rating">
                  <strong>Status:</strong> {statusLabel}
                </p>
                {hasReviewContent ? (
                  <>
                    {review.rating != null ? (
                      <p className="modal__readonly-rating">
                        <strong>Rating:</strong> {review.rating}/100
                      </p>
                    ) : null}
                    {review.review.trim() ? (
                      <p className="modal__readonly-review">{review.review}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="modal__readonly-empty">No rating or review yet.</p>
                )}
                <button
                  type="button"
                  className="modal__save"
                  onClick={onRequestEdit}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
