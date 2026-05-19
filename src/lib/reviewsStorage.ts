import type { ReviewsMap, ShowReview } from '../types/reviews'

const STORAGE_KEY = 'shows-reviews-v1'

export function readStoredReviews(): ReviewsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as ReviewsMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function writeStoredReviews(data: ReviewsMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function mergeReviews(
  base: ReviewsMap,
  overlay: ReviewsMap,
): ReviewsMap {
  return { ...base, ...overlay }
}

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

export async function fetchSeedReviews(): Promise<ReviewsMap> {
  const base = import.meta.env.BASE_URL
  const res = await fetch(`${base}reviews.json`)
  if (!res.ok) return {}
  const data = (await res.json()) as ReviewsMap
  return data && typeof data === 'object' ? data : {}
}
