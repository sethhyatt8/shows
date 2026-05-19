import type { LibraryTvItem } from '../types/library'
import type { ShowReview } from '../types/reviews'
import { displayTitle, posterUrl } from '../lib/display'

type Props = {
  item: LibraryTvItem
  review: ShowReview
  onSelect: (item: LibraryTvItem) => void
}

export function ShowCard({ item, review, onSelect }: Props) {
  const title = displayTitle(item)
  const poster = posterUrl(item)

  return (
    <article className="show-card">
      <button
        type="button"
        className="show-card__hit"
        onClick={() => onSelect(item)}
        aria-label={`${title}${review.rating != null ? `, rated ${review.rating}` : ''}`}
      >
        <div className="show-card__media">
          {poster ? (
            <img src={poster} alt="" width={200} height={300} loading="lazy" />
          ) : (
            <div className="show-card__placeholder" aria-hidden>
              <span>{title.slice(0, 1)}</span>
            </div>
          )}
          {review.rating != null ? (
            <span className="show-card__score">{review.rating}</span>
          ) : null}
        </div>
        <p className="show-card__title">{title}</p>
      </button>
    </article>
  )
}
