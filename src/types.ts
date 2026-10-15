export type Credentials = {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

export type ChatMessage = {
  id: string
  chatId: string
  text: string
  timestamp: number
  direction: 'incoming' | 'outgoing'
}

export type Chat = {
  chatId: string
  name: string
  phone?: string
  lastMessage?: string
  lastTimestamp?: number
}

export type NotificationBody = {
  typeWebhook: string
  timestamp: number
  idMessage: string
  senderData?: {
    chatId: string
    chatName?: string
    senderName?: string
    senderContactName?: string
    senderPhoneNumber?: number
  }
  messageData?: {
    typeMessage: string
    textMessageData?: { textMessage: string }
    extendedTextMessageData?: { text: string }
  }
}

export type ReceiveNotificationResponse = {
  receiptId: number
  body: NotificationBody
} | null
