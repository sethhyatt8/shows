export interface ShowReview {
  rating: number | null
  review: string
  updatedAt: string | null
}

export type ReviewsMap = Record<string, ShowReview>
