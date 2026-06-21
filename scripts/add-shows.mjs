/**
 * One-off helper: append TV stubs to library.json (idempotent by id).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIBRARY_PATH = join(__dirname, '..', 'src', 'data', 'library.json')

/** [id, searchQuery, displayTitle?, tmdbId?] */
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
  ['legends', 'Legends', 'Legends', 262280],
  ['outlaws', 'The Outlaws', 'The Outlaws', 136044],
  ['detroiters', 'Detroiters'],
  ['i-think-you-should-leave', 'I Think You Should Leave with Tim Robinson'],
  ['key-and-peele', 'Key & Peele'],
  ['the-handmaids-tale', "The Handmaid's Tale"],
  ['resident-alien', 'Resident Alien'],
  ['the-testaments', 'The Testaments'],
  ['mobland', 'MobLand'],
  ['boardwalk-empire', 'Boardwalk Empire'],
  ['battlestar-galactica', 'Battlestar Galactica', 'Battlestar Galactica (2004)', 1972],
  ['true-detective', 'True Detective'],
  ['the-white-lotus', 'The White Lotus'],
  ['game-of-thrones', 'Game of Thrones'],
  ['a-knight-of-the-seven-kingdoms', 'A Knight of the Seven Kingdoms'],
  ['house-of-the-dragon', 'House of the Dragon'],
  ['frayed', 'Frayed'],
  ['this-way-up', 'This Way Up'],
  ['game-face', 'GameFace', 'GameFace', 88471],
  ['fleabag', 'Fleabag'],
  ['peacemaker', 'Peacemaker'],
  ['boy-swallows-universe', 'Boy Swallows Universe'],
  ['flight-of-the-conchords', 'Flight of the Conchords'],
  ['alice-and-steve', 'Alice and Steve'],
  ['what-we-do-in-the-shadows', 'What We Do in the Shadows'],
  ['bad-monkey', 'Bad Monkey'],
  ['star-city', 'Star City'],
  ['maximum-pleasure-guaranteed', 'Maximum Pleasure Guaranteed'],
  ['invincible', 'Invincible'],
  ['archer', 'Archer'],
  ['narcos', 'Narcos'],
  ['narcos-mexico', 'Narcos: Mexico'],
  ['queen-of-the-south', 'Queen of the South'],
  ['versailles', 'Versailles'],
  ['masters-of-the-air', 'Masters of the Air'],
  ['half-man', 'Half Man'],
  ['bodkin', 'Bodkin'],
  ['the-last-man-on-earth', 'The Last Man on Earth'],
  ['3-body-problem', '3 Body Problem'],
  ['the-expanse', 'The Expanse'],
  ['patriot', 'Patriot', 'Patriot', 65495],
  ['katla', 'Katla'],
  ['dark', 'Dark', 'Dark', 70523],
  ['1923', '1923'],
  ['1883', '1883'],
  ['frontier', 'Frontier', 'Frontier', 67744],
  ['black-sails', 'Black Sails'],
  ['californication', 'Californication'],
  ['weeds', 'Weeds'],
  ['entourage', 'Entourage'],
  ['better-call-saul', 'Better Call Saul'],
  ['breaking-bad', 'Breaking Bad'],
  ['sons-of-anarchy', 'Sons of Anarchy'],
  ['babylon-berlin', 'Babylon Berlin'],
  ['fargo', 'Fargo'],
  ['the-big-bang-theory', 'The Big Bang Theory'],
  ['the-mandalorian', 'The Mandalorian'],
  ['wandavision', 'WandaVision'],
  ['obi-wan-kenobi', 'Obi-Wan Kenobi'],
  ['andor', 'Andor'],
  ['after-the-flood', 'After the Flood'],
  ['shetland', 'Shetland'],
  ['task', 'Task', 'Task', 228305],
  ['broadchurch', 'Broadchurch'],
  ['mare-of-easttown', 'Mare of Easttown'],
  ['killing-eve', 'Killing Eve'],
  ['the-night-manager', 'The Night Manager'],
  ['slow-horses', 'Slow Horses'],
  ['the-killing', 'The Killing', 'The Killing', 34415],
  ['hanna', 'Hanna'],
]

const emptyCached = {
  title: null,
  overview: null,
  posterPath: null,
  backdropPath: null,
  genreNames: [],
  firstAirYear: null,
  topCast: [],
  streamingProviders: [],
}

function stub(id, title, searchQuery = title, tmdbId = null) {
  return {
    id,
    kind: 'tv',
    external: { tmdbId, searchQuery },
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
  const [id, searchQuery, title = searchQuery, tmdbId = null] = row
  if (ids.has(id)) continue
  library.items.push(stub(id, title, searchQuery, tmdbId))
  ids.add(id)
  added++
}
writeFileSync(LIBRARY_PATH, `${JSON.stringify(library, null, 2)}\n`, 'utf8')
console.log(`Added ${added} show(s) to ${LIBRARY_PATH}`)
