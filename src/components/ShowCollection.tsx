import type { LibraryTvItem, WatchStatus } from '../types/library'
import type { ReviewsMap } from '../types/reviews'
import { ShowCard } from './ShowCard'

type StatusFilter = 'all' | WatchStatus

type Props = {
  items: LibraryTvItem[]
  reviews: ReviewsMap
  statusFilter: StatusFilter
  onStatusFilter: (f: StatusFilter) => void
  onSelect: (item: LibraryTvItem) => void
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'queued', label: 'Queued' },
  { value: 'dropped', label: 'Dropped' },
]

function reviewRating(reviews: ReviewsMap, id: string): number | null {
  return reviews[id]?.rating ?? null
}

export function ShowCollection({
  items,
  reviews,
  statusFilter,
  onStatusFilter,
  onSelect,
}: Props) {
  const filtered =
    statusFilter === 'all'
      ? items
      : items.filter((i) => i.mine.status === statusFilter)

  const sorted = [...filtered].sort((a, b) => {
    const ra = reviewRating(reviews, a.id)
    const rb = reviewRating(reviews, b.id)
    if (ra == null && rb == null) return 0
    if (ra == null) return 1
    if (rb == null) return -1
    return rb - ra
  })

  const emptyReview = { rating: null, review: '', updatedAt: null }

  return (
    <div className="collection">
      <div className="collection__filters" role="tablist" aria-label="Filter by status">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={statusFilter === value}
            className={
              statusFilter === value ? 'chip chip--active' : 'chip'
            }
            onClick={() => onStatusFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="collection__empty">Nothing in this list yet.</p>
      ) : (
        <div className="collection__grid">
          {sorted.map((item) => (
            <ShowCard
              key={item.id}
              item={item}
              review={reviews[item.id] ?? emptyReview}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
