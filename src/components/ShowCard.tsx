import type { LibraryTvItem } from '../types/library'
import { displayTitle, posterUrl } from '../lib/display'

type Props = {
  item: LibraryTvItem
}

export function ShowCard({ item }: Props) {
  const title = displayTitle(item)
  const poster = posterUrl(item)
  const genres = item.cached.genreNames
  const year = item.cached.firstAirYear
  const cast = item.cached.topCast
  const metaBits = [year, genres.slice(0, 3).join(' · ')].filter(Boolean)

  return (
    <article className="show-card">
      <div className="show-card__media">
        {poster ? (
          <img src={poster} alt={title} width={500} height={750} loading="lazy" />
        ) : (
          <div className="show-card__placeholder" aria-hidden>
            <span>{title.slice(0, 1)}</span>
          </div>
        )}
      </div>
      <div className="show-card__body">
        <h2 className="show-card__title">{title}</h2>
        {metaBits.length > 0 ? (
          <p className="show-card__meta">{metaBits.join(' · ')}</p>
        ) : null}
        {cast.length > 0 ? (
          <p className="show-card__cast">{cast.join(', ')}</p>
        ) : null}
        {item.mine.rating != null ? (
          <p className="show-card__rating">Rating: {item.mine.rating}/10</p>
        ) : null}
        {item.mine.notes ? (
          <p className="show-card__notes">{item.mine.notes}</p>
        ) : null}
      </div>
    </article>
  )
}
