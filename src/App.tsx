import { useMemo, useState } from 'react'
import libraryFile from './data/library.json'
import { ShowCollection } from './components/ShowCollection'
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
  >('watching')

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Shows</h1>
        <p className="app__tagline">
          TV you are tracking — metadata from TMDB after you run{' '}
          <code className="app__code">npm run enrich</code>.
        </p>
      </header>

      <main className="app__main">
        <ShowCollection
          items={tvItems}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
        />
      </main>

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
