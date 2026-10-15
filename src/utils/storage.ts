import type { Chat, ChatMessage, Credentials } from '../types'

const KEYS = {
  credentials: 'green-api-tg-credentials',
  chats: 'green-api-tg-chats',
  messages: 'green-api-tg-messages',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export const loadCredentials = () =>
  read<Credentials | null>(KEYS.credentials, null)

export const saveCredentials = (value: Credentials) =>
  localStorage.setItem(KEYS.credentials, JSON.stringify(value))

export const clearCredentials = () => localStorage.removeItem(KEYS.credentials)

export const loadChats = () => read<Chat[]>(KEYS.chats, [])

export const saveChats = (value: Chat[]) =>
  localStorage.setItem(KEYS.chats, JSON.stringify(value))

export const loadMessages = () =>
  read<Record<string, ChatMessage[]>>(KEYS.messages, {})

export const saveMessages = (value: Record<string, ChatMessage[]>) =>
  localStorage.setItem(KEYS.messages, JSON.stringify(value))
