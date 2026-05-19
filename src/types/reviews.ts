import type { WatchStatus } from './library'

export interface ShowReview {
  rating: number | null
  review: string
  status: WatchStatus
  updatedAt: string | null
}

export type ReviewsMap = Record<string, ShowReview>
