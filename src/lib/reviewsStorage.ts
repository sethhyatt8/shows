import type { ShowReview } from '../types/reviews'

export function normalizeEntry(
  patch: Partial<Pick<ShowReview, 'rating' | 'review'>>,
  existing: ShowReview,
): ShowReview {
  let rating = existing.rating
  if (patch.rating !== undefined) {
    if (patch.rating == null) {
      rating = null
    } else {
      const n = Number(patch.rating)
      rating = Number.isFinite(n)
        ? Math.min(100, Math.max(0, Math.round(n)))
        : null
    }
  }
  const review =
    patch.review === undefined ? existing.review : String(patch.review ?? '')
  return {
    rating,
    review,
    updatedAt: new Date().toISOString(),
  }
}
