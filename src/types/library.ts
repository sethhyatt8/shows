export type WatchStatus =
  | 'watching'
  | 'completed'
  | 'dropped'
  | 'queued'
  | 'archived'

export interface LibraryTvCached {
  title: string | null
  overview: string | null
  posterPath: string | null
  backdropPath: string | null
  genreNames: string[]
  firstAirYear: string | null
  topCast: string[]
}

export interface LibraryTvExternal {
  tmdbId: number | null
  /** Used when `tmdbId` is missing; passed to TMDB search */
  searchQuery: string
}

export interface LibraryMine {
  title: string
  status: WatchStatus
  /** Legacy; prefer server reviews (0–100) */
  rating: number | null
  notes: string
  tags: string[]
}

export interface LibraryTvItem {
  id: string
  kind: 'tv'
  external: LibraryTvExternal
  cached: LibraryTvCached
  mine: LibraryMine
}

export type LibraryItem = LibraryTvItem

export interface LibraryFile {
  version: number
  items: LibraryItem[]
}
