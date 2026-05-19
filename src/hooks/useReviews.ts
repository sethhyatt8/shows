import { useCallback, useEffect, useState } from 'react'
import { isEditUnlocked } from '../lib/appAuth'
import {
  defaultEntry,
  mergeEntries,
  normalizeEntry,
  readLocalEntries,
  writeLocalEntries,
} from '../lib/reviewsStorage'
import { supabase } from '../lib/supabase'
import type { WatchStatus } from '../types/library'
import type { ReviewsMap, ShowReview } from '../types/reviews'

type ReviewRow = {
  show_id: string
  rating: number | null
  review: string
  status: string | null
  updated_at: string
}

function rowToEntry(row: ReviewRow): ShowReview {
  const status = row.status as WatchStatus
  return {
    rating: row.rating,
    review: row.review ?? '',
    status:
      status === 'watching' ||
      status === 'completed' ||
      status === 'dropped' ||
      status === 'queued' ||
      status === 'archived'
        ? status
        : 'watching',
    updatedAt: row.updated_at,
  }
}

function rowsToMap(rows: ReviewRow[]): ReviewsMap {
  const map: ReviewsMap = {}
  for (const row of rows) {
    map[row.show_id] = rowToEntry(row)
  }
  return map
}

async function fetchReviewsFromCloud(): Promise<{
  reviews: ReviewsMap
  error: string | null
}> {
  const { data, error: loadError } = await supabase
    .from('show_reviews')
    .select('show_id,rating,review,status,updated_at')

  if (loadError) {
    return { reviews: {}, error: loadError.message }
  }

  return { reviews: rowsToMap((data ?? []) as ReviewRow[]), error: null }
}

function cloudSaveHint(message: string): string {
  if (message.includes('does not exist') || message.includes('show_reviews')) {
    return 'Saved on this device only. The cloud table still needs to be created in Supabase (see supabase/show-reviews.sql).'
  }
  if (message.includes('status') && message.includes('column')) {
    return 'Saved on this device only. Add the status column in Supabase (re-run supabase/show-reviews.sql).'
  }
  return `Saved on this device only. Cloud error: ${message}`
}

export function useReviews(enabled: boolean) {
  const [reviews, setReviews] = useState<ReviewsMap>({})
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyLoaded = useCallback((cloud: ReviewsMap, cloudError: string | null) => {
    const local = readLocalEntries()
    const merged = mergeEntries(local, cloud)
    writeLocalEntries(merged)
    setReviews(merged)
    setError(cloudError)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    void fetchReviewsFromCloud().then((result) => {
      if (!cancelled) applyLoaded(result.reviews, result.error)
    })

    return () => {
      cancelled = true
    }
  }, [enabled, applyLoaded])

  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel('show-reviews')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'show_reviews' },
        () => {
          void fetchReviewsFromCloud().then((result) =>
            applyLoaded(result.reviews, result.error),
          )
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [enabled, applyLoaded])

  const getReview = useCallback(
    (showId: string, fallbackStatus: WatchStatus = 'watching'): ShowReview => {
      const entry = reviews[showId]
      if (entry) return entry
      return defaultEntry(fallbackStatus)
    },
    [reviews],
  )

  const saveReview = useCallback(
    async (
      showId: string,
      patch: Partial<Pick<ShowReview, 'rating' | 'review' | 'status'>>,
      fallbackStatus: WatchStatus = 'watching',
    ) => {
      if (!isEditUnlocked()) {
        throw new Error('Click Edit and enter the password before saving.')
      }

      const existing = reviews[showId] ?? defaultEntry(fallbackStatus)
      const entry = normalizeEntry(patch, existing)

      const next = { ...reviews, [showId]: entry }
      setReviews(next)
      writeLocalEntries(next)

      const { error: saveError } = await supabase.from('show_reviews').upsert({
        show_id: showId,
        rating: entry.rating,
        review: entry.review,
        status: entry.status,
        updated_at: entry.updatedAt,
      })

      if (saveError) {
        throw new Error(cloudSaveHint(saveError.message))
      }

      return entry
    },
    [reviews],
  )

  return { reviews, getReview, saveReview, ready, error }
}
