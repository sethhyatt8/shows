import type { WatchStatus } from '../types/library'
import type { ShowReview } from '../types/reviews'

const LOCAL_KEY = 'shows-entries-v1'

const VALID_STATUS = new Set<WatchStatus>([
  'watching',
  'completed',
  'dropped',
  'queued',
  'archived',
])

export function defaultEntry(status: WatchStatus = 'watching'): ShowReview {
  return {
    rating: null,
    review: '',
    status,
    updatedAt: null,
  }
}

export function normalizeEntry(
  patch: Partial<Pick<ShowReview, 'rating' | 'review' | 'status'>>,
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

  let status = existing.status
  if (patch.status !== undefined && VALID_STATUS.has(patch.status)) {
    status = patch.status
  }

  return {
    rating,
    review,
    status,
    updatedAt: new Date().toISOString(),
  }
}

export function readLocalEntries(): Record<string, ShowReview> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, ShowReview>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function writeLocalEntries(data: Record<string, ShowReview>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
}

export function mergeEntries(
  ...maps: Record<string, ShowReview>[]
): Record<string, ShowReview> {
  return Object.assign({}, ...maps)
}
