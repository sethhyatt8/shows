import { useEffect, useMemo, useState } from 'react'
import libraryFile from './data/library.json'
import { EditPasswordPrompt } from './components/EditPasswordPrompt'
import {
  ShowCollection,
  type SortMode,
} from './components/ShowCollection'
import { ShowDetailModal } from './components/ShowDetailModal'
import { useReviews } from './hooks/useReviews'
import { isEditUnlocked, lockEditing } from './lib/appAuth'
import type { StatusFilter } from './lib/statuses'
import type {
  LibraryFile,
  LibraryItem,
  LibraryTvItem,
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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [streamingFilter, setStreamingFilter] = useState('all')
  const [sortMode, setSortMode] = useState<SortMode>('rating')

  const [selected, setSelected] = useState<LibraryTvItem | null>(null)
  const [canEdit, setCanEdit] = useState(isEditUnlocked)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)

  useEffect(() => {
    const sync = () => setCanEdit(isEditUnlocked())
    window.addEventListener('shows-edit-unlock', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('shows-edit-unlock', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const { reviews, getReview, saveReview, ready, error: reviewsError } =
    useReviews(true)

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
            Edit
          </button>
        )}
      </header>

      <main className="app__main">
        {reviewsError ? (
          <p className="app__cloud-error" role="alert">
            Could not load ratings from the cloud. Visitors may not see your
            latest scores until this is fixed. ({reviewsError})
          </p>
        ) : null}
        {!ready ? (
          <p className="collection__empty">Loading…</p>
        ) : (
          <ShowCollection
            items={tvItems}
            reviews={reviews}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            streamingFilter={streamingFilter}
            onStreamingFilter={setStreamingFilter}
            sortMode={sortMode}
            onSortMode={setSortMode}
            onSelect={setSelected}
          />
        )}
      </main>

      {selected ? (
        <ShowDetailModal
          item={selected}
          review={getReview(selected.id, selected.mine.status)}
          canEdit={canEdit}
          onRequestEdit={requestEdit}
          onClose={() => setSelected(null)}
          onSave={(id, patch) => saveReview(id, patch, selected.mine.status)}
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
