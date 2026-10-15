import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Credentials } from '../types'
import { saveCredentials } from '../utils/storage'

interface LoginFormProps {
  onSuccess: (credentials: Credentials) => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [apiUrl, setApiUrl] = useState('')
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const credentials: Credentials = {
      apiUrl: apiUrl.trim().replace(/\/$/, ''),
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }
    saveCredentials(credentials)
    onSuccess(credentials)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo" aria-hidden>
            TG
          </div>
          <h1>GREEN-API Chat</h1>
          <p>Telegram через GREEN-API</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>apiUrl</span>
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://XXXX.api.green-api.com"
              required
              autoComplete="off"
            />
          </label>
          <label>
            <span>idInstance</span>
            <input
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              required
              autoComplete="off"
            />
          </label>
          <label>
            <span>apiTokenInstance</span>
            <input
              type="password"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              required
              autoComplete="off"
            />
          </label>
          <button type="submit">Войти</button>
        </form>

        <p className="login-hint">
          Параметры из{' '}
          <a
            href="https://console.green-api.com"
            target="_blank"
            rel="noreferrer"
          >
            консоли GREEN-API
          </a>
        </p>
      </div>
    </div>
  )
}
