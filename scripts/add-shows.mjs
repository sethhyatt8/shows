/**
 * One-off helper: append TV stubs to library.json (idempotent by id).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIBRARY_PATH = join(__dirname, '..', 'src', 'data', 'library.json')

const NEW_SHOWS = [
  ['gen-v', 'Gen V'],
  ['silo', 'Silo'],
  ['pluribus', 'Pluribus'],
  ['severance', 'Severance'],
  ['rick-and-morty', 'Rick and Morty'],
  ['bojack-horseman', 'BoJack Horseman'],
  ['ap-bio', 'AP Bio'],
  ['great-news', 'Great News'],
  ['nathan-for-you', 'Nathan For You'],
  ['the-rehearsal', 'The Rehearsal'],
  ['reno-911', 'Reno 911!'],
  ['newsradio', 'NewsRadio'],
  ['seinfeld', 'Seinfeld'],
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

function stub(id, title) {
  return {
    id,
    kind: 'tv',
    external: { tmdbId: null, searchQuery: title },
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
for (const [id, title] of NEW_SHOWS) {
  if (ids.has(id)) continue
  library.items.push(stub(id, title))
  ids.add(id)
  added++
}
writeFileSync(LIBRARY_PATH, `${JSON.stringify(library, null, 2)}\n`, 'utf8')
console.log(`Added ${added} show(s) to ${LIBRARY_PATH}`)
