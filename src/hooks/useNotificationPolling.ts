import { useEffect, useRef } from 'react'
import { deleteNotification, receiveNotification } from '../api/greenApi'
import type { ChatMessage, Credentials, NotificationBody } from '../types'

const RECEIVE_TIMEOUT_SEC = 15

type Handlers = {
  onIncomingMessage: (
    message: ChatMessage,
    meta: { chatName?: string; phone?: string },
  ) => void
}

function extractText(body: NotificationBody): string | null {
  const data = body.messageData
  if (!data) return null
  if (data.typeMessage === 'textMessage') {
    return data.textMessageData?.textMessage ?? null
  }
  if (data.typeMessage === 'extendedTextMessage') {
    return data.extendedTextMessageData?.text ?? null
  }
  return null
}

function isAbort(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const id = window.setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

export function useNotificationPolling(
  credentials: Credentials | null,
  handlers: Handlers,
) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!credentials) return

    const controller = new AbortController()
    const { signal } = controller

    const poll = async () => {
      while (!signal.aborted) {
        const started = Date.now()
        try {
          const notification = await receiveNotification(
            credentials,
            RECEIVE_TIMEOUT_SEC,
            signal,
          )
          if (signal.aborted) break

          if (notification) {
            const { receiptId, body } = notification
            if (body.typeWebhook === 'incomingMessageReceived') {
              const text = extractText(body)
              const chatId = body.senderData?.chatId
              if (text && chatId) {
                handlersRef.current.onIncomingMessage(
                  {
                    id: body.idMessage,
                    chatId,
                    text,
                    timestamp: body.timestamp,
                    direction: 'incoming',
                  },
                  {
                    chatName:
                      body.senderData?.senderName ||
                      body.senderData?.chatName ||
                      body.senderData?.senderContactName,
                    phone: body.senderData?.senderPhoneNumber
                      ? String(body.senderData.senderPhoneNumber)
                      : undefined,
                  },
                )
              }
            }
            await deleteNotification(credentials, receiptId, signal)
            continue
          }

          const wait = RECEIVE_TIMEOUT_SEC * 1000 - (Date.now() - started)
          if (wait > 0) await sleep(wait, signal)
        } catch (error) {
          if (signal.aborted || isAbort(error)) break
          console.error(error)
          try {
            await sleep(3000, signal)
          } catch {
            break
          }
        }
      }
    }

    void poll()
    return () => controller.abort()
  }, [credentials])
}
