/** Stays unlocked until you click Stop editing (localStorage, all tabs). */
const UNLOCK_KEY = 'shows-edit-unlocked'

/**
 * SHA-256 of the site edit password. Lets editing work on GitHub Pages even when
 * VITE_APP_PASSWORD is not in build secrets. Not high security — deters casual edits.
 */
const FALLBACK_PASSWORD_SHA256 =
  '399355b940cf3f92dcd927d5ed47f9933d7a85a444509faf68e6b9c1c9577ad8'

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function isEditUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

export function unlockEditing(): void {
  localStorage.setItem(UNLOCK_KEY, '1')
  window.dispatchEvent(new Event('shows-edit-unlock'))
}

export function lockEditing(): void {
  localStorage.removeItem(UNLOCK_KEY)
  window.dispatchEvent(new Event('shows-edit-unlock'))
}

export function passwordConfigured(): boolean {
  const fromEnv = (import.meta.env.VITE_APP_PASSWORD || '').trim()
  return Boolean(fromEnv || FALLBACK_PASSWORD_SHA256)
}

export async function checkPassword(input: string): Promise<boolean> {
  const trimmed = input.trim()
  if (!trimmed) return false

  const fromEnv = (import.meta.env.VITE_APP_PASSWORD || '').trim()
  if (fromEnv) return trimmed === fromEnv

  const hash = await sha256(trimmed)
  return hash === FALLBACK_PASSWORD_SHA256
}
