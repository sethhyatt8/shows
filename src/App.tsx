import { useMemo, useState } from 'react'
import libraryFile from './data/library.json'
import { PasswordGate } from './components/PasswordGate'
import { ShowCollection } from './components/ShowCollection'
import { ShowDetailModal } from './components/ShowDetailModal'
import { useReviews } from './hooks/useReviews'
import { isAppUnlocked, lockApp } from './lib/appAuth'
import { supabaseConfigured } from './lib/supabase'
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
  const [unlocked, setUnlocked] = useState(isAppUnlocked)

  if (!unlocked) {
    return <PasswordGate onUnlocked={() => setUnlocked(true)} />
  }

  return <ShowsApp onLock={() => { lockApp(); setUnlocked(false) }} />
}

function ShowsApp({ onLock }: { onLock: () => void }) {
  const tvItems = useMemo(
    () => library.items.filter(isTvItem),
    [],
  )

  const [statusFilter, setStatusFilter] = useState<
    'all' | WatchStatus
  >('all')

  const [selected, setSelected] = useState<LibraryTvItem | null>(null)
  const { reviews, getReview, saveReview, ready, error } = useReviews(true)

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-row">
          <h1 className="app__title">Shows</h1>
          <button type="button" className="app__lock" onClick={onLock}>
            Lock
          </button>
        </div>
        <p className="app__tagline">
          Click a poster to rate it (0–100) or leave a review. Ratings are saved
          online and stay in sync across your devices.
        </p>
        {!supabaseConfigured ? (
          <p className="app__banner app__banner--error">
            Cloud save is not configured on this build yet.
          </p>
        ) : null}
        {error ? (
          <p className="app__banner app__banner--error">
            Could not load reviews: {error}. If this is new, run the SQL in{' '}
            <code className="app__code">supabase/show-reviews.sql</code> in your
            Supabase project.
          </p>
        ) : null}
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
