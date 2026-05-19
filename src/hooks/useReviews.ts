import { useCallback, useEffect, useState } from 'react'
import {
  fetchSeedReviews,
  mergeReviews,
  normalizeEntry,
  readStoredReviews,
  writeStoredReviews,
} from '../lib/reviewsStorage'
import type { ReviewsMap, ShowReview } from '../types/reviews'

const EMPTY_REVIEW: ShowReview = {
  rating: null,
  review: '',
  updatedAt: null,
}

export function useReviews() {
  const [reviews, setReviews] = useState<ReviewsMap>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const stored = readStoredReviews()
      if (Object.keys(stored).length > 0) {
        if (!cancelled) {
          setReviews(stored)
          setReady(true)
        }
        return
      }
      const seed = await fetchSeedReviews()
      const merged = mergeReviews(seed, stored)
      writeStoredReviews(merged)
      if (!cancelled) {
        setReviews(merged)
        setReady(true)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const saveReview = useCallback(
    async (
      showId: string,
      patch: Partial<Pick<ShowReview, 'rating' | 'review'>>,
    ) => {
      const existing = readStoredReviews()[showId] ?? EMPTY_REVIEW
      const entry = normalizeEntry(patch, existing)
      setReviews((prev) => {
        const next = { ...prev, [showId]: entry }
        writeStoredReviews(next)
        return next
      })
      return entry
    },
    [],
  )

  const getReview = useCallback(
    (showId: string): ShowReview => reviews[showId] ?? EMPTY_REVIEW,
    [reviews],
  )

  return { reviews, getReview, saveReview, ready }
}
