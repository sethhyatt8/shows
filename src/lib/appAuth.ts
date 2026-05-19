const SESSION_KEY = 'shows-edit-unlocked'

export function isEditUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function unlockEditing(): void {
  sessionStorage.setItem(SESSION_KEY, '1')
}

export function lockEditing(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function checkPassword(input: string): boolean {
  const expected = (import.meta.env.VITE_APP_PASSWORD || '').trim()
  if (!expected) return false
  return input.trim() === expected
}

export function passwordConfigured(): boolean {
  return Boolean((import.meta.env.VITE_APP_PASSWORD || '').trim())
}
