import { useEffect, useState, type FormEvent } from 'react'
import {
  checkPassword,
  passwordConfigured,
  unlockEditing,
} from '../lib/appAuth'

type Props = {
  onClose: () => void
  onUnlocked: () => void
}

export function EditPasswordPrompt({ onClose, onUnlocked }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!passwordConfigured()) {
      setError('Editing is not configured on this build yet.')
      return
    }
    if (!checkPassword(value)) {
      setError('Wrong password.')
      return
    }
    unlockEditing()
    onUnlocked()
    onClose()
  }

  return (
    <div className="modal" role="presentation" onClick={onClose}>
      <div
        className="modal__panel gate__panel gate__panel--compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-password-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 id="edit-password-title" className="gate__title">
          Edit reviews
        </h2>
        <p className="gate__text">
          Enter your password to change ratings and reviews. Everyone can still
          read the site without signing in.
        </p>
        <form className="gate__form" onSubmit={handleSubmit}>
          <label className="gate__label" htmlFor="edit-password">
            Password
          </label>
          <input
            id="edit-password"
            className="gate__input"
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError('')
            }}
          />
          {error ? (
            <p className="gate__error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="gate__submit">
            Unlock editing
          </button>
        </form>
      </div>
    </div>
  )
}
