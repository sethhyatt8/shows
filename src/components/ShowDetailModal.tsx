import { useEffect, useState } from 'react'
import type { LibraryTvItem } from '../types/library'
import type { ShowReview } from '../types/reviews'
import { displayTitle, posterUrl } from '../lib/display'

type Props = {
  item: LibraryTvItem
  review: ShowReview
  onClose: () => void
  onSave: (
    showId: string,
    patch: Partial<Pick<ShowReview, 'rating' | 'review'>>,
  ) => Promise<unknown>
}

export function ShowDetailModal({
  item,
  review,
  onClose,
  onSave,
}: Props) {
  const title = displayTitle(item)
  const poster = posterUrl(item)
  const [ratingInput, setRatingInput] = useState(
    review.rating == null ? '' : String(review.rating),
  )
  const [reviewText, setReviewText] = useState(review.review)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setRatingInput(review.rating == null ? '' : String(review.rating))
    setReviewText(review.review)
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
      await onSave(item.id, { rating, review: reviewText })
      onClose()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

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

            <form className="modal__form" onSubmit={handleSubmit}>
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
          </div>
        </div>
      </div>
    </div>
  )
}
