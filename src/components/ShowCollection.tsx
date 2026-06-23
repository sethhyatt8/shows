import { useEffect, useMemo } from 'react'
import type { LibraryTvItem, WatchStatus } from '../types/library'
import type { ReviewsMap } from '../types/reviews'
import {
  collectStreamingProviders,
  hasStreamingProvider,
  primaryStreamingProvider,
} from '../lib/streaming'
import { displayTitle } from '../lib/display'
import {
  FILTER_STATUS_OPTIONS,
  matchesStatusFilter,
  type StatusFilter,
} from '../lib/statuses'
import { ShowCard } from './ShowCard'

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

function reviewRating(reviews: ReviewsMap, id: string): number | null {
  return reviews[id]?.rating ?? null
}

function showStatus(item: LibraryTvItem, reviews: ReviewsMap): WatchStatus {
  return reviews[item.id]?.status ?? item.mine.status
}

function matchesStreamingFilter(
  item: LibraryTvItem,
  streamingFilter: string,
): boolean {
  return (
    streamingFilter === 'all' || hasStreamingProvider(item, streamingFilter)
  )
}

function sortItems(
  list: LibraryTvItem[],
  reviews: ReviewsMap,
  sortMode: SortMode,
): LibraryTvItem[] {
  return [...list].sort((a, b) => {
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
}

function reviewFor(item: LibraryTvItem, reviews: ReviewsMap) {
  return (
    reviews[item.id] ?? {
      rating: null,
      review: '',
      status: item.mine.status,
      updatedAt: null,
    }
  )
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

  useEffect(() => {
    if (statusFilter === 'current') onStatusFilter('all')
  }, [statusFilter, onStatusFilter])

  const currentItems = useMemo(() => {
    const list = items.filter((i) => showStatus(i, reviews) === 'current')
    return sortItems(list, reviews, 'rating')
  }, [items, reviews])

  const sorted = useMemo(() => {
    const list = items.filter((i) => {
      const status = showStatus(i, reviews)
      if (!matchesStatusFilter(status, statusFilter)) return false
      if (!matchesStreamingFilter(i, streamingFilter)) return false
      return true
    })
    return sortItems(list, reviews, sortMode)
  }, [items, reviews, statusFilter, streamingFilter, sortMode])

  return (
    <div className="collection">
      <section className="collection__section" aria-label="Current shows">
        <h2 className="collection__section-title">Current</h2>
        {currentItems.length > 0 ? (
          <div className="collection__grid collection__grid--current">
            {currentItems.map((item) => (
              <ShowCard
                key={`current-${item.id}`}
                item={item}
                review={reviewFor(item, reviews)}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <p className="collection__section-empty">
            Tag a show as Current to pin it here.
          </p>
        )}
      </section>

      <div className="collection__toolbar">
        <label className="collection__filter" htmlFor="sort-mode">
          <span className="collection__filter-label">Sort</span>
          <select
            id="sort-mode"
            className="collection__select"
            value={sortMode}
            onChange={(e) => onSortMode(e.target.value as SortMode)}
          >
            <option value="rating">By rating</option>
            <option value="streaming">By streaming service</option>
          </select>
        </label>

        <label className="collection__filter" htmlFor="status-filter">
          <span className="collection__filter-label">Status</span>
          <select
            id="status-filter"
            className="collection__select"
            value={statusFilter === 'current' ? 'all' : statusFilter}
            onChange={(e) => onStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">All</option>
            {FILTER_STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {streamingOptions.length > 0 ? (
          <label className="collection__filter" htmlFor="streaming-filter">
            <span className="collection__filter-label">Streaming</span>
            <select
              id="streaming-filter"
              className="collection__select"
              value={streamingFilter}
              onChange={(e) => onStreamingFilter(e.target.value)}
            >
              <option value="all">All services</option>
              {streamingOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {sorted.length === 0 ? (
        <p className="collection__empty">No shows in this list.</p>
      ) : (
        <div className="collection__grid">
          {sorted.map((item) => (
            <ShowCard
              key={`main-${item.id}`}
              item={item}
              review={reviewFor(item, reviews)}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
