import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { sendMessage } from '../api/greenApi'
import type { Chat, ChatMessage, Credentials } from '../types'
import { avatarLetter, formatTime } from '../utils/format'

interface ChatWindowProps {
  credentials: Credentials
  chat: Chat | null
  messages: ChatMessage[]
  onMessageSent: (message: ChatMessage) => void
  onBack?: () => void
}

export function ChatWindow({
  credentials,
  chat,
  messages,
  onMessageSent,
  onBack,
}: ChatWindowProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chat?.chatId])

  if (!chat) {
    return (
      <section className="chat-window empty-window">
        <div className="empty-window-content">
          <h2>Выберите чат</h2>
          <p>Или создайте новый по номеру телефона</p>
        </div>
      </section>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const message = text.trim()
    if (!message || sending) return

    setSending(true)
    setError('')
    try {
      const { idMessage } = await sendMessage(credentials, chat.chatId, message)
      onMessageSent({
        id: idMessage,
        chatId: chat.chatId,
        text: message,
        timestamp: Math.floor(Date.now() / 1000),
        direction: 'outgoing',
      })
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        {onBack && (
          <button
            type="button"
            className="back-btn"
            onClick={onBack}
            aria-label="Назад"
          >
            ←
          </button>
        )}
        <div className="avatar">{avatarLetter(chat.name)}</div>
        <div className="chat-profile">
          <strong>{chat.name}</strong>
          {chat.phone && <span className="chat-subtitle">+{chat.phone}</span>}
        </div>
      </header>

      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className={`bubble-row ${message.direction}`}>
            <div className={`bubble ${message.direction}`}>
              <p>{message.text}</p>
              <time>{formatTime(message.timestamp)}</time>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <div className="send-error">{error}</div>}

      <form className="composer" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение"
          maxLength={4096}
          disabled={sending}
        />
        <button type="submit" disabled={sending || !text.trim()}>
          {sending ? '…' : '➤'}
        </button>
      </form>
    </section>
  )
}
