import type { WatchStatus } from '../types/library'

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
