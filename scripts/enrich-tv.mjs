/**
 * Fetches TMDB metadata for TV rows in src/data/library.json and writes
 * cached fields + external.tmdbId (after search). Requires TMDB_API_KEY in
 * environment or a repo-root .env file (not committed).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LIBRARY_PATH = join(ROOT, 'src', 'data', 'library.json')

function loadDotEnv() {
  try {
    const raw = readFileSync(join(ROOT, '.env'), 'utf8')
    const out = {}
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i === -1) continue
      const key = t.slice(0, i).trim()
      let val = t.slice(i + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      out[key] = val
    }
    return out
  } catch {
    return {}
  }
}

const env = { ...loadDotEnv(), ...process.env }
const API_KEY = env.TMDB_API_KEY
if (!API_KEY) {
  console.error(
    'Missing TMDB_API_KEY. Copy .env.example to .env and add your TMDB v3 key.',
  )
  process.exit(1)
}

const BASE = 'https://api.themoviedb.org/3'

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function tmdbGet(path) {
  const url = new URL(BASE + path)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('language', 'en-US')
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`${path}: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

async function searchTv(query) {
  const url = new URL(`${BASE}/search/tv`)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('language', 'en-US')
  url.searchParams.set('query', query)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`search/tv: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

function yearFromDate(d) {
  if (!d || typeof d !== 'string') return null
  const y = d.slice(0, 4)
  return y || null
}

async function enrichItem(item) {
  if (item.kind !== 'tv') return item

  let id = item.external.tmdbId

  if (id == null) {
    const q = item.external.searchQuery || item.mine.title
    const search = await searchTv(q)
    await sleep(250)
    const first = search.results?.[0]
    if (!first) {
      console.warn(`No TMDB results for "${q}" (${item.id})`)
      return item
    }
    id = first.id
    console.warn(
      `Search "${q}" → "${first.name}" (tmdb ${first.id}, first_air_date=${first.first_air_date ?? 'n/a'}). Verify external.tmdbId in library.json.`,
    )
  }

  const [details, credits] = await Promise.all([
    tmdbGet(`/tv/${id}`),
    tmdbGet(`/tv/${id}/credits`),
  ])
  await sleep(250)

  const topCast = (credits.cast || [])
    .slice(0, 5)
    .map((c) => c.name)
    .filter(Boolean)

  const genreNames = (details.genres || []).map((g) => g.name)

  return {
    ...item,
    external: {
      ...item.external,
      tmdbId: id,
      searchQuery: item.external.searchQuery || item.mine.title,
    },
    cached: {
      title: details.name || null,
      overview: details.overview || null,
      posterPath: details.poster_path || null,
      backdropPath: details.backdrop_path || null,
      genreNames,
      firstAirYear: yearFromDate(details.first_air_date),
      topCast,
    },
  }
}

async function main() {
  const library = JSON.parse(readFileSync(LIBRARY_PATH, 'utf8'))
  const out = []
  for (const item of library.items) {
    out.push(await enrichItem(item))
  }
  library.items = out
  writeFileSync(LIBRARY_PATH, `${JSON.stringify(library, null, 2)}\n`, 'utf8')
  console.log('Updated', LIBRARY_PATH)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
