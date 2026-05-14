import type { LibraryTvItem, WatchStatus } from '../types/library'
import { ShowCard } from './ShowCard'

type StatusFilter = 'all' | WatchStatus

type Props = {
  items: LibraryTvItem[]
  statusFilter: StatusFilter
  onStatusFilter: (f: StatusFilter) => void
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'queued', label: 'Queued' },
  { value: 'dropped', label: 'Dropped' },
]

export function ShowCollection({
  items,
  statusFilter,
  onStatusFilter,
}: Props) {
  const filtered =
    statusFilter === 'all'
      ? items
      : items.filter((i) => i.mine.status === statusFilter)

  const sorted = [...filtered].sort((a, b) => {
    const ra = a.mine.rating
    const rb = b.mine.rating
    if (ra == null && rb == null) return 0
    if (ra == null) return 1
    if (rb == null) return -1
    return rb - ra
  })

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
            <ShowCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
