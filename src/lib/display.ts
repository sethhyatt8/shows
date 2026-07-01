import type { LibraryTvItem } from '../types/library'

const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w185'

export function posterUrl(item: LibraryTvItem): string | null {
  const p = item.cached.posterPath
  if (!p) return null
  return `${TMDB_IMAGE}${p}`
}

export function displayTitle(item: LibraryTvItem): string {
  return item.mine.title || item.cached.title || 'Untitled'
}
