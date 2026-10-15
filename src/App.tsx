import { useCallback, useState } from 'react'
import { ChatSidebar } from './components/ChatSidebar'
import { ChatWindow } from './components/ChatWindow'
import { LoginForm } from './components/LoginForm'
import { NewChatModal } from './components/NewChatModal'
import { useNotificationPolling } from './hooks/useNotificationPolling'
import type { Chat, ChatMessage, Credentials } from './types'
import {
  clearCredentials,
  loadChats,
  loadCredentials,
  loadMessages,
  saveChats,
  saveMessages,
} from './utils/storage'

function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(() =>
    loadCredentials(),
  )
  const [chats, setChats] = useState<Chat[]>(() => loadChats())
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, ChatMessage[]>
  >(() => loadMessages())
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)

  const appendMessage = useCallback(
    (message: ChatMessage, meta?: { chatName?: string; phone?: string }) => {
      setMessagesByChat((prev) => {
        const list = prev[message.chatId] ?? []
        if (list.some((item) => item.id === message.id)) return prev
        const next = { ...prev, [message.chatId]: [...list, message] }
        saveMessages(next)
        return next
      })

      setChats((prev) => {
        const existing =
          prev.find((chat) => chat.chatId === message.chatId) ??
          (meta?.phone
            ? prev.find((chat) => chat.phone === meta.phone)
            : undefined)

        if (existing && existing.chatId !== message.chatId) {
          setActiveChatId((current) =>
            current === existing.chatId ? message.chatId : current,
          )
        }

        const updated: Chat = {
          chatId: message.chatId,
          name: existing?.name || meta?.chatName || message.chatId,
          phone: existing?.phone || meta?.phone,
          lastMessage: message.text,
          lastTimestamp: message.timestamp,
        }

        const base =
          existing && existing.chatId !== message.chatId
            ? prev.filter((chat) => chat.chatId !== existing.chatId)
            : prev

        const next = base.some((chat) => chat.chatId === message.chatId)
          ? base.map((chat) =>
              chat.chatId === message.chatId ? { ...chat, ...updated } : chat,
            )
          : [updated, ...base]

        saveChats(next)
        return next
      })
    },
    [],
  )

  useNotificationPolling(credentials, { onIncomingMessage: appendMessage })

  if (!credentials) {
    return <LoginForm onSuccess={setCredentials} />
  }

  const activeChat = chats.find((chat) => chat.chatId === activeChatId) ?? null

  return (
    <div className="app-shell">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelect={setActiveChatId}
        onNewChat={() => setShowNewChat(true)}
        onLogout={() => {
          clearCredentials()
          setCredentials(null)
          setActiveChatId(null)
        }}
      />
      <ChatWindow
        credentials={credentials}
        chat={activeChat}
        messages={activeChatId ? (messagesByChat[activeChatId] ?? []) : []}
        onMessageSent={appendMessage}
        onBack={() => setActiveChatId(null)}
      />
      {showNewChat && (
        <NewChatModal
          credentials={credentials}
          onClose={() => setShowNewChat(false)}
          onCreate={(chat) => {
            setChats((prev) => {
              const next = prev.some((item) => item.chatId === chat.chatId)
                ? prev.map((item) =>
                    item.chatId === chat.chatId ? { ...item, ...chat } : item,
                  )
                : [chat, ...prev]
              saveChats(next)
              return next
            })
            setActiveChatId(chat.chatId)
          }}
        />
      )}
    </div>
  )
}

export default App
