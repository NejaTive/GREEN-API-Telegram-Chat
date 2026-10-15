import { useState } from 'react'
import type { FormEvent } from 'react'
import { checkAccount } from '../api/greenApi'
import type { Chat, Credentials } from '../types'
import { formatPhone } from '../utils/format'

interface NewChatModalProps {
  credentials: Credentials
  onClose: () => void
  onCreate: (chat: Chat) => void
}

export function NewChatModal({
  credentials,
  onClose,
  onCreate,
}: NewChatModalProps) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const digits = formatPhone(phone)
    if (digits.length < 10) {
      setError('Введите номер, например 79001234567')
      setLoading(false)
      return
    }

    try {
      const account = await checkAccount(credentials, digits)
      if (!account.exist || !account.chatId) {
        throw new Error('Аккаунт Telegram не найден')
      }
      const username = account.username?.replace(/^@/, '')
      onCreate({
        chatId: String(account.chatId),
        name: username ? `@${username}` : `+${digits}`,
        phone: digits,
        lastTimestamp: Math.floor(Date.now() / 1000),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>Новый чат</h2>
        <p className="modal-subtitle">Номер в международном формате</p>
        <form onSubmit={handleSubmit}>
          <label>
            <span>Телефон</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="79001234567"
              autoFocus
              required
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Поиск…' : 'Начать чат'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
