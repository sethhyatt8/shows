/**
 * One-off helper: append TV stubs to library.json (idempotent by id).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIBRARY_PATH = join(__dirname, '..', 'src', 'data', 'library.json')

/** [id, searchQuery, displayTitle?] */
const NEW_SHOWS = [
  ['arrested-development', 'Arrested Development'],
  ['ozark', 'Ozark'],
  ['best-medicine', 'Best Medicine'],
  ['extras', 'Extras'],
  ['the-office-uk', 'The Office UK'],
  ['the-office-us', 'The Office US'],
  ['parks-and-recreation', 'Parks and Recreation'],
  ['derek', 'Derek'],
  ['taskmaster', 'Taskmaster'],
  ['flaked', 'Flaked'],
  ['upper-middle-bogan', 'Upper Middle Bogan'],
  ['colin-from-accounts', 'Colin From Accounts'],
  ['platonic', 'Platonic'],
  ['the-studio', 'The Studio'],
  ['foundation', 'Foundation'],
  ['see', 'See'],
]

const emptyCached = {
  title: null,
  overview: null,
  posterPath: null,
  backdropPath: null,
  genreNames: [],
  firstAirYear: null,
  topCast: [],
}

function stub(id, title, searchQuery = title) {
  return {
    id,
    kind: 'tv',
    external: { tmdbId: null, searchQuery },
    cached: { ...emptyCached },
    mine: {
      title,
      status: 'watching',
      rating: null,
      notes: '',
      tags: [],
    },
  }
}

const library = JSON.parse(readFileSync(LIBRARY_PATH, 'utf8'))
const ids = new Set(library.items.map((i) => i.id))
let added = 0
for (const row of NEW_SHOWS) {
  const [id, searchQuery, title = searchQuery] = row
  if (ids.has(id)) continue
  library.items.push(stub(id, title, searchQuery))
  ids.add(id)
  added++
}
writeFileSync(LIBRARY_PATH, `${JSON.stringify(library, null, 2)}\n`, 'utf8')
console.log(`Added ${added} show(s) to ${LIBRARY_PATH}`)
