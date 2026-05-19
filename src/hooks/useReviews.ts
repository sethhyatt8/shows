import { useCallback, useEffect, useState } from 'react'
import { normalizeEntry } from '../lib/reviewsStorage'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type { ReviewsMap, ShowReview } from '../types/reviews'

const EMPTY_REVIEW: ShowReview = {
  rating: null,
  review: '',
  updatedAt: null,
}

type ReviewRow = {
  show_id: string
  rating: number | null
  review: string
  updated_at: string
}

function rowsToMap(rows: ReviewRow[]): ReviewsMap {
  const map: ReviewsMap = {}
  for (const row of rows) {
    map[row.show_id] = {
      rating: row.rating,
      review: row.review ?? '',
      updatedAt: row.updated_at,
    }
  }
  return map
}

async function fetchReviewsFromCloud(): Promise<{
  reviews: ReviewsMap
  error: string | null
}> {
  if (!supabaseConfigured || !supabase) {
    return { reviews: {}, error: null }
  }

  const { data, error: loadError } = await supabase
    .from('show_reviews')
    .select('show_id,rating,review,updated_at')

  if (loadError) {
    return { reviews: {}, error: loadError.message }
  }

  return { reviews: rowsToMap((data ?? []) as ReviewRow[]), error: null }
}

export function useReviews(enabled: boolean) {
  const [reviews, setReviews] = useState<ReviewsMap>({})
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyCloudResult = useCallback(
    (result: { reviews: ReviewsMap; error: string | null }) => {
      setReviews(result.reviews)
      setError(result.error)
      setReady(true)
    },
    [],
  )

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    void fetchReviewsFromCloud().then((result) => {
      if (!cancelled) applyCloudResult(result)
    })

    return () => {
      cancelled = true
    }
  }, [enabled, applyCloudResult])

  useEffect(() => {
    const client = supabase
    if (!enabled || !supabaseConfigured || !client) return

    const channel = client
      .channel('show-reviews')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'show_reviews' },
        () => {
          void fetchReviewsFromCloud().then(applyCloudResult)
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [enabled, applyCloudResult])

  const saveReview = useCallback(
    async (
      showId: string,
      patch: Partial<Pick<ShowReview, 'rating' | 'review'>>,
    ) => {
      if (!supabaseConfigured || !supabase) {
        throw new Error('Supabase is not configured for this build.')
      }

      const existing = reviews[showId] ?? EMPTY_REVIEW
      const entry = normalizeEntry(patch, existing)

      const { error: saveError } = await supabase.from('show_reviews').upsert({
        show_id: showId,
        rating: entry.rating,
        review: entry.review,
        updated_at: entry.updatedAt,
      })

      if (saveError) throw new Error(saveError.message)

      setReviews((prev) => ({ ...prev, [showId]: entry }))
      return entry
    },
    [reviews],
  )

  const getReview = useCallback(
    (showId: string): ShowReview => reviews[showId] ?? EMPTY_REVIEW,
    [reviews],
  )

  return { reviews, getReview, saveReview, ready, error }
}
