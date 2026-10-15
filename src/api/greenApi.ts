import type { Credentials, ReceiveNotificationResponse } from '../types'

function url(credentials: Credentials, method: string, extra = ''): string {
  const base = credentials.apiUrl.replace(/\/$/, '')
  return `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${extra}`
}

async function fail(response: Response): Promise<never> {
  const text = await response.text()
  let message = text || response.statusText
  try {
    const json = JSON.parse(text) as { message?: string }
    if (json.message) message = json.message
  } catch {
    console.error(text)
  }
  throw new Error(message)
}

export async function checkAccount(
  credentials: Credentials,
  phoneNumber: string,
): Promise<{ exist: boolean; chatId: string; username?: string }> {
  const response = await fetch(url(credentials, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: Number(phoneNumber.replace(/\D/g, '')),
    }),
  })
  if (!response.ok) await fail(response)
  return response.json()
}

export async function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
): Promise<{ idMessage: string }> {
  const response = await fetch(url(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  if (!response.ok) await fail(response)
  return response.json()
}

export async function receiveNotification(
  credentials: Credentials,
  receiveTimeout = 15,
  signal?: AbortSignal,
): Promise<ReceiveNotificationResponse> {
  const response = await fetch(
    `${url(credentials, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`,
    { signal },
  )
  if (!response.ok) await fail(response)
  const text = await response.text()
  if (!text || text === 'null') return null
  return JSON.parse(text) as ReceiveNotificationResponse
}

export async function deleteNotification(
  credentials: Credentials,
  receiptId: number,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(
    url(credentials, 'deleteNotification', `/${receiptId}`),
    { method: 'DELETE', signal },
  )
  if (!response.ok) await fail(response)
}
