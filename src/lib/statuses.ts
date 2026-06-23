import type { WatchStatus } from '../types/library'

export type StatusFilter = 'all' | WatchStatus

export const WATCH_STATUS_OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: 'watching', label: 'Watching' },
  { value: 'current', label: 'Current' },
  { value: 'new-season-soon', label: 'New Season Soon' },
  { value: 'completed', label: 'Completed Recently' },
  { value: 'queued', label: 'Queued' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'archived', label: 'Archived' },
]

export const WATCH_STATUS_LABEL: Record<WatchStatus, string> = Object.fromEntries(
  WATCH_STATUS_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<WatchStatus, string>

export function watchStatusLabel(status: WatchStatus): string {
  return WATCH_STATUS_LABEL[status] ?? status
}

/** Status options shown in the main library filter (Current has its own section). */
export const FILTER_STATUS_OPTIONS = WATCH_STATUS_OPTIONS.filter(
  ({ value }) => value !== 'current',
)

export function matchesStatusFilter(
  status: WatchStatus,
  filter: StatusFilter,
): boolean {
  if (filter === 'all') return true
  if (status === filter) return true
  if (
    filter === 'watching' &&
    (status === 'current' || status === 'new-season-soon')
  ) {
    return true
  }
  return false
}
