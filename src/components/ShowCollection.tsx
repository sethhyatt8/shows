import { useMemo } from 'react'
import type { LibraryTvItem, WatchStatus } from '../types/library'
import type { ReviewsMap } from '../types/reviews'
import {
  collectStreamingProviders,
  hasStreamingProvider,
  primaryStreamingProvider,
} from '../lib/streaming'
import { displayTitle } from '../lib/display'
import { ShowCard } from './ShowCard'

type StatusFilter = 'all' | WatchStatus
export type SortMode = 'rating' | 'streaming'

type Props = {
  items: LibraryTvItem[]
  reviews: ReviewsMap
  statusFilter: StatusFilter
  onStatusFilter: (f: StatusFilter) => void
  streamingFilter: string
  onStreamingFilter: (provider: string) => void
  sortMode: SortMode
  onSortMode: (mode: SortMode) => void
  onSelect: (item: LibraryTvItem) => void
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'queued', label: 'Queued' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'archived', label: 'Archived' },
]

function reviewRating(reviews: ReviewsMap, id: string): number | null {
  return reviews[id]?.rating ?? null
}

function showStatus(item: LibraryTvItem, reviews: ReviewsMap): WatchStatus {
  return reviews[item.id]?.status ?? item.mine.status
}

export function ShowCollection({
  items,
  reviews,
  statusFilter,
  onStatusFilter,
  streamingFilter,
  onStreamingFilter,
  sortMode,
  onSortMode,
  onSelect,
}: Props) {
  const streamingOptions = useMemo(
    () => collectStreamingProviders(items),
    [items],
  )

  const filtered = items.filter((i) => {
    if (statusFilter !== 'all' && showStatus(i, reviews) !== statusFilter) {
      return false
    }
    if (
      streamingFilter !== 'all' &&
      !hasStreamingProvider(i, streamingFilter)
    ) {
      return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'streaming') {
      const pa = primaryStreamingProvider(a) ?? '\uffff'
      const pb = primaryStreamingProvider(b) ?? '\uffff'
      const byProvider = pa.localeCompare(pb)
      if (byProvider !== 0) return byProvider
      return displayTitle(a).localeCompare(displayTitle(b))
    }
    const ra = reviewRating(reviews, a.id)
    const rb = reviewRating(reviews, b.id)
    if (ra == null && rb == null) return 0
    if (ra == null) return 1
    if (rb == null) return -1
    return rb - ra
  })

  return (
    <div className="collection">
      <div className="collection__toolbar">
        <label className="collection__sort-label" htmlFor="sort-mode">
          Sort
        </label>
        <select
          id="sort-mode"
          className="collection__sort"
          value={sortMode}
          onChange={(e) => onSortMode(e.target.value as SortMode)}
        >
          <option value="rating">By rating</option>
          <option value="streaming">By streaming service</option>
        </select>
      </div>

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

      {streamingOptions.length > 0 ? (
        <div
          className="collection__filters collection__filters--streaming"
          role="tablist"
          aria-label="Filter by streaming service"
        >
          <button
            type="button"
            role="tab"
            aria-selected={streamingFilter === 'all'}
            className={
              streamingFilter === 'all' ? 'chip chip--active' : 'chip'
            }
            onClick={() => onStreamingFilter('all')}
          >
            All services
          </button>
          {streamingOptions.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={streamingFilter === name}
              className={
                streamingFilter === name ? 'chip chip--active' : 'chip'
              }
              onClick={() => onStreamingFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}

      {sorted.length === 0 ? (
        <p className="collection__empty">No shows in this list.</p>
      ) : (
        <div className="collection__grid">
          {sorted.map((item) => (
            <ShowCard
              key={item.id}
              item={item}
              review={reviews[item.id] ?? { rating: null, review: '', status: item.mine.status, updatedAt: null }}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
