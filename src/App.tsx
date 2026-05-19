import { useMemo, useState } from 'react'
import libraryFile from './data/library.json'
import { EditPasswordPrompt } from './components/EditPasswordPrompt'
import { HomeBlock } from './components/HomeBlock'
import { ShowCollection } from './components/ShowCollection'
import { ShowDetailModal } from './components/ShowDetailModal'
import { useReviews } from './hooks/useReviews'
import { isEditUnlocked, lockEditing } from './lib/appAuth'
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
  const tvItems = useMemo(
    () => library.items.filter(isTvItem),
    [],
  )

  const [statusFilter, setStatusFilter] = useState<
    'all' | WatchStatus
  >('all')

  const [selected, setSelected] = useState<LibraryTvItem | null>(null)
  const [canEdit, setCanEdit] = useState(isEditUnlocked)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)

  const { reviews, getReview, saveReview, ready, error } = useReviews(true)

  function requestEdit() {
    if (canEdit) return
    setShowPasswordPrompt(true)
  }

  function stopEditing() {
    lockEditing()
    setCanEdit(false)
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-row">
          <h1 className="app__title">Shows</h1>
          {canEdit ? (
            <button type="button" className="app__lock" onClick={stopEditing}>
              Stop editing
            </button>
          ) : (
            <button
              type="button"
              className="app__lock"
              onClick={() => setShowPasswordPrompt(true)}
            >
              Edit reviews
            </button>
          )}
        </div>
        <p className="app__tagline">
          Browse everyone’s ratings and reviews. Use <strong>Edit reviews</strong>{' '}
          (password) to change yours.
        </p>
        {!supabaseConfigured ? (
          <p className="app__banner app__banner--error">
            Cloud save is not configured on this build yet.
          </p>
        ) : null}
        {error ? (
          <p className="app__banner app__banner--error">
            Could not load reviews: {error}
          </p>
        ) : null}
      </header>

      <HomeBlock />

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
          canEdit={canEdit}
          onRequestEdit={requestEdit}
          onClose={() => setSelected(null)}
          onSave={saveReview}
        />
      ) : null}

      {showPasswordPrompt ? (
        <EditPasswordPrompt
          onClose={() => setShowPasswordPrompt(false)}
          onUnlocked={() => setCanEdit(true)}
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
