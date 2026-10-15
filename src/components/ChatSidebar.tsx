import type { Chat } from '../types'
import { avatarLetter, formatTime } from '../utils/format'

interface ChatSidebarProps {
  chats: Chat[]
  activeChatId: string | null
  onSelect: (chatId: string) => void
  onNewChat: () => void
  onLogout: () => void
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelect,
  onNewChat,
  onLogout,
}: ChatSidebarProps) {
  const sorted = [...chats].sort(
    (a, b) => (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0),
  )

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div>
          <strong>Чаты</strong>
          <span className="sidebar-badge">Telegram</span>
        </div>
        <div className="sidebar-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={onNewChat}
            title="Новый чат"
          >
            +
          </button>
          <button type="button" className="text-btn" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </header>

      <div className="chat-list">
        {sorted.length === 0 && (
          <div className="empty-chats">
            Нет чатов. Нажмите «+», чтобы начать переписку.
          </div>
        )}

        {sorted.map((chat) => (
          <button
            key={chat.chatId}
            type="button"
            className={`chat-item ${activeChatId === chat.chatId ? 'active' : ''}`}
            onClick={() => onSelect(chat.chatId)}
          >
            <div className="avatar">{avatarLetter(chat.name)}</div>
            <div className="chat-item-body">
              <div className="chat-item-top">
                <span className="chat-name">{chat.name}</span>
                {chat.lastTimestamp != null && (
                  <span className="chat-time">
                    {formatTime(chat.lastTimestamp)}
                  </span>
                )}
              </div>
              <div className="chat-preview">
                {chat.lastMessage ||
                  (chat.phone ? `+${chat.phone}` : 'Нет сообщений')}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}
