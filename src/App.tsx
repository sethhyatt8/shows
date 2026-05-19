import { useMemo, useState } from 'react'
import libraryFile from './data/library.json'
import { ShowCollection } from './components/ShowCollection'
import { ShowDetailModal } from './components/ShowDetailModal'
import { useReviews } from './hooks/useReviews'
import type {
  LibraryFile,
  LibraryItem,
  LibraryTvItem,
  WatchStatus,
} from './types/library'
import './App.css'

const library = libraryFile as LibraryFile

function isTvItem(item: LibraryItem): item is LibraryTvItem {
  return item.kind === 'tv'
}

export default function App() {
  const tvItems = useMemo(
    () => library.items.filter(isTvItem),
    [],
  )

  const [statusFilter, setStatusFilter] = useState<
    'all' | WatchStatus
  >('all')

  const [selected, setSelected] = useState<LibraryTvItem | null>(null)
  const { reviews, getReview, saveReview, ready } = useReviews()

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Shows</h1>
        <p className="app__tagline">
          Click a poster to rate it (0–100) or leave a short review. Your ratings
          are saved in this browser automatically.
        </p>
      </header>

      <main className="app__main">
        {!ready ? (
          <p className="collection__empty">Loading…</p>
        ) : (
          <ShowCollection
            items={tvItems}
            reviews={reviews}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onSelect={setSelected}
          />
        )}
      </main>

      {selected ? (
        <ShowDetailModal
          item={selected}
          review={getReview(selected.id)}
          onClose={() => setSelected(null)}
          onSave={saveReview}
        />
      ) : null}

      <footer className="app__footer">
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer"
        >
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </a>
      </footer>
    </div>
  )
}
