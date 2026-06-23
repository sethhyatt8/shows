import { useMemo } from 'react'
import type { LibraryTvItem, WatchStatus } from '../types/library'
import type { ReviewsMap } from '../types/reviews'
import {
  collectStreamingProviders,
  hasStreamingProvider,
  primaryStreamingProvider,
} from '../lib/streaming'
import { displayTitle } from '../lib/display'
import { WATCH_STATUS_OPTIONS } from '../lib/statuses'
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

  const currentItems = useMemo(() => {
    const list = items.filter(
      (i) =>
        showStatus(i, reviews) === 'current' &&
        matchesStreamingFilter(i, streamingFilter),
    )
    return sortItems(list, reviews, sortMode)
  }, [items, reviews, streamingFilter, sortMode])

  const sorted = useMemo(() => {
    const list = items.filter((i) => {
      if (showStatus(i, reviews) === 'current') return false
      if (statusFilter !== 'all' && showStatus(i, reviews) !== statusFilter) {
        return false
      }
      if (!matchesStreamingFilter(i, streamingFilter)) return false
      return true
    })
    return sortItems(list, reviews, sortMode)
  }, [items, reviews, statusFilter, streamingFilter, sortMode])

  return (
    <div className="collection">
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
            value={statusFilter}
            onChange={(e) => onStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">All</option>
            {WATCH_STATUS_OPTIONS.filter(({ value }) => value !== 'current').map(
              ({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
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

      {currentItems.length > 0 ? (
        <section className="collection__section" aria-label="Current shows">
          <h2 className="collection__section-title">Current</h2>
          <div className="collection__grid collection__grid--current">
            {currentItems.map((item) => (
              <ShowCard
                key={item.id}
                item={item}
                review={reviewFor(item, reviews)}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      ) : null}

      {sorted.length === 0 && currentItems.length === 0 ? (
        <p className="collection__empty">No shows in this list.</p>
      ) : sorted.length > 0 ? (
        <div className="collection__grid">
          {sorted.map((item) => (
            <ShowCard
              key={item.id}
              item={item}
              review={reviewFor(item, reviews)}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
