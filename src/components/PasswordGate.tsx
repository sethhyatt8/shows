import { useState, type FormEvent } from 'react'
import { checkPassword, passwordConfigured, unlockApp } from '../lib/appAuth'

type Props = {
  onUnlocked: () => void
}

export function PasswordGate({ onUnlocked }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!passwordConfigured()) {
      setError('This build is missing the site password. Add it in GitHub repository secrets.')
      return
    }
    if (!checkPassword(value)) {
      setError('Wrong password.')
      return
    }
    unlockApp()
    onUnlocked()
  }

  return (
    <div className="gate">
      <div className="gate__panel">
        <h1 className="gate__title">Shows</h1>
        <p className="gate__text">Enter your password to open your list and reviews.</p>
        <form className="gate__form" onSubmit={handleSubmit}>
          <label className="gate__label" htmlFor="gate-password">
            Password
          </label>
          <input
            id="gate-password"
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
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
